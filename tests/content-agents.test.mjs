import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { SRC_AGENTS, SRC_SHARED, parseFrontmatter, listAgents, listSkills } from './helpers.mjs';

const RETIRED_COMMAND_PATTERN = /issue-save|issue-load|issue-list/;
const VALID_MODES = new Set(['primary', 'subagent']);
const VALID_ACTIONS = new Set(['read', 'glob', 'edit', 'shell', 'subagent', 'skill', 'websearch', 'webfetch']);
const VALID_EFFECTS = new Set(['allow', 'deny', 'ask']);
const COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;
const SKILL_NAMES = new Set(listSkills());

const readAgent = f => fs.readFileSync(path.join(SRC_AGENTS, f), 'utf8');

function frontmatterText(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(m, 'missing frontmatter');
  return m[1];
}

function parsePermissions(fmText) {
  const entries = [];
  let inPerms = false;
  let current = null;
  for (const line of fmText.split('\n')) {
    if (/^permissions:/.test(line)) {
      inPerms = true;
      continue;
    }
    if (!inPerms) continue;
    if (/^\S/.test(line)) break;
    const action = line.match(/^\s+- action:\s*(\S+)\s*$/);
    if (action) {
      current = { action: action[1] };
      entries.push(current);
      continue;
    }
    const resource = line.match(/^\s+resource:\s*(.+?)\s*$/);
    if (resource && current) {
      current.resource = resource[1].replace(/^["']|["']$/g, '');
      continue;
    }
    const effect = line.match(/^\s+effect:\s*(\S+)\s*$/);
    if (effect && current) {
      current.effect = effect[1];
    }
  }
  return entries;
}

describe('agent schema', () => {
  it('every agent declares a valid mode, steps, and color', () => {
    for (const f of listAgents()) {
      const fm = parseFrontmatter(path.join(SRC_AGENTS, f));
      assert.ok(fm.description, `${f} missing description`);
      assert.ok(VALID_MODES.has(fm.mode), `${f} invalid mode: ${fm.mode}`);
      assert.match(fm.steps ?? '', /^[1-9][0-9]*$/, `${f} steps must be a positive integer, got: ${fm.steps}`);
      assert.match(fm.color ?? '', COLOR_PATTERN, `${f} color must be #RRGGBB, got: ${fm.color}`);
    }
  });

  it('hidden is only allowed on subagents and must be true', () => {
    for (const f of listAgents()) {
      const fm = parseFrontmatter(path.join(SRC_AGENTS, f));
      if (fm.hidden === undefined) continue;
      assert.equal(fm.hidden, 'true', `${f} hidden must be true when present`);
      assert.equal(fm.mode, 'subagent', `${f} hidden is only allowed on subagents`);
    }
  });

  it('sub- prefix matches the mode', () => {
    for (const f of listAgents()) {
      const fm = parseFrontmatter(path.join(SRC_AGENTS, f));
      const isSub = f.startsWith('sub-');
      assert.equal(
        fm.mode,
        isSub ? 'subagent' : 'primary',
        `${f} name/mode mismatch: sub- prefix ⇔ mode: subagent`
      );
    }
  });
});

describe('agent permissions', () => {
  it('every permission entry has a valid action, resource, and effect', () => {
    for (const f of listAgents()) {
      const entries = parsePermissions(frontmatterText(readAgent(f)));
      assert.ok(entries.length > 0, `${f} has no permissions`);
      for (const e of entries) {
        assert.ok(VALID_ACTIONS.has(e.action), `${f} invalid action: ${e.action}`);
        assert.ok(e.resource, `${f} permission missing resource: ${JSON.stringify(e)}`);
        assert.ok(VALID_EFFECTS.has(e.effect), `${f} invalid effect: ${e.effect}`);
      }
    }
  });

  it('every agent has at least one deny', () => {
    for (const f of listAgents()) {
      const entries = parsePermissions(frontmatterText(readAgent(f)));
      assert.ok(entries.some(e => e.effect === 'deny'), `${f} has no deny rule`);
    }
  });

  it('every subagent denies edit and nested subagent spawn on "*"', () => {
    for (const f of listAgents()) {
      if (!f.startsWith('sub-')) continue;
      const entries = parsePermissions(frontmatterText(readAgent(f)));
      for (const action of ['edit', 'subagent']) {
        assert.ok(
          entries.some(e => e.action === action && e.resource === '*' && e.effect === 'deny'),
          `${f} must deny ${action} on "*"`
        );
      }
    }
  });

  it('skill permissions reference existing skills', () => {
    for (const f of listAgents()) {
      const entries = parsePermissions(frontmatterText(readAgent(f)));
      for (const e of entries) {
        if (e.action !== 'skill' || e.resource === '*') continue;
        assert.ok(
          SKILL_NAMES.has(`sax-${e.resource}`),
          `${f} references unknown skill "${e.resource}" (expected src/skills/sax-${e.resource})`
        );
      }
    }
  });
});

describe('agent content integrity', () => {
  it('shared spec references resolve to real files', () => {
    for (const f of listAgents()) {
      const content = readAgent(f);
      for (const m of content.matchAll(/\.\.\/_shared\/([A-Za-z0-9_./-]+)/g)) {
        const p = path.join(SRC_SHARED, m[1]);
        assert.ok(fs.existsSync(p), `${f} references missing shared file: ../_shared/${m[1]}`);
      }
    }
  });

  it('no agent references retired bookmark commands', () => {
    for (const f of listAgents()) {
      assert.doesNotMatch(readAgent(f), RETIRED_COMMAND_PATTERN, `${f} references retired issue-* commands`);
    }
  });
});

describe('agent TUI-portable output', () => {
  it('agents are ASCII-only outside code (no emoji, arrows, or box drawing)', () => {
    for (const f of listAgents()) {
      const prose = readAgent(f)
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]*`/g, '');
      assert.doesNotMatch(prose, /[^\x00-\x7F]/, `${f} has non-ASCII prose`);
    }
  });

  it('agent code fences are balanced', () => {
    for (const f of listAgents()) {
      const fences = readAgent(f).split('\n').filter(l => /^\s*```/.test(l)).length;
      assert.equal(fences % 2, 0, `${f} has unbalanced code fences (${fences})`);
    }
  });
});
