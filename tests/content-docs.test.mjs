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
    // the table may list either the source name or the installed sax- prefixed name
    const documented = new Set(rows.map(r => r.name.replace(/\/$/, '').replace(/^sax-/, '')));
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

describe('project context contract', () => {
  const contractPath = path.join(REPO_ROOT, 'src', '_shared', 'sax', 'project-context.md');
  const contract = fs.readFileSync(contractPath, 'utf8');
  const topics = new Set(
    [...contract.matchAll(/^\|\s*`\.ai\/([a-z-]+)\.md`\s*\|/gm)].map(m => m[1])
  );

  it('defines the topic files', () => {
    assert.ok(topics.size >= 5, 'project-context.md topic table is missing or empty');
  });

  it('commands reference only topics defined by the contract', () => {
    for (const command of ['init-project', 'config-check']) {
      const file = path.join(REPO_ROOT, 'src', 'commands', `${command}.md`);
      const text = fs.readFileSync(file, 'utf8');
      assert.match(
        text,
        /\.\.\/_shared\/sax\/project-context\.md/,
        `${command} must reference the shared contract`
      );
      for (const m of text.matchAll(/\.ai\/([a-z-]+)\.md/g)) {
        assert.ok(topics.has(m[1]), `${command} mentions unknown topic .ai/${m[1]}.md`);
      }
    }
  });
});
