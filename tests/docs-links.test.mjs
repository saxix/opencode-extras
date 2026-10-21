import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT } from './helpers.mjs';

const DOCS = path.join(REPO_ROOT, 'docs');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(abs);
    return entry.name.endsWith('.md') ? [abs] : [];
  });
}

// Inline links only; fenced code blocks and indented code are not scanned.
function relativeLinks(file) {
  const text = fs.readFileSync(file, 'utf8').replace(/^```[\s\S]*?^```/gm, '');
  const links = [];
  for (const match of text.matchAll(/!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const target = match[1];
    if (/^(https?:|mailto:|tel:|#|\/)/.test(target)) continue;
    links.push(target.split('#')[0].split('?')[0]);
  }
  return links.filter(Boolean);
}

describe('documentation links', () => {
  it('every relative link resolves inside docs/', () => {
    const failures = [];
    for (const file of walk(DOCS)) {
      const rel = path.relative(REPO_ROOT, file);
      for (const link of relativeLinks(file)) {
        const resolved = path.resolve(path.dirname(file), link);
        if (!fs.existsSync(resolved)) {
          failures.push(`${rel} -> ${link}`);
        }
      }
    }
    assert.deepEqual(failures, [], `broken relative links:\n${failures.join('\n')}`);
  });
});
