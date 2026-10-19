import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  REPO_ROOT,
  listSkills,
  listAgents,
  listCommands,
  runInstall,
} from './helpers.mjs';

describe('uninstall', () => {
  let tmp;
  before(() => {
    const workDir = path.join(REPO_ROOT, '~work');
    fs.mkdirSync(workDir, { recursive: true });
    tmp = fs.mkdtempSync(path.join(workDir, 'opencode-extras-uninstall-'));
  });
  after(() => {
    if (process.env.KEEP_WORK) {
      console.log(`KEEP_WORK: leaving ${tmp}`);
      return;
    }
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('removes only known items and preserves unrelated', () => {
    const prefix = path.join(tmp, 'uninstall');
    runInstall('', { PREFIX: prefix });
    const other = path.join(prefix, '.config', 'opencode', 'skills', 'other-keep');
    fs.mkdirSync(other, { recursive: true });
    fs.writeFileSync(path.join(other, 'SKILL.md'), 'keep');
    runInstall('--uninstall', { PREFIX: prefix });
    for (const name of listSkills()) {
      assert.ok(!fs.existsSync(path.join(prefix, '.config', 'opencode', 'skills', name)));
    }
    assert.ok(fs.existsSync(path.join(other, 'SKILL.md')), 'other-keep preserved on uninstall');
  });

  it('lifecycle: install then uninstall the global target', () => {
    const prefix = path.join(tmp, `lifecycle-global-${Date.now()}`);
    runInstall('', { PREFIX: prefix });
    const opencodeSkills = path.join(prefix, '.config', 'opencode', 'skills');
    const opencodeAgents = path.join(prefix, '.config', 'opencode', 'agents');
    const opencodeCommands = path.join(prefix, '.config', 'opencode', 'commands');
    for (const name of listSkills()) {
      assert.ok(fs.existsSync(path.join(opencodeSkills, name, 'SKILL.md')), `missing after install ${name}`);
    }
    for (const f of listAgents()) {
      assert.ok(fs.existsSync(path.join(opencodeAgents, f)), `missing agent ${f}`);
    }
    for (const f of listCommands()) {
      assert.ok(fs.existsSync(path.join(opencodeCommands, f)), `missing command ${f}`);
    }
    assert.ok(fs.existsSync(path.join(prefix, '.config', 'opencode', 'skills', listSkills()[0], 'SKILL.md')));
    assert.ok(fs.existsSync(path.join(prefix, '.config', 'opencode', '_shared', 'sax', 'state-persistence.md')), 'shared spec missing at _shared/sax');
    assert.ok(!fs.existsSync(path.join(prefix, '.config', 'opencode', 'agents', '_shared', 'state-persistence.md')), 'legacy agents/_shared should not exist');

    const keep = path.join(opencodeSkills, 'keep-me');
    fs.mkdirSync(keep, { recursive: true });
    fs.writeFileSync(path.join(keep, 'SKILL.md'), 'keep');

    runInstall('--uninstall', { PREFIX: prefix });

    for (const name of listSkills()) {
      assert.ok(!fs.existsSync(path.join(opencodeSkills, name)), `should be removed ${name}`);
    }
    for (const f of listAgents()) {
      assert.ok(!fs.existsSync(path.join(opencodeAgents, f)), `agent should be removed ${f}`);
    }
    for (const f of listCommands()) {
      assert.ok(!fs.existsSync(path.join(opencodeCommands, f)), `command should be removed ${f}`);
    }
    assert.ok(fs.existsSync(path.join(keep, 'SKILL.md')), 'unrelated keep-me preserved after uninstall');
    assert.ok(!fs.existsSync(path.join(prefix, '.config', 'opencode', '_shared', 'sax', 'state-persistence.md')), 'shared spec should be removed on uninstall');
  });

  it('lifecycle: install then uninstall the project target', () => {
    const proj = path.join(tmp, `lifecycle-project-${Date.now()}`);
    fs.mkdirSync(proj, { recursive: true });
    fs.writeFileSync(path.join(proj, 'README.md'), 'project readme');

    runInstall('--project', {}, proj);
    const skillsDir = path.join(proj, '.opencode', 'skills');
    const agentsDir = path.join(proj, '.opencode', 'agents');
    const commandsDir = path.join(proj, '.opencode', 'commands');
    for (const name of listSkills()) {
      assert.ok(fs.existsSync(path.join(skillsDir, name, 'SKILL.md')), `project missing skill ${name}`);
    }
    assert.ok(fs.existsSync(path.join(agentsDir, listAgents()[0])));
    assert.ok(fs.existsSync(path.join(commandsDir, listCommands()[0])));

    const keep = path.join(skillsDir, 'keep-project');
    fs.mkdirSync(keep, { recursive: true });
    fs.writeFileSync(path.join(keep, 'SKILL.md'), 'keep');

    runInstall('--uninstall --project', {}, proj);

    for (const name of listSkills()) {
      assert.ok(!fs.existsSync(path.join(skillsDir, name)), `project skill should be removed ${name}`);
    }
    assert.ok(fs.existsSync(path.join(keep, 'SKILL.md')), 'project keep preserved');
    assert.ok(fs.existsSync(path.join(proj, 'README.md')), 'unrelated README preserved');
  });

  it('--dry-run preserves files in isolated folder', () => {
    const prefix = path.join(tmp, `uninstall-dry-${Date.now()}`);
    runInstall('', { PREFIX: prefix });
    const skillsDir = path.join(prefix, '.config', 'opencode', 'skills');
    const keep = path.join(skillsDir, 'keep-dry');
    fs.mkdirSync(keep, { recursive: true });
    fs.writeFileSync(path.join(keep, 'SKILL.md'), 'keep');
    const out = runInstall('--uninstall --dry-run', { PREFIX: prefix });
    assert.match(out, /would remove/, 'dry-run should log would remove');
    for (const name of listSkills()) {
      assert.ok(fs.existsSync(path.join(skillsDir, name, 'SKILL.md')), `dry-run should preserve ${name}`);
    }
    assert.ok(fs.existsSync(path.join(keep, 'SKILL.md')));
    runInstall('--uninstall', { PREFIX: prefix });
    for (const name of listSkills()) {
      assert.ok(!fs.existsSync(path.join(skillsDir, name)));
    }
    assert.ok(fs.existsSync(path.join(keep, 'SKILL.md')), 'keep preserved after real uninstall');
  });

  it('is idempotent and handles empty folder', () => {
    const prefix = path.join(tmp, `uninstall-idem-${Date.now()}`);
    runInstall('', { PREFIX: prefix });
    const skillsDir = path.join(prefix, '.config', 'opencode', 'skills');
    runInstall('--uninstall', { PREFIX: prefix });
    for (const name of listSkills()) {
      assert.ok(!fs.existsSync(path.join(skillsDir, name)));
    }
    const out2 = runInstall('--uninstall', { PREFIX: prefix });
    assert.ok(out2.includes('Done'), 'second uninstall should complete');
    const emptyPrefix = path.join(tmp, `uninstall-empty-${Date.now()}`);
    const out3 = runInstall('--uninstall', { PREFIX: emptyPrefix });
    assert.ok(out3.includes('Done'));
  });

  it('removes symlink install correctly in isolated folder', () => {
    const prefix = path.join(tmp, `uninstall-link-${Date.now()}`);
    runInstall('--link', { PREFIX: prefix });
    const skillLink = path.join(prefix, '.config', 'opencode', 'skills', listSkills()[0]);
    assert.ok(fs.lstatSync(skillLink).isSymbolicLink(), 'should be symlink before uninstall');
    const agentLink = path.join(prefix, '.config', 'opencode', 'agents', listAgents()[0]);
    assert.ok(fs.lstatSync(agentLink).isSymbolicLink());
    runInstall('--uninstall', { PREFIX: prefix });
    assert.ok(!fs.existsSync(skillLink), 'symlink skill should be removed');
    assert.ok(!fs.existsSync(agentLink), 'symlink agent should be removed');
  });
});
