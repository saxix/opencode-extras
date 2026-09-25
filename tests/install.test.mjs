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

const BOOKMARK_COMMANDS = ['issue-save.md', 'issue-load.md', 'issue-list.md'];
const ANALYST_AGENTS = ['business-analyst.md', 'system-analyst.md'];
const normalize = value => value.replace(/\s+/g, ' ').trim();

// --- Header / format tests ---

describe('skill frontmatter', () => {
  it('every skill has SKILL.md with valid name and description', () => {
    const skills = listSkills();
    assert.equal(skills.length, 23, `expected 23 skills, got ${skills.length}`);
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
    assert.equal(agents.length, 10, `expected 10 agents, got ${agents.length}`);
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
    assert.equal(cmds.length, 12, `expected 12 commands, got ${cmds.length}`);
    const withFm = cmds.filter(f => parseFrontmatter(path.join(SRC_COMMANDS, f)));
    assert.ok(withFm.length >= 7, `expected >=7 commands with frontmatter`);
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

  it('defines the three bookmark commands without forcing an agent', () => {
    const cmds = listCommands();
    for (const command of BOOKMARK_COMMANDS) {
      assert.ok(cmds.includes(command), `${command} missing`);
      const fm = parseFrontmatter(path.join(SRC_COMMANDS, command));
      assert.ok(fm?.description, `${command} missing description`);
      assert.equal(fm.agent, undefined, `${command} must run in the active session`);
    }
  });

  it('guards bookmark commands to the two analyst roles', () => {
    for (const command of BOOKMARK_COMMANDS) {
      const content = normalize(fs.readFileSync(path.join(SRC_COMMANDS, command), 'utf8'));
      assert.match(content, /session's loaded agent identity/);
      assert.match(content, /business-analyst/);
      assert.match(content, /system-analyst/);
      assert.match(content, /stop without reading/);
      assert.match(content, /other analyst/);
    }
  });

  it('requires a bookmark name for save and load', () => {
    for (const command of ['issue-save.md', 'issue-load.md']) {
      const content = normalize(fs.readFileSync(path.join(SRC_COMMANDS, command), 'utf8'));
      assert.match(content, /First positional argument: `\$1`/);
      assert.match(content, /If the first positional argument is absent, ask one question/);
      assert.match(content, /\^\[A-Za-z0-9\]\[A-Za-z0-9_-\]\{0,63\}\$/);
    }
  });

  it('keeps analyst persistence explicit and compact', () => {
    for (const agent of ANALYST_AGENTS) {
      const content = normalize(fs.readFileSync(path.join(SRC_AGENTS, agent), 'utf8'));
      assert.match(content, /Never autosave it or persist it on a state transition/);
      assert.match(content, /only when `issue-save` is explicitly invoked/);
      assert.match(content, /active role/);
      assert.doesNotMatch(content, /session_notes/);
      assert.doesNotMatch(content, /annotate|resume work|restart from note|create note|note draft|pause now/);
    }
  });

  it('restricts each analyst to its own bookmark directory', () => {
    const business = fs.readFileSync(path.join(SRC_AGENTS, 'business-analyst.md'), 'utf8');
    const system = fs.readFileSync(path.join(SRC_AGENTS, 'system-analyst.md'), 'utf8');
    assert.match(business, /resource: "\.ai-temp\/business-analyst\/\*\*"/);
    assert.doesNotMatch(business, /resource: "\.ai-temp\/\*\*"/);
    assert.match(system, /resource: "\.ai-temp\/system-analyst\/\*\*"/);
  });

  it('defines one compact shared bookmark contract', () => {
    const content = normalize(fs.readFileSync(path.join(SRC_AGENTS, '_shared', 'state-persistence.md'), 'utf8'));
    assert.match(content, /Every bookmark command must pass this guard/);
    assert.match(content, /user explicitly invokes `issue-save`/);
    assert.match(content, /schema_version: 1/);
    assert.match(content, /Never copy the complete internal model/);
    assert.doesNotMatch(content, /## Snapshot file|### Autosave|### Annotate|### Resume/);
  });

  it('serializes bookmark YAML safely and applies one validity contract', () => {
    const save = normalize(fs.readFileSync(path.join(SRC_COMMANDS, 'issue-save.md'), 'utf8'));
    const load = normalize(fs.readFileSync(path.join(SRC_COMMANDS, 'issue-load.md'), 'utf8'));
    const list = normalize(fs.readFileSync(path.join(SRC_COMMANDS, 'issue-list.md'), 'utf8'));
    const shared = normalize(fs.readFileSync(path.join(SRC_AGENTS, '_shared', 'state-persistence.md'), 'utf8'));
    assert.match(save, /valid YAML double-quoted scalars/);
    assert.match(shared, /Bookmark validity/);
    assert.match(load, /Do not coerce or repair values/);
    assert.match(list, /same validity rules as `issue-load`/);
    assert.match(load, /mark absent provenance as unknown or unconfirmed/);
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

  it('default global target creates opencode per-item dirs', () => {
    const prefix = path.join(tmp, 'default-global');
    runInstall('', { PREFIX: prefix });
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
    assert.ok(!fs.existsSync(path.join(prefix, '.claude')));
    assert.ok(!fs.existsSync(path.join(prefix, '.codex')));
    assert.ok(!fs.existsSync(path.join(prefix, '.pi')));
    assert.ok(fs.existsSync(path.join(prefix, '.config', 'opencode', 'sax', 'shared', 'state-persistence.md')), 'shared spec missing at sax/shared');
    assert.ok(!fs.existsSync(path.join(prefix, '.config', 'opencode', 'agents', '_shared', 'state-persistence.md')), 'legacy agents/_shared should not exist');
  });

  it('global targets use dedicated destinations', () => {
    const prefix = path.join(tmp, 'global-targets');
    const targets = [['claude', '.claude'], ['codex', '.codex'], ['pi', '.pi']];
    for (const [agent, directory] of targets) {
      runInstall(`--agent ${agent}`, { PREFIX: prefix });
      assert.ok(fs.existsSync(path.join(prefix, directory, 'skills', listSkills()[0], 'SKILL.md')));
      assert.ok(fs.existsSync(path.join(prefix, directory, 'agents', listAgents()[0])));
      assert.ok(fs.existsSync(path.join(prefix, directory, 'commands', listCommands()[0])));
    }
  });

  it('coexistence: preserves other-pack skill', () => {
    const prefix = path.join(tmp, 'coexist');
    runInstall('--agent opencode', { PREFIX: prefix });
    const other = path.join(prefix, '.config', 'opencode', 'skills', 'other-pack');
    fs.mkdirSync(other, { recursive: true });
    fs.writeFileSync(path.join(other, 'SKILL.md'), 'other');
    runInstall('--agent opencode', { PREFIX: prefix });
    assert.ok(fs.existsSync(path.join(other, 'SKILL.md')), 'other-pack should be preserved');
    assert.ok(fs.existsSync(path.join(prefix, '.config', 'opencode', 'skills', listSkills()[0], 'SKILL.md')));
  });

  it('project install creates .opencode per-item', () => {
    const proj = path.join(tmp, 'proj');
    fs.mkdirSync(proj, { recursive: true });
    runInstall('--project', {}, proj);
    assert.ok(fs.existsSync(path.join(proj, '.opencode', 'skills', listSkills()[0], 'SKILL.md')));
    assert.ok(fs.existsSync(path.join(proj, '.opencode', 'agents', listAgents()[0])));
    runInstall('--uninstall --project', {}, proj);
    for (const name of listSkills()) {
      assert.ok(!fs.existsSync(path.join(proj, '.opencode', 'skills', name)));
    }
  });

  it('project targets use dedicated destinations', () => {
    const proj = path.join(tmp, 'proj-targets');
    fs.mkdirSync(proj, { recursive: true });
    const targets = [['claude', '.claude'], ['codex', '.codex'], ['pi', '.pi']];
    for (const [agent, directory] of targets) {
      runInstall(`--project --agent ${agent}`, {}, proj);
      assert.ok(fs.existsSync(path.join(proj, directory, 'skills', listSkills()[0], 'SKILL.md')));
    }
  });

  it('--link creates per-item symlinks', () => {
    const prefix = path.join(tmp, 'link');
    runInstall('--agent opencode --link', { PREFIX: prefix });
    const p = path.join(prefix, '.config', 'opencode', 'skills', listSkills()[0]);
    assert.ok(fs.lstatSync(p).isSymbolicLink(), 'should be symlink');
    const target = fs.readlinkSync(p);
    assert.ok(target.includes('src/skills'), `symlink target should point to src/skills: ${target}`);
  });

  it('--dry-run does not touch fs', () => {
    const prefix = path.join(tmp, 'dry');
    runInstall('--agent opencode --dry-run', { PREFIX: prefix });
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
    runInstall('--agent opencode', { PREFIX: prefix });
    assert.ok(fs.statSync(legacy).isDirectory());
    assert.ok(fs.existsSync(path.join(legacy, 'SKILL.md')));
  });

  it('--agent compat creates .agents per-item (sax- prefix)', () => {
    const proj = path.join(tmp, 'proj-compat');
    fs.mkdirSync(proj, { recursive: true });
    runInstall('--agent compat', {}, proj);
    const baseSkills = path.join(proj, '.agents', 'skills');
    assert.ok(fs.existsSync(path.join(baseSkills, listSkills()[0], 'SKILL.md')), 'compat skills missing');
    assert.ok(fs.existsSync(path.join(proj, '.agents', 'agents', listAgents()[0])), 'compat agents missing');
    assert.ok(fs.existsSync(path.join(proj, '.agents', 'commands', listCommands()[0])), 'compat commands missing');
    assert.ok(fs.existsSync(path.join(proj, '.agents', 'sax', 'shared', 'state-persistence.md')), 'compat shared spec missing at sax/shared');
    assert.ok(!fs.existsSync(path.join(proj, '.agents', 'agents', '_shared', 'state-persistence.md')), 'legacy agents/_shared should not exist in compat');
    assert.ok(!fs.existsSync(path.join(proj, '.opencode', 'skills', listSkills()[0])), 'should not create .opencode in compat');
    assert.ok(!fs.existsSync(path.join(proj, '.claude')), 'should not create .claude in compat');
    assert.ok(!fs.existsSync(path.join(proj, '.codex')), 'should not create .codex in compat');
    runInstall('--uninstall --agent compat', {}, proj);
    for (const name of listSkills()) {
      assert.ok(!fs.existsSync(path.join(baseSkills, name)));
    }
    assert.ok(!fs.existsSync(path.join(proj, '.agents', 'sax', 'shared', 'state-persistence.md')), 'compat shared should be removed on uninstall');
  });

  it('--agent compat --link creates symlinks in .agents', () => {
    const proj = path.join(tmp, 'proj-compat-link');
    fs.mkdirSync(proj, { recursive: true });
    runInstall('--agent compat --link', {}, proj);
    const p = path.join(proj, '.agents', 'skills', listSkills()[0]);
    assert.ok(fs.lstatSync(p).isSymbolicLink(), 'compat symlink should be created');
    const target = fs.readlinkSync(p);
    assert.ok(target.includes('src/skills'), `symlink target should point to src/skills: ${target}`);
    runInstall('--uninstall --agent compat', {}, proj);
    assert.ok(!fs.existsSync(p));
  });

  it('--agent compat --dry-run does not touch .agents', () => {
    const proj = path.join(tmp, 'proj-compat-dry');
    fs.mkdirSync(proj, { recursive: true });
    runInstall('--agent compat --dry-run', {}, proj);
    assert.ok(!fs.existsSync(path.join(proj, '.agents', 'skills', listSkills()[0])));
  });

  it('rejects invalid and removed agent selectors', () => {
    assert.throws(() => runInstall('--agent invalid --dry-run'), /--agent must be one of/);
    assert.throws(() => runInstall('--agent --dry-run'), /--agent requires a value/);
    assert.throws(() => runInstall('--agent opencode --agent pi --dry-run'), /only once/);
    for (const flag of ['--compat', '--opencode', '--claude', '--codex', '--all']) {
      assert.throws(() => runInstall(`${flag} --dry-run`), new RegExp(`${flag} has been removed`));
    }
    assert.throws(() => runInstall('--agent compat --global --dry-run'), /cannot be combined with --global/);
  });
});
