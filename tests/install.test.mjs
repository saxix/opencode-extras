import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const SRC_SKILLS = path.join(REPO_ROOT, 'src', 'skills');
const SRC_AGENTS = path.join(REPO_ROOT, 'src', 'agents');
const SRC_COMMANDS = path.join(REPO_ROOT, 'src', 'commands');
const INSTALL_MJS = path.join(REPO_ROOT, 'scripts', 'install.mjs');

function parseFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const yaml = m[1];
  const lines = yaml.split('\n');
  const data = {};
  let currentKey = null;
  let currentVal = '';
  for (const line of lines) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) {
      if (currentKey) data[currentKey] = currentVal.trim();
      currentKey = kv[1];
      currentVal = kv[2];
    } else if (currentKey) {
      currentVal += '\n' + line;
    }
  }
  if (currentKey) data[currentKey] = currentVal.trim();
  // Unquote single/double quoted values
  for (const k of Object.keys(data)) {
    let v = data[k];
    if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
      v = v.slice(1, -1);
      data[k] = v;
    }
  }
  return data;
}

function listSkills() {
  return fs.readdirSync(SRC_SKILLS).filter(n => !n.startsWith('.') && fs.statSync(path.join(SRC_SKILLS, n)).isDirectory());
}
function listAgents() {
  return fs.readdirSync(SRC_AGENTS).filter(n => n.endsWith('.md'));
}
function listCommands() {
  return fs.readdirSync(SRC_COMMANDS).filter(n => n.endsWith('.md'));
}

function runInstall(args, env = {}, cwd = REPO_ROOT) {
  const fullEnv = { ...process.env, ...env };
  return execSync(`node "${INSTALL_MJS}" ${args}`, { cwd, env: fullEnv, encoding: 'utf8' });
}

// --- Header / format tests ---

describe('skill frontmatter', () => {
  it('every skill has SKILL.md with valid name and description', () => {
    const skills = listSkills();
    assert.ok(skills.length >= 22, `expected >=22 skills, got ${skills.length}`);
    for (const name of skills) {
      const fm = parseFrontmatter(path.join(SRC_SKILLS, name, 'SKILL.md'));
      assert.ok(fm, `${name}/SKILL.md missing frontmatter`);
      assert.ok(fm.name, `${name} missing name`);
      assert.equal(fm.name, name, `${name} name mismatch`);
      assert.match(fm.name, /^[a-z0-9-_]+$/, `${name} name not kebab-case`);
      assert.ok(fm.description && fm.description.length > 10, `${name} missing description`);
    }
  });

  it('description is quoted when containing colon', () => {
    for (const name of listSkills()) {
      const raw = fs.readFileSync(path.join(SRC_SKILLS, name, 'SKILL.md'), 'utf8');
      const m = raw.match(/^---\n([\s\S]*?)\n---/);
      assert.ok(m, `${name} no frontmatter`);
      const descLine = m[1].split('\n').find(l => l.startsWith('description:'));
      assert.ok(descLine, `${name} no description line`);
      const rawVal = descLine.slice('description:'.length).trim();
      // If unquoted and contains colon, YAML would be invalid (was bug for documentation/ticket-writing)
      if (rawVal.startsWith("'") || rawVal.startsWith('"')) {
        // quoted is safe
        assert.ok(true);
      } else {
        // unquoted must not contain ": " that would break YAML compact mapping
        // We enforce that any description with colon must be quoted
        if (rawVal.includes(':')) {
          assert.fail(`${name} description contains colon but is not quoted: ${rawVal.slice(0, 60)}`);
        }
      }
    }
  });

  it('every skill directory has SKILL.md at root', () => {
    for (const name of listSkills()) {
      const p = path.join(SRC_SKILLS, name, 'SKILL.md');
      assert.ok(fs.existsSync(p), `missing ${p}`);
    }
  });
});

describe('agent frontmatter', () => {
  it('every agent has description', () => {
    const agents = listAgents();
    assert.ok(agents.length >= 9, `expected >=9 agents`);
    for (const f of agents) {
      const fm = parseFrontmatter(path.join(SRC_AGENTS, f));
      assert.ok(fm, `${f} missing frontmatter`);
      assert.ok(fm.description, `${f} missing description`);
      if (fm.mode) assert.match(fm.mode, /^(primary|subagent)$/, `${f} invalid mode`);
    }
  });
});

describe('command frontmatter', () => {
  it('every command with frontmatter has description', () => {
    const cmds = listCommands();
    assert.ok(cmds.length >= 9);
    const withFm = cmds.filter(f => parseFrontmatter(path.join(SRC_COMMANDS, f)));
    // At least debug-code, git-status, init-project, new-spec have frontmatter
    assert.ok(withFm.length >= 4, `expected >=4 commands with frontmatter`);
    for (const f of withFm) {
      const fm = parseFrontmatter(path.join(SRC_COMMANDS, f));
      assert.ok(fm.description, `${f} missing description`);
    }
  });

  it('every command file is non-empty', () => {
    for (const f of listCommands()) {
      const content = fs.readFileSync(path.join(SRC_COMMANDS, f), 'utf8');
      assert.ok(content.trim().length > 10, `${f} empty`);
    }
  });
});

// --- Installation tests (isolated with PREFIX) ---

describe('installer', () => {
  let tmp;
  before(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-utils-test-'));
  });
  after(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('copy global --all creates per-item dirs (no directory symlink)', () => {
    const prefix = path.join(tmp, 'global-all');
    runInstall('--global --all', { PREFIX: prefix });
    const skillsDir = path.join(prefix, '.config', 'opencode', 'skills');
    assert.ok(fs.existsSync(skillsDir));
    assert.ok(!fs.lstatSync(skillsDir).isSymbolicLink(), 'skills should be directory, not symlink');
    for (const name of listSkills()) {
      const p = path.join(skillsDir, name, 'SKILL.md');
      assert.ok(fs.existsSync(p), `missing skill ${name}`);
    }
    for (const f of listAgents()) {
      assert.ok(fs.existsSync(path.join(prefix, '.config', 'opencode', 'agents', f)));
    }
    for (const f of listCommands()) {
      assert.ok(fs.existsSync(path.join(prefix, '.config', 'opencode', 'commands', f)));
    }
    // also claude/codex
    assert.ok(fs.existsSync(path.join(prefix, '.claude', 'skills', listSkills()[0])));
    assert.ok(fs.existsSync(path.join(prefix, '.codex', 'skills', listSkills()[0])));
  });

  it('coexistence: preserves other-pack skill', () => {
    const prefix = path.join(tmp, 'coexist');
    runInstall('--global --opencode', { PREFIX: prefix });
    const other = path.join(prefix, '.config', 'opencode', 'skills', 'other-pack');
    fs.mkdirSync(other, { recursive: true });
    fs.writeFileSync(path.join(other, 'SKILL.md'), 'other');
    runInstall('--global --opencode', { PREFIX: prefix });
    assert.ok(fs.existsSync(path.join(other, 'SKILL.md')), 'other-pack should be preserved');
    assert.ok(fs.existsSync(path.join(prefix, '.config', 'opencode', 'skills', listSkills()[0], 'SKILL.md')));
  });

  it('project install creates .opencode per-item', () => {
    const proj = path.join(tmp, 'proj');
    fs.mkdirSync(proj, { recursive: true });
    runInstall('--project --all', {}, proj);
    assert.ok(fs.existsSync(path.join(proj, '.opencode', 'skills', listSkills()[0], 'SKILL.md')));
    assert.ok(fs.existsSync(path.join(proj, '.opencode', 'agents', listAgents()[0])));
    // cleanup
    runInstall('--uninstall --project --all', {}, proj);
    for (const name of listSkills()) {
      assert.ok(!fs.existsSync(path.join(proj, '.opencode', 'skills', name)));
    }
  });

  it('--link creates per-item symlinks', () => {
    const prefix = path.join(tmp, 'link');
    runInstall('--global --opencode --link', { PREFIX: prefix });
    const p = path.join(prefix, '.config', 'opencode', 'skills', listSkills()[0]);
    assert.ok(fs.lstatSync(p).isSymbolicLink(), 'should be symlink');
    const target = fs.readlinkSync(p);
    assert.ok(target.includes('src/skills'), `symlink target should point to src/skills: ${target}`);
  });

  it('--dry-run does not touch fs', () => {
    const prefix = path.join(tmp, 'dry');
    runInstall('--global --opencode --dry-run', { PREFIX: prefix });
    assert.ok(!fs.existsSync(path.join(prefix, '.config', 'opencode', 'skills')));
  });

  it('--uninstall removes only known items', () => {
    const prefix = path.join(tmp, 'uninstall');
    runInstall('--global --opencode', { PREFIX: prefix });
    const other = path.join(prefix, '.config', 'opencode', 'skills', 'other-keep');
    fs.mkdirSync(other, { recursive: true });
    fs.writeFileSync(path.join(other, 'SKILL.md'), 'keep');
    runInstall('--uninstall --global --opencode', { PREFIX: prefix });
    for (const name of listSkills()) {
      assert.ok(!fs.existsSync(path.join(prefix, '.config', 'opencode', 'skills', name)));
    }
    assert.ok(fs.existsSync(path.join(other, 'SKILL.md')), 'other-keep preserved on uninstall');
  });

  it('legacy directory symlink is replaced', () => {
    const prefix = path.join(tmp, 'legacy');
    const dest = path.join(prefix, '.config', 'opencode');
    fs.mkdirSync(dest, { recursive: true });
    const legacy = path.join(dest, 'skills');
    // create legacy dir symlink
    fs.symlinkSync(path.join(REPO_ROOT, 'src', 'skills'), legacy, 'dir');
    assert.ok(fs.lstatSync(legacy).isSymbolicLink());
    runInstall('--global --opencode', { PREFIX: prefix });
    assert.ok(!fs.lstatSync(legacy).isSymbolicLink(), 'legacy symlink should be replaced');
    assert.ok(fs.statSync(legacy).isDirectory());
    assert.ok(fs.existsSync(path.join(legacy, listSkills()[0], 'SKILL.md')));
  });
});
