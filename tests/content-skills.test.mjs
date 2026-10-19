import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { SRC_SKILLS, listSkills } from './helpers.mjs';

const SKILL_DIR_PATTERN = /^[a-z0-9_-]+$/;
const FILE_LINK_PATTERN = /\.(md|txt|ya?ml|json|png|jpe?g|svg)$/;

function walkSkillFiles(name) {
  const files = [];
  const walk = dir => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else files.push(p);
    }
  };
  walk(path.join(SRC_SKILLS, name));
  return files;
}

describe('skill structure', () => {
  it('skill directory names are safe identifiers', () => {
    for (const name of listSkills()) {
      assert.match(name, SKILL_DIR_PATTERN, `${name} must match ${SKILL_DIR_PATTERN}`);
    }
  });

  it('skill directories contain no nested editor backups', () => {
    for (const name of listSkills()) {
      for (const f of walkSkillFiles(name)) {
        const rel = path.relative(path.join(SRC_SKILLS, name), f);
        assert.ok(!rel.split(path.sep).some(seg => seg.startsWith('~') || seg.startsWith('.')),
          `${name}: unexpected backup/dotfile ${rel}`);
      }
    }
  });
});

describe('skill content integrity', () => {
  it('no broken relative file links', () => {
    for (const name of listSkills()) {
      for (const f of walkSkillFiles(name)) {
        if (!f.endsWith('.md')) continue;
        const content = fs.readFileSync(f, 'utf8');
        for (const m of content.matchAll(/\]\(([^)\s]+)\)/g)) {
          const url = m[1];
          if (/^[a-z]+:\/\//.test(url) || url.startsWith('#') || url.startsWith('/') || url.startsWith('mailto:')) continue;
          const target = url.split('#')[0];
          if (!target || !FILE_LINK_PATTERN.test(target)) continue;
          const abs = path.resolve(path.dirname(f), target);
          assert.ok(fs.existsSync(abs), `${name}: broken link ${url} in ${path.relative(SRC_SKILLS, f)}`);
        }
      }
    }
  });

  it('shared spec references resolve to real files', () => {
    const sharedRoot = path.resolve(SRC_SKILLS, '..', '_shared');
    for (const name of listSkills()) {
      for (const f of walkSkillFiles(name)) {
        if (!f.endsWith('.md')) continue;
        const content = fs.readFileSync(f, 'utf8');
        for (const m of content.matchAll(/\.\.\/_shared\/([A-Za-z0-9_./-]+)/g)) {
          const p = path.join(sharedRoot, m[1]);
          assert.ok(fs.existsSync(p), `${name} references missing shared file: ../_shared/${m[1]}`);
        }
      }
    }
  });
});

describe('TUI-portable output', () => {
  it('skills are ASCII-only outside code (no emoji, arrows, or box drawing)', () => {
    for (const name of listSkills()) {
      for (const f of walkSkillFiles(name)) {
        if (!f.endsWith('.md')) continue;
        const prose = fs.readFileSync(f, 'utf8')
          .replace(/```[\s\S]*?```/g, '')
          .replace(/`[^`]*`/g, '');
        assert.doesNotMatch(prose, /[^\x00-\x7F]/,
          `${name}: non-ASCII character in ${path.relative(SRC_SKILLS, f)}`);
      }
    }
  });

  it('no setext headings', () => {
    for (const name of listSkills()) {
      for (const f of walkSkillFiles(name)) {
        if (!f.endsWith('.md')) continue;
        const lines = fs.readFileSync(f, 'utf8').split('\n');
        let inFence = false;
        for (let i = 1; i < lines.length; i++) {
          if (/^\s*```/.test(lines[i])) inFence = !inFence;
          if (inFence) continue;
          if (/^=+\s*$/.test(lines[i]) && lines[i - 1].trim() !== '') {
            assert.fail(`${name}: setext heading at ${path.relative(SRC_SKILLS, f)}:${i + 1}`);
          }
        }
      }
    }
  });

  it('code fences are balanced', () => {
    for (const name of listSkills()) {
      for (const f of walkSkillFiles(name)) {
        if (!f.endsWith('.md')) continue;
        const fences = fs.readFileSync(f, 'utf8').split('\n').filter(l => /^\s*```/.test(l)).length;
        assert.equal(fences % 2, 0, `${name}: unbalanced code fences in ${path.relative(SRC_SKILLS, f)} (${fences} fences)`);
      }
    }
  });
});
