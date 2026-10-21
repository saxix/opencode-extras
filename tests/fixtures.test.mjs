import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  REVIEWER_FIXTURES,
  applyHunk,
  listCases,
  listHunks,
  loadCases,
  loadCaseHunks,
  parseHunk,
} from './fixtures.mjs';
import { ALLOWED, extractDenials, parseArgs, verdictOf } from './eval/verdict.mjs';
import { REPO_ROOT } from './helpers.mjs';

// Contract of the reviewer evaluation cases: the static half of the fixture
// suite. It never runs git, the agent, or the network; `tests/eval/run-eval.mjs`
// consumes the same files for the live run, and `expectations.md` records the
// expectation of every case so the latest evaluated output stays reviewable.

const CASES = loadCases();
const ALL = CASES.flatMap(({ dir, cases }) => cases.map(spec => ({ dir, spec })));

const casePath = (...parts) => path.join(REVIEWER_FIXTURES, ...parts);

describe('reviewer evaluation cases', () => {
  it('has at least one case directory with one or more cases', () => {
    assert.ok(listCases().length > 0, 'no case directory under tests/fixtures/reviewer');
    assert.ok(ALL.length > 0, 'no case entry found');
  });

  it('every case has a unique id', () => {
    const ids = ALL.map(({ spec }) => spec.id);
    assert.equal(new Set(ids).size, ids.length, 'duplicate case id');
  });

  it('every case declares the documented fields', () => {
    for (const { dir, spec } of ALL) {
      assert.ok(spec.id, `${dir}: case without id`);
      assert.ok(
        ['clean-branch', 'working-tree', 'staged', 'pr-flow'].includes(spec.workflow),
        `${spec.id}: unknown workflow ${spec.workflow}`
      );
      assert.ok(spec.request, `${spec.id}: missing request`);
      assert.ok(spec.expected, `${spec.id}: missing expected behaviour`);
      assert.ok(spec.expect || spec.expect_any, `${spec.id}: needs expect or expect_any`);
      for (const key of ['branch_files', 'staged_files', 'dirty_files', 'base_files']) {
        if (spec[key] === undefined) continue;
        assert.ok(Array.isArray(spec[key]) && spec[key].length > 0, `${spec.id}: ${key} must be a non-empty array`);
      }
      for (const key of ['expect_any', 'forbid_any']) {
        if (spec[key] === undefined) continue;
        assert.ok(Array.isArray(spec[key]), `${spec.id}: ${key} must be an array`);
      }
      assert.ok(
        spec.workflow === 'working-tree' || 'base_branch' in spec,
        `${spec.id}: git workflows declare base_branch (or null)`
      );
    }
  });

  it('every referenced file exists in its case directory', () => {
    for (const { dir, spec } of ALL) {
      for (const key of ['base_files', 'branch_files', 'staged_files', 'dirty_files']) {
        for (const rel of spec[key] || []) {
          assert.ok(fs.existsSync(casePath(dir, rel)), `${dir}: missing ${rel}`);
        }
      }
      if (spec.task_file) {
        assert.ok(fs.existsSync(casePath(dir, spec.task_file)), `${dir}: missing ${spec.task_file}`);
      }
      assert.ok(fs.existsSync(casePath(dir, 'README.md')), `${dir}: missing README.md`);
    }
  });

  it('every case ships an opencode.jsonc project config', () => {
    for (const { dir } of CASES) {
      assert.ok(fs.existsSync(casePath(dir, 'opencode.jsonc')), `${dir}: missing opencode.jsonc`);
    }
  });

  it('the project config grants the reviewer the commands the cases rely on', () => {
    for (const { dir } of CASES) {
      const config = JSON.parse(fs.readFileSync(casePath(dir, 'opencode.jsonc'), 'utf8'));
      const rules = config?.agents?.reviewer?.permissions ?? [];
      for (const resource of ['gh pr list *', 'gh repo view *', 'git merge-base *', 'git branch -a', 'git ls-files *']) {
        assert.ok(
          rules.some(r => r.resource === resource && r.effect === 'allow'),
          `${dir}/opencode.jsonc does not allow "${resource}"`
        );
      }
    }
  });

  it('hunk files are well formed and every referenced file has one', () => {
    for (const { dir, spec } of ALL) {
      const hunks = listHunks(dir);
      assert.ok(hunks.length > 0, `${dir}: no hunk file`);
      const referenced = new Set(
        ['base_files', 'branch_files', 'staged_files', 'dirty_files'].flatMap(k => spec[k] || [])
      );
      for (const rel of referenced) {
        const hunk = `${path.basename(rel).replace(/\.(py|hunk)$/, '')}.hunk`;
        assert.ok(hunks.includes(hunk), `${dir}: ${rel} has no matching hunks/${hunk}`);
      }
      for (const hunk of hunks) {
        const parsed = parseHunk(fs.readFileSync(casePath(dir, 'hunks', hunk), 'utf8'));
        assert.deepEqual(parsed.malformed, [], `${dir}/hunks/${hunk}: malformed lines`);
        assert.ok(
          parsed.ops.some(o => o.kind !== 'context'),
          `${dir}/hunks/${hunk}: no add or remove line`
        );
      }
    }
  });

  it('every hunk applies to its target file and changes it', () => {
    for (const { dir, spec } of ALL) {
      const ops = loadCaseHunks(dir, spec);
      for (const key of Object.keys(ops)) {
        for (const { rel, ops: entries } of ops[key]) {
          const name = path.basename(rel).replace(/\.(py|hunk)$/, '.py');
          const content = fs.readFileSync(casePath(dir, name), 'utf8');
          assert.notEqual(
            applyHunk(content, entries),
            content,
            `${dir}: ${rel} applies cleanly but changes nothing`
          );
        }
      }
    }
  });

  it('reverting hunks drops the Decimal refactor they introduce', () => {
    const revertible = ALL.filter(({ spec }) => spec.base_files);
    for (const { dir, spec } of revertible) {
      for (const rel of spec.base_files) {
        const hunk = `${path.basename(rel).replace(/\.(py|hunk)$/, '')}.hunk`;
        const ops = parseHunk(fs.readFileSync(casePath(dir, 'hunks', hunk), 'utf8')).ops;
        const reverted = applyHunk(fs.readFileSync(casePath(dir, rel), 'utf8'), ops);
        assert.ok(!reverted.includes('Decimal'), `${dir}: ${rel} did not revert to floats`);
      }
    }
  });

  it('keeps the sample projects free of agent definitions', () => {
    for (const { dir } of CASES) {
      assert.ok(!fs.existsSync(casePath(dir, 'AGENTS.md')), `${dir}: sample projects must not ship AGENTS.md`);
      assert.ok(!fs.existsSync(casePath(dir, '.opencode')), `${dir}: sample projects must not ship .opencode`);
    }
  });

  it('records the expectation per case in expectations.md', () => {
    const file = casePath('expectations.md');
    assert.ok(fs.existsSync(file), 'expectations.md is missing');
    const text = fs.readFileSync(file, 'utf8');
    for (const { spec } of ALL) {
      assert.match(text, new RegExp(`\\b${spec.id}\\b`), `expectations.md does not mention ${spec.id}`);
      assert.ok(
        text.includes(spec.expected),
        `expectations.md does not record the expectation of ${spec.id}`
      );
    }
  });
});

// The verdict rules of the live runner live in `tests/eval/verdict.mjs` so the
// static suite covers them: a change in how a denial or an expectation is read
// must not need a live run (and a provider) to notice.
describe('evaluation verdict rules', () => {
  const denialLine = command =>
    `\u001b[0m\u2717 \u001b[0m${command} failed\n\u001b[91m\u001b[1mError: \u001b[0mPermission denied: shell\n`;

  it('extracts the denied command from its marker line', () => {
    const output = denialLine('python3 -m pytest -q');
    assert.deepEqual(extractDenials(output), [{ command: 'python3 -m pytest -q' }]);
  });

  it('reports no denial when the run stayed inside the allowlist', () => {
    assert.deepEqual(extractDenials('$ git status\n M orders.py\n'), []);
  });

  it('passes a case whose expectation is met despite an expected denial', () => {
    const output = `APPROVE\n${denialLine('python3 -m pytest -q')}`;
    const denials = extractDenials(output);
    assert.equal(verdictOf({ expect: 'APPROVE' }, output, denials), 'PASS');
  });

  it('fails a case when an allowlisted command was denied', () => {
    const output = `APPROVE\n${denialLine('git diff')}`;
    const denials = extractDenials(output);
    assert.equal(verdictOf({ expect: 'APPROVE' }, output, denials), 'FAIL');
  });

  it('fails a case when the expectation is not met', () => {
    assert.equal(verdictOf({ expect: 'APPROVE' }, 'REQUEST_CHANGES', []), 'FAIL');
  });

  it('fails a case when a forbidden string appears', () => {
    const spec = { expect: 'APPROVE', forbid_any: ['**Blocker**'] };
    assert.equal(verdictOf(spec, 'APPROVE\n**Blocker** -- x', []), 'FAIL');
  });

  it('requires one of expect_any', () => {
    const spec = { expect_any: ['Decimal', 'float'] };
    assert.equal(verdictOf(spec, 'the money is a float', []), 'PASS');
    assert.equal(verdictOf(spec, 'the money is an int', []), 'FAIL');
  });
});

// The runner's argument parsing decides which cases run; a bug there silently
// runs the wrong case, so it is pinned by the static suite.
describe('evaluation runner arguments', () => {
  it('selects every case when no case id is given', () => {
    assert.deepEqual(parseArgs([]).wanted, []);
  });

  it('reads a case id and the keep flag', () => {
    const parsed = parseArgs(['--keep', 'reviewer-staged']);
    assert.equal(parsed.keep, true);
    assert.deepEqual(parsed.wanted, ['reviewer-staged']);
  });

  it('does not treat the --model value as a case id', () => {
    const parsed = parseArgs(['--model', 'anthropic/claude-sonnet-4-5', 'reviewer-staged']);
    assert.equal(parsed.model, 'anthropic/claude-sonnet-4-5');
    assert.deepEqual(parsed.wanted, ['reviewer-staged']);
  });

  it('keeps the first case id when --model is absent', () => {
    assert.deepEqual(parseArgs(['reviewer-clean-branch']).wanted, ['reviewer-clean-branch']);
  });
});

// `ALLOWED` in the runner is the shell allowlist of the reviewer agent. If the
// agent gains a command and the runner is not updated, a denial of it would be
// reported as "expected" instead of failing the case: pin the two together.
describe('allowlist stays in sync with the reviewer agent', () => {
  const agent = fs.readFileSync(path.join(REPO_ROOT, 'src/agents/reviewer.md'), 'utf8');
  const resources = [
    ...agent.matchAll(
      /action:\s*shell\s*\n\s*resource:\s*"([^"]+)"\s*\n\s*effect:\s*allow/g
    ),
  ].map(m => m[1]);

  it('finds the reviewer shell allowlist', () => {
    assert.ok(resources.length > 0, 'no shell resources found in the reviewer agent');
  });

  it('matches every allowlisted command', () => {
    for (const resource of resources) {
      const sample = resource.endsWith('*') ? resource.replace(/\*$/, 'something') : resource;
      assert.ok(ALLOWED.test(sample), `runner ALLOWED does not match "${resource}"`);
    }
  });

  // The reverse direction: an over-broad `ALLOWED` marks a real denial as
  // expected, which silently hides a broken allowlist. `ls` was in this list
  // once and made two passing cases report FAIL.
  it('does not match a command the reviewer cannot run', () => {
    for (const command of [
      'ls -la',
      'ls',
      'python3 -m pytest -q',
      'cat orders.py',
      'git remote -v',
      'git push',
      'rm orders.py',
    ]) {
      assert.ok(!ALLOWED.test(command), `runner ALLOWED wrongly matches "${command}"`);
    }
  });
});
