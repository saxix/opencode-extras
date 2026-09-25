#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const SRC = path.join(REPO_ROOT, 'src');
const SKILL_PREFIX = 'sax-';
const LEGACY_PKG = 'saxix-utils';

// --- CLI parsing ---
const args = process.argv.slice(2);

function has(flag) { return args.includes(flag); }
function get(flag, def = undefined) {
  const i = args.indexOf(flag);
  if (i !== -1 && i + 1 < args.length && !args[i + 1].startsWith('--')) return args[i + 1];
  return def;
}
function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

const showHelp = has('--help') || has('-h');
const dryRun = has('--dry-run');
const uninstall = has('--uninstall');
const useLink = has('--link');
const globalFlag = has('--global');
const projectFlag = has('--project');
const prefixFlag = get('--prefix');
let prefix = prefixFlag || process.env.PREFIX || os.homedir();
const agentValues = ['opencode', 'compat', 'claude', 'codex', 'pi'];

function help() {
  console.log(`
opencode-utils installer

Usage:
  npx opencode-utils [options]
  npx github:saxix/opencode-utils [options]
  opencode-utils [options]          (via npm bin)

Options:
  --agent <target>  Select one target: opencode (default), compat, claude, codex, pi
  --global          Install globally (default unless --project)
  --project         Install in the current project
  --copy            Copy files per-item (default, coexistence-safe)
  --link            Symlink per-item (local dev live, opt-in)
  --prefix <dir>    Override HOME prefix (also env PREFIX)
  --uninstall       Remove installed items
  --dry-run         Show what would be done
  --help, -h        Show this help

Examples:
  npx opencode-utils                              # opencode global (default)
  npx opencode-utils --project                    # opencode project
  npx opencode-utils --agent claude --global      # claude global
  npx opencode-utils --agent codex --project      # codex project
  npx opencode-utils --agent pi --global          # pi global
  npx opencode-utils --agent compat --link        # project .agents layout
  npx --yes github:saxix/opencode-utils --project --agent opencode
  npx opencode-utils --uninstall --agent opencode --global
  npx opencode-utils --dry-run --agent claude --global

Notes:
  - --agent accepts one target per invocation and defaults to opencode.
  - --agent compat uses ./.agents and implies --project; it cannot use --global.
  - Default is --copy per-item (coexistence-safe, no directory symlink conflict).
  - --link creates per-item symlinks: DEST/skills/sax-<name> -> src/skills/<name>.
  - With GitHub specs, --link points to npx's fetched copy/cache, not a local checkout.
  - Never creates a directory symlink (avoids conflict with other skill packs).
  - Skills are installed with prefix "${SKILL_PREFIX}" to avoid collisions (DEST/skills/sax-<name>).
`);
}

if (showHelp) { help(); process.exit(0); }

const booleanFlags = new Set(['--dry-run', '--uninstall', '--link', '--copy', '--global', '--project']);
const valueFlags = new Set(['--agent', '--prefix']);
const removedFlags = new Map([
  ['--compat', '--agent compat'],
  ['--opencode', '--agent opencode'],
  ['--claude', '--agent claude'],
  ['--codex', '--agent codex'],
  ['--all', 'separate --agent invocations'],
]);

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (booleanFlags.has(arg)) continue;
  if (valueFlags.has(arg)) {
    if (i + 1 >= args.length || args[i + 1].startsWith('--')) fail(`${arg} requires a value`);
    i += 1;
    continue;
  }
  if (removedFlags.has(arg)) fail(`${arg} has been removed; use ${removedFlags.get(arg)}`);
  fail(`Unknown option: ${arg}`);
}

if (args.filter((arg) => arg === '--agent').length > 1) fail('--agent may be specified only once');
const agent = get('--agent', 'opencode');
if (!agentValues.includes(agent)) fail(`--agent must be one of: ${agentValues.join(', ')}`);

let scopeGlobal = globalFlag;
let scopeProject = projectFlag;
if (agent === 'compat') {
  if (globalFlag) fail('--agent compat cannot be combined with --global');
  scopeProject = true;
}
if (!scopeGlobal && !scopeProject) scopeGlobal = true;

// Expand prefix
function expandPrefix(p) {
  if (p.startsWith('~/')) return path.join(os.homedir(), p.slice(2));
  return path.resolve(p);
}
prefix = expandPrefix(prefix);

const cwd = process.cwd();
const dests = [];
if (scopeGlobal) {
  const base = agent === 'opencode' ? path.join(prefix, '.config', 'opencode') : path.join(prefix, `.${agent}`);
  dests.push({ label: `${agent} (global)`, base });
}
if (scopeProject) {
  const base = agent === 'compat' ? path.join(cwd, '.agents') : path.join(cwd, `.${agent === 'opencode' ? 'opencode' : agent}`);
  dests.push({ label: agent === 'compat' ? 'agents (compat project)' : `${agent} (project)`, base });
}

function listSkills() {
  const dir = path.join(SRC, 'skills');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(n => !n.startsWith('.') && fs.statSync(path.join(dir, n)).isDirectory());
}
function listAgents() {
  const dir = path.join(SRC, 'agents');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(n => n.endsWith('.md'));
}
function listCommands() {
  const dir = path.join(SRC, 'commands');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(n => n.endsWith('.md'));
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    ensureDir(dest);
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    ensureDir(path.dirname(dest));
    fs.copyFileSync(src, dest);
  }
}

function removeRecursive(p) {
  if (!fs.existsSync(p)) return;
  fs.rmSync(p, { recursive: true, force: true });
}

function isSymlink(p) {
  try { return fs.lstatSync(p).isSymbolicLink(); } catch { return false; }
}

function prefixedSkillName(name) {
  return name.startsWith(SKILL_PREFIX) ? name : SKILL_PREFIX + name;
}

function installForDest(dest) {
  const { label, base } = dest;
  console.log(`\n[${label}] -> ${base} (${useLink ? 'link' : 'copy'}${dryRun ? ', dry-run' : ''})`);

  const skills = listSkills();
  const agents = listAgents();
  const commands = listCommands();

  const skillsDest = path.join(base, 'skills');
  const agentsDest = path.join(base, 'agents');
  const commandsDest = path.join(base, 'commands');
  const sharedSrcFile = path.join(SRC, 'agents', '_shared', 'state-persistence.md');
  const sharedDestDir = path.join(base, 'sax', 'shared');
  const sharedDestFile = path.join(sharedDestDir, 'state-persistence.md');
  const legacySharedDest = path.join(agentsDest, '_shared');

  if (uninstall) {
    for (const name of skills) {
      const prefixed = prefixedSkillName(name);
      const target = path.join(skillsDest, prefixed);
      const legacyTargets = [
        path.join(skillsDest, name),
        path.join(base, LEGACY_PKG, 'skills', name),
        path.join(base, 'skills', LEGACY_PKG, name),
      ];
      if (dryRun) console.log(`  would remove skills/${prefixed}`);
      else {
        if (fs.existsSync(target) || isSymlink(target)) { removeRecursive(target); console.log(`  removed skills/${prefixed}`); }
        for (const lt of legacyTargets) {
          if ((fs.existsSync(lt) || isSymlink(lt)) && lt !== target) { removeRecursive(lt); console.log(`  removed legacy skills/${path.basename(lt)}`); }
        }
      }
    }
    for (const name of agents) {
      const target = path.join(agentsDest, name);
      if (dryRun) console.log(`  would remove agents/${name}`);
      else if (fs.existsSync(target) || isSymlink(target)) { fs.rmSync(target, { force: true }); console.log(`  removed agents/${name}`); }
    }
    for (const name of commands) {
      const target = path.join(commandsDest, name);
      if (dryRun) console.log(`  would remove commands/${name}`);
      else if (fs.existsSync(target) || isSymlink(target)) { fs.rmSync(target, { force: true }); console.log(`  removed commands/${name}`); }
    }
    // also handle shared state-persistence (now at sax/shared)
    if (fs.existsSync(sharedSrcFile)) {
      if (dryRun) console.log(`  would remove sax/shared/state-persistence.md`);
      else {
        if (fs.existsSync(sharedDestFile) || isSymlink(sharedDestFile)) { fs.rmSync(sharedDestFile, { force: true }); console.log(`  removed sax/shared/state-persistence.md`); }
        try {
          if (fs.existsSync(sharedDestDir) && fs.readdirSync(sharedDestDir).length === 0) { fs.rmdirSync(sharedDestDir); console.log(`  removed empty ${sharedDestDir}`); }
          const saxDir = path.join(base, 'sax');
          if (fs.existsSync(saxDir) && fs.readdirSync(saxDir).length === 0) { fs.rmdirSync(saxDir); console.log(`  removed empty ${saxDir}`); }
        } catch {}
        if (fs.existsSync(legacySharedDest) || isSymlink(legacySharedDest)) { removeRecursive(legacySharedDest); console.log(`  removed legacy agents/_shared`); }
      }
    }
    // also remove legacy directory symlinks if present
    for (const legacy of [skillsDest, agentsDest, commandsDest]) {
      if (isSymlink(legacy)) {
        if (dryRun) console.log(`  would remove legacy dir symlink ${legacy}`);
        else { fs.unlinkSync(legacy); console.log(`  removed legacy dir symlink ${legacy}`); }
      }
    }
    // clean up empty package dirs if no remaining items
    if (!dryRun) {
      try {
        for (const sub of [skillsDest, agentsDest, commandsDest]) {
          if (fs.existsSync(sub) && fs.readdirSync(sub).length === 0) {
            fs.rmdirSync(sub);
            console.log(`  removed empty ${sub}`);
          }
        }
        const legacyPkg = path.join(base, LEGACY_PKG);
        if (fs.existsSync(legacyPkg)) {
          try {
            const rem = fs.readdirSync(legacyPkg);
            if (rem.length === 0) {
              fs.rmdirSync(legacyPkg);
              console.log(`  removed empty legacy package dir ${legacyPkg}`);
            } else {
              for (const p of [path.join(legacyPkg, 'skills'), path.join(legacyPkg, 'agents'), path.join(legacyPkg, 'commands')]) {
                if (fs.existsSync(p) && fs.readdirSync(p).length === 0) fs.rmdirSync(p);
              }
              if (fs.readdirSync(legacyPkg).length === 0) {
                fs.rmdirSync(legacyPkg);
                console.log(`  removed empty legacy package dir ${legacyPkg}`);
              }
            }
          } catch {}
        }
      } catch {}
    }
    return;
  }

  // install
  if (!dryRun) {
    ensureDir(skillsDest);
    ensureDir(agentsDest);
    ensureDir(commandsDest);
  } else {
    console.log(`  would ensure ${skillsDest}`);
    console.log(`  would ensure ${agentsDest}`);
    console.log(`  would ensure ${commandsDest}`);
  }

  // handle legacy directory symlink conflict
  for (const d of [skillsDest, agentsDest, commandsDest]) {
    if (isSymlink(d)) {
      console.log(`  ! legacy directory symlink detected at ${d} -> ${fs.readlinkSync(d)} (would conflict with per-item install)`);
      if (!dryRun) { fs.unlinkSync(d); ensureDir(d); console.log(`    replaced with directory`); }
    }
  }

  for (const name of skills) {
    const prefixed = prefixedSkillName(name);
    const srcPath = path.join(SRC, 'skills', name);
    const destPath = path.join(skillsDest, prefixed);
    if (dryRun) { console.log(`  would ${useLink ? 'link' : 'copy'} skills/${prefixed}`); continue; }
    removeRecursive(destPath);
    // also remove legacy unprefixed if present (collision handling migration)
    const legacyUnprefixed = path.join(skillsDest, name);
    if (legacyUnprefixed !== destPath && (fs.existsSync(legacyUnprefixed) || isSymlink(legacyUnprefixed))) {
      removeRecursive(legacyUnprefixed);
    }
    if (useLink) {
      const type = process.platform === 'win32' ? 'junction' : 'dir';
      fs.symlinkSync(srcPath, destPath, type);
      console.log(`  linked skills/${name}`);
    } else {
      copyRecursive(srcPath, destPath);
      console.log(`  copied skills/${name}`);
    }
  }
  for (const name of agents) {
    const srcPath = path.join(SRC, 'agents', name);
    const destPath = path.join(agentsDest, name);
    if (dryRun) { console.log(`  would ${useLink ? 'link' : 'copy'} agents/${name}`); continue; }
    if (fs.existsSync(destPath) || isSymlink(destPath)) fs.rmSync(destPath, { force: true });
    if (useLink) {
      fs.symlinkSync(srcPath, destPath, 'file');
      console.log(`  linked agents/${name}`);
    } else {
      ensureDir(path.dirname(destPath));
      fs.copyFileSync(srcPath, destPath);
      console.log(`  copied agents/${name}`);
    }
  }
  // install shared state-persistence to DEST/sax/shared (not under agents, to avoid being seen as agent)
  if (fs.existsSync(sharedSrcFile)) {
    if (dryRun) console.log(`  would ${useLink ? 'link' : 'copy'} sax/shared/state-persistence.md`);
    else {
      if (fs.existsSync(legacySharedDest) || isSymlink(legacySharedDest)) { removeRecursive(legacySharedDest); }
      ensureDir(sharedDestDir);
      if (fs.existsSync(sharedDestFile) || isSymlink(sharedDestFile)) fs.rmSync(sharedDestFile, { force: true });
      if (useLink) {
        fs.symlinkSync(sharedSrcFile, sharedDestFile, 'file');
        console.log(`  linked sax/shared/state-persistence.md`);
      } else {
        ensureDir(path.dirname(sharedDestFile));
        fs.copyFileSync(sharedSrcFile, sharedDestFile);
        console.log(`  copied sax/shared/state-persistence.md`);
      }
    }
  }
  for (const name of commands) {
    const srcPath = path.join(SRC, 'commands', name);
    const destPath = path.join(commandsDest, name);
    if (dryRun) { console.log(`  would ${useLink ? 'link' : 'copy'} commands/${name}`); continue; }
    if (fs.existsSync(destPath) || isSymlink(destPath)) fs.rmSync(destPath, { force: true });
    if (useLink) {
      fs.symlinkSync(srcPath, destPath, 'file');
      console.log(`  linked commands/${name}`);
    } else {
      ensureDir(path.dirname(destPath));
      fs.copyFileSync(srcPath, destPath);
      console.log(`  copied commands/${name}`);
    }
  }
}

console.log(`opencode-utils installer (${useLink ? 'link' : 'copy'} mode)`);
console.log(`src: ${SRC}`);
console.log(`prefix: ${prefix}${dryRun ? ' (dry-run)' : ''}${uninstall ? ' (uninstall)' : ''}`);

for (const d of dests) {
  installForDest(d);
}

console.log('\nDone.');
if (!uninstall && !dryRun) {
  console.log(`Installed skills with prefix "${SKILL_PREFIX}" per-item (coexistence-safe, no directory symlink).`);
  console.log('Tip: npx opencode-utils --project  for project-local opencode install');
  console.log('     npx opencode-utils --agent compat --link  for project .agents links');
}
