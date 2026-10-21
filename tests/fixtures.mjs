// Shared fixture support for the reviewer evaluation cases.
//
// `tests/fixtures/reviewer/<case-dir>/` is a sample project used to evaluate the
// Reviewer agent on a realistic repository. The same cases serve two consumers:
//
//   * `tests/fixtures.test.mjs`  -- static: validates the case contract and the
//     hunk files without touching git or the network;
//   * `tests/eval/run-eval.mjs`  -- live: materializes each case into a temporary
//     git repository and runs the agent against it, capturing its output.
//
// A case directory holds the project sources (`README.md`, `orders.py`,
// `test_orders.py`, `.ai/*.md`, an `opencode.jsonc`), an optional `TASK.md`, the
// per-case `case.json` and hunk files under `hunks/`.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..');

export const FIXTURES = path.join(REPO_ROOT, 'tests', 'fixtures');
export const REVIEWER_FIXTURES = path.join(FIXTURES, 'reviewer');
export const EXPECTATIONS = path.join(REVIEWER_FIXTURES, 'expectations.md');

const IGNORED = new Set(['case.json', 'hunks']);

export function listCases() {
  if (!fs.existsSync(REVIEWER_FIXTURES)) return [];
  return fs
    .readdirSync(REVIEWER_FIXTURES, { withFileTypes: true })
    .filter(e => e.isDirectory() && !e.name.startsWith('.') && !e.name.startsWith('~'))
    .map(e => e.name)
    .filter(name => fs.existsSync(path.join(REVIEWER_FIXTURES, name, 'case.json')))
    .sort();
}

export function loadCaseFile(name) {
  const file = path.join(REVIEWER_FIXTURES, name, 'case.json');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function loadCases() {
  return listCases().map(name => ({ dir: name, cases: loadCaseFile(name) }));
}

export function listHunks(name) {
  const dir = path.join(REVIEWER_FIXTURES, name, 'hunks');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.hunk') && !f.startsWith('~'))
    .sort();
}

// Copies the case project into `dest`, skipping the harness-only entries.
export function copyProject(name, dest) {
  fs.cpSync(path.join(REVIEWER_FIXTURES, name), dest, {
    recursive: true,
    filter: src => !IGNORED.has(path.basename(src)),
  });
  return dest;
}

/**
 * Parses a hunk file into its structured form.
 *
 * @param {string} text
 * @returns {{ops: Array<{kind: 'context'|'remove'|'add', text: string}>, malformed: string[]}}
 */
export function parseHunk(text) {
  const ops = [];
  const malformed = [];
  const lines = text.split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  for (const line of lines) {
    if (line.startsWith('+')) ops.push({ kind: 'add', text: line.slice(1) });
    else if (line.startsWith('-')) ops.push({ kind: 'remove', text: line.slice(1) });
    else if (line.startsWith(' ') || line === '') ops.push({ kind: 'context', text: line.slice(1) });
    else malformed.push(line);
  }
  return { ops, malformed };
}

// Applies a parsed hunk to `content`, requiring every context and removed line to
// match exactly once and in order.
export function applyHunk(content, ops) {
  const from = content.split('\n');
  const out = [];
  let cursor = 0;
  for (const op of ops) {
    if (op.kind === 'add') {
      out.push(op.text);
      continue;
    }
    const index = from.indexOf(op.text, cursor);
    if (index === -1) {
      throw new Error(`hunk does not match: expected line ${JSON.stringify(op.text)}`);
    }
    for (let i = cursor; i < index; i += 1) out.push(from[i]);
    if (op.kind === 'context') out.push(op.text);
    cursor = index + 1;
  }
  for (let i = cursor; i < from.length; i += 1) out.push(from[i]);
  return out.join('\n');
}

export function applyHunkFile(file, ops) {
  const content = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file, applyHunk(content, ops));
}

// `case.json` lists the files under review by their hunk (`hunks/orders.hunk`),
// or by their project path (`orders.py`) for a working-tree edit. Both resolve to
// the project file the hunk rewrites, so `rel` is always project-relative.
export function readHunks(name, files) {
  return files.map(entry => {
    const stem = path.basename(entry).replace(/\.(py|hunk)$/, '');
    const rel = `${stem}.py`;
    const hunk = `hunks/${stem}.hunk`;
    const file = path.join(REVIEWER_FIXTURES, name, hunk);
    return { rel, hunk, ops: parseHunk(fs.readFileSync(file, 'utf8')).ops };
  });
}

const stem = entry => path.basename(entry).replace(/\.(py|hunk)$/, '');
const opsOf = (entries, entry) => entries.find(e => stem(e.rel) === stem(entry)).ops;

/**
 * Materializes a case project at `dest`. `dest` must exist.
 *
 * @returns {{files: string[], baseBranch: string|null, taskFile: string|null}}
 */
export function materialize(name, spec, dest) {
  copyProject(name, dest);

  const baseFiles = spec.base_files || [];
  const branchFiles = spec.branch_files || [];
  const stagedFiles = spec.staged_files || [];
  const dirtyFiles = spec.dirty_files || [];
  const baseOps = spec.base_ops || [];
  const branchOps = spec.branch_ops || [];
  const stagedOps = spec.staged_ops || [];
  const dirtyOps = spec.dirty_ops || [];

  if (spec.workflow === 'working-tree') {
    for (const { rel, ops } of dirtyOps) applyHunkFile(path.join(dest, rel), ops);
    return { files: fs.readdirSync(dest).sort(), baseBranch: null, taskFile: null };
  }

  const git = gitRunner(dest);
  git(['init', '-q', '-b', 'main']);
  git(['config', 'user.email', 'eval@example.com']);
  git(['config', 'user.name', 'Eval Harness']);
  git(['config', 'commit.gpgsign', 'false']);
  git(['add', '-A']);
  git(['commit', '-q', '-m', 'Initial import of the orders service']);

  for (const { rel, ops } of baseOps) applyHunkFile(path.join(dest, rel), ops);
  if (baseFiles.length > 0) {
    git(['add', '-A']);
    git(['commit', '-q', '-m', 'Base state for the evaluation case']);
  }

  // A case with a base branch keeps that branch at the initial commit and does
  // all of its work on a feature branch, so `git diff <base>...HEAD` has content.
  // Without a base branch the work happens on the only branch, `main`.
  const base = spec.base_branch || null;
  if (base) git(['checkout', '-q', '-b', 'feature/decimal-amounts']);

  if (spec.task_file) {
    const task = fs.readFileSync(path.join(dest, spec.task_file), 'utf8');
    fs.writeFileSync(path.join(dest, spec.task_file), task.replace(/^# /m, '## '));
    git(['add', '-A']);
    git(['commit', '-q', '-m', `Draft: ${spec.task_file}`]);
  }

  if (branchFiles.length > 0) {
    for (const { rel, ops } of branchOps) applyHunkFile(path.join(dest, rel), ops);
    git(['add', '-A']);
    git(['commit', '-q', '-m', 'Use Decimal for money amounts and cover both tax paths']);
  }

  if (stagedFiles.length > 0) {
    for (const { rel, ops } of stagedOps) applyHunkFile(path.join(dest, rel), ops);
    git(['add', '-A']);
  }

  return {
    files: fs.readdirSync(dest).sort(),
    baseBranch: spec.base_branch || null,
    taskFile: spec.task_file || null,
  };
}

// Loads the ops for every file list in the spec, so materialize never reads a
// hunk that the static test did not validate.
export function loadCaseHunks(name, spec) {
  const out = {};
  if (spec.base_files) out.base_ops = readHunks(name, spec.base_files);
  if (spec.branch_files) out.branch_ops = readHunks(name, spec.branch_files);
  if (spec.staged_files) out.staged_ops = readHunks(name, spec.staged_files);
  if (spec.dirty_files) out.dirty_ops = readHunks(name, spec.dirty_files);
  return out;
}

// `case.json` names project paths (`orders.py`); each one resolves to the hunk
// `hunks/<basename>.hunk` beside it.
export function loadSpec(name, spec) {
  return { ...spec, ...loadCaseHunks(name, spec) };
}

function gitRunner(cwd) {
  return args => execFileSync('git', args, { cwd, stdio: 'pipe', encoding: 'utf8' });
}
