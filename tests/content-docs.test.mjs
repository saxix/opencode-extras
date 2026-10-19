import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT, parseFrontmatter, listAgents, listSkills, listCommands } from './helpers.mjs';

const AGENTS_MD = path.join(REPO_ROOT, 'AGENTS.md');
const content = fs.readFileSync(AGENTS_MD, 'utf8');

function sectionRows(heading) {
  const lines = content.split('\n');
  const start = lines.findIndex(l => l === `## ${heading}`);
  assert.ok(start !== -1, `AGENTS.md missing "## ${heading}" section`);
  const rows = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^## /.test(line)) break;
    const m = line.match(/^\|\s*`([^`]+)`\s*\|(.*)\|/);
    if (m) rows.push({ name: m[1], rest: m[2] });
  }
  assert.ok(rows.length > 0, `AGENTS.md "## ${heading}" has no table rows`);
  return rows;
}

describe('AGENTS.md stays in sync with src/', () => {
  it('agents table lists exactly the agents in src/agents with matching mode', () => {
    const rows = sectionRows('Agents');
    const documented = new Set(rows.map(r => r.name));
    const actual = new Set(listAgents().map(f => f.replace(/\.md$/, '')));
    for (const name of actual) {
      assert.ok(documented.has(name), `AGENTS.md agents table missing "${name}"`);
    }
    for (const name of documented) {
      assert.ok(actual.has(name), `AGENTS.md agents table lists unknown agent "${name}"`);
    }
    for (const row of rows) {
      const fm = parseFrontmatter(path.join(REPO_ROOT, 'src', 'agents', `${row.name}.md`));
      const mode = row.rest.split('|')[0].trim();
      assert.equal(mode, fm.mode, `AGENTS.md mode for "${row.name}" is "${mode}", frontmatter says "${fm.mode}"`);
    }
  });

  it('skills table lists exactly the skills in src/skills', () => {
    const rows = sectionRows('Skills');
    const documented = new Set(rows.map(r => r.name.replace(/\/$/, '')));
    const actual = new Set(listSkills().map(n => n.replace(/^sax-/, '')));
    for (const name of actual) {
      assert.ok(documented.has(name), `AGENTS.md skills table missing "${name}/"`);
    }
    for (const name of documented) {
      assert.ok(actual.has(name), `AGENTS.md skills table lists unknown skill "${name}/"`);
    }
  });

  it('commands table lists exactly the commands in src/commands', () => {
    const rows = sectionRows('Commands');
    const documented = new Set(rows.map(r => r.name));
    const actual = new Set(listCommands().map(f => f.replace(/\.md$/, '')));
    for (const name of actual) {
      assert.ok(documented.has(name), `AGENTS.md commands table missing "${name}"`);
    }
    for (const name of documented) {
      assert.ok(actual.has(name), `AGENTS.md commands table lists unknown command "${name}"`);
    }
  });
});
