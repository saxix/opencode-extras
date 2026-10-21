import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  REPO_ROOT,
  listAgents,
  listSkills,
  listCommands,
} from './helpers.mjs';
import { renderReferences } from '../scripts/gen-references.mjs';

const DOCS = path.join(REPO_ROOT, 'docs');

function listPlugins() {
  const dir = path.join(REPO_ROOT, 'src', 'plugins');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => e.isDirectory() && !e.name.startsWith('.') && !e.name.startsWith('~'))
    .map(e => e.name);
}

describe('generated reference pages', () => {
  it('docs/reference/ matches the current sources', () => {
    const expected = renderReferences();
    for (const [rel, content] of Object.entries(expected)) {
      const abs = path.join(REPO_ROOT, rel);
      assert.ok(fs.existsSync(abs), `${rel} is missing; run node scripts/gen-references.mjs`);
      assert.equal(
        fs.readFileSync(abs, 'utf8'),
        content,
        `${rel} is stale; run node scripts/gen-references.mjs`
      );
    }
  });

  it('covers every agent, skill, command, and plugin', () => {
    const files = renderReferences();
    const all = Object.values(files).join('\n');
    const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    for (const file of listAgents()) {
      const name = file.replace(/\.md$/, '');
      assert.match(all, new RegExp(`## ${escape(name)}\\b`), `agent ${name} missing from the reference`);
    }
    for (const name of listSkills()) {
      const installed = name.startsWith('sax-') ? name : `sax-${name}`;
      assert.match(all, new RegExp(`## ${escape(installed)}\\b`), `skill ${installed} missing from the reference`);
    }
    for (const file of listCommands()) {
      const name = file.replace(/\.md$/, '');
      assert.ok(all.includes(`\`${name}\``), `command ${name} missing from the reference`);
    }
    for (const name of listPlugins()) {
      const readme = path.join(REPO_ROOT, 'src', 'plugins', name, 'README.md');
      const h1 = fs.existsSync(readme) ? fs.readFileSync(readme, 'utf8').match(/^#\s+(.+)$/m) : null;
      const title = h1 ? h1[1].trim() : name;
      assert.match(all, new RegExp(`## ${escape(title)}\\b`), `plugin ${name} missing from the reference`);
    }
  });
});

describe('home page counts', () => {
  const index = fs.readFileSync(path.join(DOCS, 'index.md'), 'utf8');

  function documentedCount(label) {
    const m = index.match(new RegExp(`\\|\\s*${label}\\s*\\|\\s*(\\d+)\\s*\\|`));
    assert.ok(m, `docs/index.md missing the ${label} count row`);
    return Number(m[1]);
  }

  it('match src/', () => {
    assert.equal(documentedCount('Agents'), listAgents().length, 'agent count in docs/index.md is stale');
    assert.equal(documentedCount('Skills'), listSkills().length, 'skill count in docs/index.md is stale');
    assert.equal(documentedCount('Commands'), listCommands().length, 'command count in docs/index.md is stale');
    assert.equal(documentedCount('Plugins'), listPlugins().length, 'plugin count in docs/index.md is stale');
  });
});

describe('properdocs nav', () => {
  it('points only at existing files', () => {
    const config = fs.readFileSync(path.join(REPO_ROOT, 'properdocs.yml'), 'utf8');
    const targets = [...config.matchAll(/^\s+-\s+[^:\n]+:\s*(\S+\.md)\s*$/gm)].map(m => m[1]);
    assert.ok(targets.length > 0, 'properdocs.yml has no nav targets');
    for (const target of targets) {
      assert.ok(fs.existsSync(path.join(DOCS, target)), `properdocs.yml nav target missing: docs/${target}`);
    }
  });
});
