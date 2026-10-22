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

const RETIRED_COMMANDS = ['issue-save.md', 'issue-load.md', 'issue-list.md', 'new-spec.md', '~new-spec.md'];
const BOOKMARK_SKILL = 'sax-issue-bookmarks';
const STATE_SKILL = 'sax-state-persistence';
const ANALYST_AGENTS = ['business-analyst.md', 'system-analyst.md'];
const normalize = value => value.replace(/\s+/g, ' ').trim();
const readSkill = name => normalize(fs.readFileSync(path.join(SRC_SKILLS, name, 'SKILL.md'), 'utf8'));

// --- Header / format tests ---

describe('skill frontmatter', () => {
  it('every skill has SKILL.md with valid name and description', () => {
    const skills = listSkills();
    assert.equal(skills.length, 28, `expected 28 skills, got ${skills.length}`);
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
    assert.equal(agents.length, 13, `expected 13 agents, got ${agents.length}`);
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
    assert.equal(cmds.length, 9, `expected 9 commands, got ${cmds.length}`);
    const withFm = cmds.filter(f => parseFrontmatter(path.join(SRC_COMMANDS, f)));
    assert.ok(withFm.length >= 3, `expected >=3 commands with frontmatter`);
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
    for (const command of RETIRED_COMMANDS) {
      assert.ok(!cmds.includes(command), `${command} must be a skill, not a command`);
    }
    const fm = parseFrontmatter(path.join(SRC_SKILLS, BOOKMARK_SKILL, 'SKILL.md'));
    assert.ok(fm, 'bookmark skill missing frontmatter');
    assert.equal(fm.name, BOOKMARK_SKILL);
    assert.equal(fm.agent, undefined, 'bookmark skill must run in the active session');
  });

  it('guards bookmark operations to the two analyst roles', () => {
    const content = readSkill(BOOKMARK_SKILL);
    assert.match(content, /session's loaded agent identity/);
    assert.match(content, /business-analyst/);
    assert.match(content, /system-analyst/);
    assert.match(content, /stop without reading/);
  });

  it('requires a bookmark name for save and load', () => {
    const content = readSkill(BOOKMARK_SKILL);
    assert.match(content, /If no name was supplied, ask one question/);
    assert.match(content, /\^\[A-Za-z0-9\]\[A-Za-z0-9_\-\]\{0,63\}\$/);
  });

  it('keeps analyst persistence explicit and compact', () => {
    for (const agent of ANALYST_AGENTS) {
      const content = normalize(fs.readFileSync(path.join(SRC_AGENTS, agent), 'utf8'));
      assert.match(content, /explicitly asks to save a bookmark/);
      assert.match(content, /Keep the full (requirement|analysis) model in conversation context/);
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

  it('points both analysts at the bookmark skill and not at the old commands', () => {
    for (const agent of ANALYST_AGENTS) {
      const content = normalize(fs.readFileSync(path.join(SRC_AGENTS, agent), 'utf8'));
      assert.match(content, /The `sax-issue-bookmarks` skill owns the bookmark operations/);
      assert.doesNotMatch(content, /issue-save|issue-load|issue-list/);
    }
  });

  it('defines one compact bookmark contract in the skill', () => {
    const content = readSkill(BOOKMARK_SKILL);
    assert.match(content, /Every operation must pass this guard/);
    assert.match(content, /schema_version: 1/);
    assert.match(content, /owns the operations, the name rules, the schema, and the validity/);
    assert.match(content, /Never copy the complete internal model|never contains the complete internal model/);
    assert.doesNotMatch(content, /## Snapshot file|### Autosave|### Annotate|### Resume/);
  });

  it('serializes bookmark YAML safely and applies one validity contract', () => {
    const content = readSkill(BOOKMARK_SKILL);
    assert.match(content, /valid YAML double-quoted scalar/);
    assert.match(content, /A bookmark is valid only when all of these checks pass/);
    assert.match(content, /Do not coerce, repair, or guess a value/);
    assert.match(content, /same validity rules as `load`/);
    assert.match(content, /mark absent provenance as unknown or unconfirmed/);
  });

  it('shares the state layout skill with both analysts', () => {
    const content = readSkill(STATE_SKILL);
    assert.match(content, /business-analyst/);
    assert.match(content, /system-analyst/);
    assert.match(content, /\.ai-temp\/findings\//);
    assert.match(content, /glossary\.yaml/);
    assert.match(content, /glossary-known-terms\.yaml/);
    assert.match(content, /sax-issue-bookmarks/);
    assert.match(content, /the other analyst's bookmark directory/);
    assert.match(content, /No autosave/);
    assert.match(content, /Only an explicit user request writes a bookmark/);
    assert.match(content, /## Shared findings/);
    assert.match(content, /## Legacy state/);
    // the bookmark contract itself belongs to the skill, not to this spec
    assert.doesNotMatch(content, /schema_version|## Ticket bookmarks|## Operation:/);
  });

  it('defines the shared findings contract', () => {
    const content = readSkill(STATE_SKILL);
    assert.match(content, /A finding is an observation with evidence, not a decision and not working state/);
    assert.match(content, /author: business-analyst \| system-analyst/);
    assert.match(content, /recorded_at/);
    assert.match(content, /credentials, secrets, or any content the user must still confirm/);
    assert.match(content, /The `System Analyst` never writes this file/);
  });

  it('gives both analysts read, glob, and edit on findings only', () => {
    for (const agent of ANALYST_AGENTS) {
      const content = fs.readFileSync(path.join(SRC_AGENTS, agent), 'utf8');
      for (const action of ['read', 'glob', 'edit']) {
        const re = new RegExp('- action: ' + action + '\\n\\s+resource: "\\.ai-temp/findings/\\*\\*"\\n\\s+effect: allow');
        assert.match(content, re, `${agent} must allow ${action} on .ai-temp/findings/**`);
      }
      // no blanket access to the other analyst's bookmark directory
      assert.doesNotMatch(content, /resource: "\.ai-temp\/\*\*"\n\s+effect: allow/);
    }
  });

  it('points both analysts at the state skill and the bookmark skill', () => {
    for (const agent of ANALYST_AGENTS) {
      const content = normalize(fs.readFileSync(path.join(SRC_AGENTS, agent), 'utf8'));
      assert.match(content, /The `sax-state-persistence` skill/);
      assert.match(content, /It is shared with the/);
      assert.match(content, /The `sax-issue-bookmarks` skill owns the bookmark operations/);
      assert.match(content, /\*\*Shared findings\*\*/);
      // the layout, write policy, and legacy rules live only in the spec
      assert.doesNotMatch(content, /autosave|migrate|no autosave/);
      // no agent still points at the retired shared-spec path
      assert.doesNotMatch(content, /_shared\/sax\/state-persistence/);
    }
  });

  it('both analysts declare the shared skills they load', () => {
    for (const agent of ANALYST_AGENTS) {
      const content = fs.readFileSync(path.join(SRC_AGENTS, agent), 'utf8');
      for (const skill of ['sax-ticket-writing', 'sax-issue-bookmarks', 'sax-state-persistence']) {
        const re = new RegExp('- action: skill\\n\\s+resource: "' + skill + '"\\n\\s+effect: allow');
        assert.match(content, re, `${agent} must allow the ${skill} skill`);
      }
    }
  });
});

// --- Installation tests (isolated with PREFIX) ---

describe('installer', () => {
  let tmp;
  before(() => {
    const workDir = path.join(REPO_ROOT, '~work');
    fs.mkdirSync(workDir, { recursive: true });
    tmp = fs.mkdtempSync(path.join(workDir, 'opencode-extras-test-'));
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
    assert.ok(
      fs.existsSync(path.join(prefix, '.config', 'opencode', 'skills', STATE_SKILL, 'SKILL.md')),
      'state skill missing under skills/'
    );
    assert.ok(
      !fs.existsSync(path.join(prefix, '.config', 'opencode', '_shared', 'sax', 'state-persistence.md')),
      'retired shared spec should not be installed'
    );
    assert.ok(!fs.existsSync(path.join(prefix, '.config', 'opencode', 'agents', '_shared', 'state-persistence.md')), 'legacy agents/_shared should not exist');
  });

  it('installs the project-context contract as a loadable skill', () => {
    const prefix = path.join(tmp, 'project-context-skill');
    runInstall('', { PREFIX: prefix });
    const base = path.join(prefix, '.config', 'opencode');
    assert.ok(
      fs.existsSync(path.join(base, 'skills', 'sax-project-context', 'SKILL.md')),
      'the project-context contract must be installed as a skill'
    );
    assert.ok(!fs.existsSync(path.join(base, '_shared')), 'the shared-spec namespace must not be installed');
  });

  it('never installs the reserved plugins/ directory in any mode', () => {
    for (const mode of ['', '--link']) {
      const label = mode === '--link' ? 'link' : 'copy';
      const prefix = path.join(tmp, `plugins-skip-${label}`);
      runInstall(mode, { PREFIX: prefix });
      const base = path.join(prefix, '.config', 'opencode');
      assert.ok(!fs.existsSync(path.join(base, 'plugins')), `plugins/ must not be installed (${label} mode)`);
      // the assertion above is not vacuous: the skills must still be installed
      assert.ok(listSkills().length > 0, 'expected at least one skill');
      for (const name of listSkills()) {
        assert.ok(fs.existsSync(path.join(base, 'skills', name)), `missing skill ${name} (${label} mode)`);
      }
    }
  });

  it('cleans up shared specs left by an older install layout', () => {
    const prefix = path.join(tmp, 'shared-legacy');
    const base = path.join(prefix, '.config', 'opencode');
    fs.mkdirSync(path.join(base, 'sax', 'shared'), { recursive: true });
    fs.writeFileSync(path.join(base, 'sax', 'shared', 'state-persistence.md'), 'old');
    fs.mkdirSync(path.join(base, 'agents', '_shared'), { recursive: true });
    fs.writeFileSync(path.join(base, 'agents', '_shared', 'state-persistence.md'), 'old');
    fs.mkdirSync(path.join(base, '_shared', 'sax'), { recursive: true });
    fs.writeFileSync(path.join(base, '_shared', 'sax', 'project-context.md'), 'old');
    runInstall('', { PREFIX: prefix });
    assert.ok(!fs.existsSync(path.join(base, 'sax')), 'legacy sax/shared should be removed');
    assert.ok(!fs.existsSync(path.join(base, 'agents', '_shared')), 'legacy agents/_shared should be removed');
    assert.ok(!fs.existsSync(path.join(base, '_shared', 'sax')), 'legacy _shared/sax should be removed');
    assert.ok(
      fs.existsSync(path.join(base, 'skills', 'sax-project-context', 'SKILL.md')),
      'the contract must be installed as a skill after the migration'
    );
  });

  it('removes the retired shared-spec namespace on uninstall', () => {
    const prefix = path.join(tmp, 'shared-uninstall');
    const base = path.join(prefix, '.config', 'opencode');
    fs.mkdirSync(path.join(base, '_shared', 'sax'), { recursive: true });
    fs.writeFileSync(path.join(base, '_shared', 'sax', 'project-context.md'), 'old');
    runInstall('--uninstall', { PREFIX: prefix });
    assert.ok(!fs.existsSync(path.join(base, '_shared', 'sax')), 'legacy _shared/sax should be removed on uninstall');
  });

  it('removes the dangling _shared symlink left by an older --link install', () => {
    const prefix = path.join(tmp, 'shared-link');
    const base = path.join(prefix, '.config', 'opencode');
    fs.mkdirSync(base, { recursive: true });
    fs.symlinkSync(path.join(tmp, 'gone', '_shared'), path.join(base, '_shared'), 'dir');
    runInstall('', { PREFIX: prefix });
    assert.ok(!fs.lstatSync(path.join(base, '_shared'), { throwIfNoEntry: false }), 'legacy _shared symlink should be removed');
  });

  it('keeps a user-owned _shared directory', () => {
    const prefix = path.join(tmp, 'shared-user');
    const base = path.join(prefix, '.config', 'opencode');
    fs.mkdirSync(path.join(base, '_shared'), { recursive: true });
    fs.writeFileSync(path.join(base, '_shared', 'mine.md'), 'keep');
    runInstall('', { PREFIX: prefix });
    assert.ok(fs.existsSync(path.join(base, '_shared', 'mine.md')), 'a user-owned _shared directory must survive');
  });

  it('removes broken symlinks left behind by a moved source', () => {
    const prefix = path.join(tmp, 'broken-link');
    const base = path.join(prefix, '.config', 'opencode');
    runInstall('--link', { PREFIX: prefix });
    const commandsDir = path.join(base, 'commands');
    fs.symlinkSync(path.join(tmp, 'gone', 'old-command.md'), path.join(commandsDir, 'old-command.md'), 'file');
    const skillLink = path.join(base, 'skills', 'old-skill');
    fs.symlinkSync(path.join(tmp, 'gone', 'old-skill'), skillLink, 'dir');
    runInstall('--uninstall', { PREFIX: prefix });
    assert.ok(!fs.existsSync(path.join(commandsDir, 'old-command.md')), 'broken command symlink should be removed');
    assert.ok(!fs.existsSync(skillLink), 'broken skill symlink should be removed');
  });

  it('coexistence: preserves other-pack skill', () => {
    const prefix = path.join(tmp, 'coexist');
    runInstall('', { PREFIX: prefix });
    const other = path.join(prefix, '.config', 'opencode', 'skills', 'other-pack');
    fs.mkdirSync(other, { recursive: true });
    fs.writeFileSync(path.join(other, 'SKILL.md'), 'other');
    runInstall('', { PREFIX: prefix });
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

  it('--link creates per-item symlinks', () => {
    const prefix = path.join(tmp, 'link');
    runInstall('--link', { PREFIX: prefix });
    const p = path.join(prefix, '.config', 'opencode', 'skills', listSkills()[0]);
    assert.ok(fs.lstatSync(p).isSymbolicLink(), 'should be symlink');
    const target = fs.readlinkSync(p);
    assert.ok(target.includes('src/skills'), `symlink target should point to src/skills: ${target}`);
  });

  it('--dry-run does not touch fs', () => {
    const prefix = path.join(tmp, 'dry');
    runInstall('--dry-run', { PREFIX: prefix });
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
    runInstall('', { PREFIX: prefix });
    assert.ok(fs.statSync(legacy).isDirectory());
    assert.ok(fs.existsSync(path.join(legacy, 'SKILL.md')));
  });

  it('removes retired bookmark commands left by an older install', () => {
    const prefix = path.join(tmp, 'retired');
    const commandsDir = path.join(prefix, '.config', 'opencode', 'commands');
    fs.mkdirSync(commandsDir, { recursive: true });
    for (const name of RETIRED_COMMANDS) fs.writeFileSync(path.join(commandsDir, name), 'old');
    runInstall('', { PREFIX: prefix });
    for (const name of RETIRED_COMMANDS) {
      assert.ok(!fs.existsSync(path.join(commandsDir, name)), `${name} should be removed`);
    }
    assert.ok(fs.existsSync(path.join(prefix, '.config', 'opencode', 'skills', BOOKMARK_SKILL, 'SKILL.md')));
    runInstall('--uninstall', { PREFIX: prefix });
    for (const name of RETIRED_COMMANDS) {
      assert.ok(!fs.existsSync(path.join(commandsDir, name)), `${name} should be removed on uninstall`);
    }
  });

  it('never installs editor backups or dotfiles from src/', () => {
    const prefix = path.join(tmp, 'backups');
    const backup = path.join(SRC_COMMANDS, '~throwaway.md');
    fs.writeFileSync(backup, 'scratch');
    const dotSkill = path.join(SRC_SKILLS, '.throwaway');
    fs.mkdirSync(dotSkill, { recursive: true });
    fs.writeFileSync(path.join(dotSkill, 'SKILL.md'), 'scratch');
    try {
      runInstall('', { PREFIX: prefix });
      const base = path.join(prefix, '.config', 'opencode');
      assert.ok(!fs.existsSync(path.join(base, 'commands', '~throwaway.md')), 'backup command should not be installed');
      assert.ok(!fs.existsSync(path.join(base, 'skills', 'sax-.throwaway')), 'dotfile skill should not be installed');
    } finally {
      fs.rmSync(backup, { force: true });
      fs.rmSync(dotSkill, { recursive: true, force: true });
    }
  });

  it('rejects the removed --agent selector and other removed flags', () => {
    for (const value of ['opencode', 'claude', 'compat', 'invalid']) {
      assert.throws(() => runInstall(`--agent ${value} --dry-run`), /--agent has been removed/);
    }
    assert.throws(() => runInstall('--agent --dry-run'), /--agent has been removed/);
    for (const flag of ['--compat', '--opencode', '--claude', '--codex', '--pi', '--all']) {
      assert.throws(() => runInstall(`${flag} --dry-run`), new RegExp(`${flag} has been removed`));
    }
  });
});
