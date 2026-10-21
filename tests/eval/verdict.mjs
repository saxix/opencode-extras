// Pure helpers of the reviewer evaluation runner (`run-eval.mjs`).
//
// They live in their own module so `npm test` can exercise them without the
// `opencode` binary, a provider, or a network call. The runner and the tests
// import the same code, so a change in the verdict rules is covered by the
// static suite.

// Parses the runner's argv: `--keep`, `--model <ref>`, and case ids. The value
// of `--model` must not be mistaken for a case id, which is why the selection is
// explicit rather than a plain positional slice.
export function parseArgs(argv) {
  const modelIndex = argv.indexOf('--model');
  const model = modelIndex === -1 ? null : argv[modelIndex + 1];
  const wanted = argv.filter(
    (a, i) => !a.startsWith('--') && (modelIndex === -1 || i !== modelIndex + 1)
  );
  return { keep: argv.includes('--keep'), model, wanted };
}

// A denial only fails the case when the command was on the reviewer allowlist,
// which would mean the agent and its documented policy disagree. A denial of a
// convenience command the reviewer is not meant to run (for example
// `python3 -m pytest`) is expected: the policy says fall back, not fail.
// Keep this in sync with the `action: shell` resources in
// `src/agents/reviewer.md`: it must match exactly those, no more and no fewer.
export const ALLOWED =
  /^(gh (status|auth status|pr (view|diff|checks|list|review|comment)|repo view)|git (diff|status|show|log|rev-parse|merge-base|ls-files|branch --show-current|branch --list|branch -r|branch -a)(\s|$))/;

// The denied command is on the preceding `x <command> failed` line. The marker
// glyphs are the ones the TUI prints; the ANSI colour codes are stripped first.
export function commandOf(lines, at) {
  const clean = line => line.replace(/\u001b\[[0-9;]*m/g, '').trim();
  for (let i = at; i >= 0 && i >= at - 3; i -= 1) {
    const line = clean(lines[i] || '');
    const match = line.match(/^(?:\u2717|\$)\s*(.*?)(?:\s+failed)?$/);
    if (match) return match[1];
  }
  return '(unknown)';
}

// A denied command surfaces as a `x <command> failed` line immediately followed
// by `Error: Permission denied: shell`.
export function extractDenials(output) {
  const lines = output.split('\n');
  const denials = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (/Permission denied: shell/.test(lines[i])) {
      denials.push({ command: commandOf(lines, i - 1) });
    }
  }
  return denials;
}

// The case passes when the output matches its anchored expectation and no
// allowlisted command was denied.
export function verdictOf(spec, output, denials) {
  if (spec.forbid_any?.some(s => output.includes(s))) return 'FAIL';
  if (spec.expect && !output.includes(spec.expect)) return 'FAIL';
  if (spec.expect_any && !spec.expect_any.some(s => output.includes(s))) return 'FAIL';
  if (denials.some(d => ALLOWED.test(d.command))) return 'FAIL';
  return 'PASS';
}
