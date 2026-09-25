import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  REPO_ROOT,
  SRC_SKILLS,
  SRC_AGENTS,
  SRC_COMMANDS,
  parseFrontmatter,
  listSkills,
  listAgents,
  listCommands,
  runInstall,
} from './helpers.mjs';

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
      assert.ok(fm.name.startsWith('sax-'), `${name} should have sax- prefix per spec`);
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
      if (rawVal.startsWith("'") || rawVal.startsWith('"')) {
        assert.ok(true);
      } else {
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
    const workDir = path.join(REPO_ROOT, '~work');
    fs.mkdirSync(workDir, { recursive: true });
    tmp = fs.mkdtempSync(path.join(workDir, 'opencode-utils-test-'));
  });
  after(() => {
    if (process.env.KEEP_WORK) {
      console.log(`KEEP_WORK: leaving ${tmp}`);
      return;
    }
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
    assert.ok(fs.existsSync(path.join(prefix, '.claude', 'skills', listSkills()[0], 'SKILL.md')));
    assert.ok(fs.existsSync(path.join(prefix, '.codex', 'skills', listSkills()[0], 'SKILL.md')));
    // shared spec must be at sax/shared, not under agents/_shared
    assert.ok(fs.existsSync(path.join(prefix, '.config', 'opencode', 'sax', 'shared', 'state-persistence.md')), 'shared spec missing at sax/shared');
    assert.ok(!fs.existsSync(path.join(prefix, '.config', 'opencode', 'agents', '_shared', 'state-persistence.md')), 'legacy agents/_shared should not exist');
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
    assert.ok(!fs.existsSync(path.join(prefix, '.config', 'opencode', 'skills', listSkills()[0])));
    assert.ok(!fs.existsSync(path.join(prefix, '.config', 'opencode', 'skills')));
  });

  it('legacy directory symlink is replaced', () => {
    const prefix = path.join(tmp, 'legacy');
    const dest = path.join(prefix, '.config', 'opencode', 'skills');
    fs.mkdirSync(dest, { recursive: true });
    const legacy = path.join(dest, listSkills()[0]);
    const dummy = path.join(tmp, 'dummy');
    fs.writeFileSync(dummy, 'x');
    fs.symlinkSync(dummy, legacy, 'file');
    assert.ok(fs.lstatSync(legacy).isSymbolicLink());
    runInstall('--global --opencode', { PREFIX: prefix });
    assert.ok(fs.statSync(legacy).isDirectory());
    assert.ok(fs.existsSync(path.join(legacy, 'SKILL.md')));
  });

  it('project --compat creates .agents per-item (sax- prefix)', () => {
    const proj = path.join(tmp, 'proj-compat');
    fs.mkdirSync(proj, { recursive: true });
    runInstall('--project --compat', {}, proj);
    const baseSkills = path.join(proj, '.agents', 'skills');
    assert.ok(fs.existsSync(path.join(baseSkills, listSkills()[0], 'SKILL.md')), 'compat skills missing');
    assert.ok(fs.existsSync(path.join(proj, '.agents', 'agents', listAgents()[0])), 'compat agents missing');
    assert.ok(fs.existsSync(path.join(proj, '.agents', 'commands', listCommands()[0])), 'compat commands missing');
    assert.ok(fs.existsSync(path.join(proj, '.agents', 'sax', 'shared', 'state-persistence.md')), 'compat shared spec missing at sax/shared');
    assert.ok(!fs.existsSync(path.join(proj, '.agents', 'agents', '_shared', 'state-persistence.md')), 'legacy agents/_shared should not exist in compat');
    assert.ok(!fs.existsSync(path.join(proj, '.opencode', 'skills', listSkills()[0])), 'should not create .opencode in compat');
    assert.ok(!fs.existsSync(path.join(proj, '.claude')), 'should not create .claude in compat');
    assert.ok(!fs.existsSync(path.join(proj, '.codex')), 'should not create .codex in compat');
    runInstall('--uninstall --project --compat', {}, proj);
    for (const name of listSkills()) {
      assert.ok(!fs.existsSync(path.join(baseSkills, name)));
    }
    assert.ok(!fs.existsSync(path.join(proj, '.agents', 'sax', 'shared', 'state-persistence.md')), 'compat shared should be removed on uninstall');
  });

  it('project --compat --link creates symlinks in .agents', () => {
    const proj = path.join(tmp, 'proj-compat-link');
    fs.mkdirSync(proj, { recursive: true });
    runInstall('--project --compat --link', {}, proj);
    const p = path.join(proj, '.agents', 'skills', listSkills()[0]);
    assert.ok(fs.lstatSync(p).isSymbolicLink(), 'compat symlink should be created');
    const target = fs.readlinkSync(p);
    assert.ok(target.includes('src/skills'), `symlink target should point to src/skills: ${target}`);
    runInstall('--uninstall --project --compat', {}, proj);
    assert.ok(!fs.existsSync(p));
  });

  it('project --compat --dry-run does not touch .agents', () => {
    const proj = path.join(tmp, 'proj-compat-dry');
    fs.mkdirSync(proj, { recursive: true });
    runInstall('--project --compat --dry-run', {}, proj);
    assert.ok(!fs.existsSync(path.join(proj, '.agents', 'skills', listSkills()[0])));
  });
});
