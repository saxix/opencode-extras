import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT } from './helpers.mjs';
import { GOLDEN_CASES } from './golden-cases.mjs';

// Rule-based evaluators over the analyst definitions. See golden-cases.mjs for
// why these are rule-based rather than live generation. Every case must pass;
// there is no partial credit because the artifacts are definitions, not
// sampled model output.

const read = rel => fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8');

function evaluate(check, content, caseId) {
  switch (check.kind) {
    case 'match':
      assert.match(content, check.value, `${caseId}: ${check.label}`);
      return;
    case 'notMatch':
      assert.doesNotMatch(content, check.value, `${caseId}: ${check.label}`);
      return;
    case 'count': {
      const re = new RegExp(check.value, 'g');
      const n = (content.match(re) ?? []).length;
      assert.ok(n >= check.min, `${caseId}: ${check.label} (found ${n}, need >= ${check.min})`);
      return;
    }
    case 'balancedFences': {
      const n = content.split('\n').filter(l => /^\s*```/.test(l)).length;
      assert.equal(n % 2, 0, `${caseId}: ${check.label} (${n} fences)`);
      return;
    }
    case 'ascii': {
      const prose = content.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '');
      assert.doesNotMatch(prose, /[^\x00-\x7F]/, `${caseId}: ${check.label}`);
      return;
    }
    default:
      assert.fail(`${caseId}: unknown check kind ${check.kind}`);
  }
}

describe('golden analyst flows', () => {
  it('the golden set has at least 10 cases with unique ids', () => {
    assert.ok(GOLDEN_CASES.length >= 10, `only ${GOLDEN_CASES.length} golden cases`);
    const ids = GOLDEN_CASES.map(c => c.id);
    assert.equal(new Set(ids).size, ids.length, 'duplicate golden case id');
  });

  it('every case names an existing source and at least one check', () => {
    for (const c of GOLDEN_CASES) {
      assert.ok(fs.existsSync(path.join(REPO_ROOT, c.source)), `${c.id} source missing: ${c.source}`);
      assert.ok(c.checks.length > 0, `${c.id} has no checks`);
    }
  });

  for (const c of GOLDEN_CASES) {
    it(`${c.id} ${c.scenario}`, () => {
      const content = read(c.source);
      for (const check of c.checks) evaluate(check, content, c.id);
    });
  }
});
