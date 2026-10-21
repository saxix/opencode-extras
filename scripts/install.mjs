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
// Commands retired in favour of the sax-issue-bookmarks skill. Removed on
// install and uninstall so a stale entry never shadows the skill.
const RETIRED_COMMANDS = ['issue-save.md', 'issue-load.md', 'issue-list.md', 'new-spec.md', '~new-spec.md'];

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

function help() {
  console.log(`
opencode-extras installer

Usage:
  npx opencode-extras [options]
  npx github:saxix/opencode-extras [options]
  opencode-extras [options]          (via npm bin)

Options:
  --global          Install globally (default unless --project)
  --project         Install in the current project
  --copy            Copy files per-item (default, coexistence-safe)
  --link            Symlink per-item (local dev live, opt-in)
  --prefix <dir>    Override HOME prefix (also env PREFIX)
  --uninstall       Remove installed items
  --dry-run         Show what would be done
  --help, -h        Show this help

Examples:
  npx opencode-extras                              # global (~/.config/opencode)
  npx opencode-extras --project                    # project (.opencode)
  npx --yes github:saxix/opencode-extras --project
  npx opencode-extras --uninstall --global
  npx opencode-extras --dry-run

Notes:
  - Only opencode is supported. The installer writes to
    ~/.config/opencode (global) or ./.opencode (project).
  - The --agent selector has been removed; pass no target flag.
  - Default is --copy per-item (coexistence-safe, no directory symlink conflict).
  - --link creates per-item symlinks: DEST/skills/sax-<name> -> src/skills/<name>.
  - With GitHub specs, --link points to npx's fetched copy/cache, not a local checkout.
  - Never symlinks skills/, agents/, or commands/ themselves (avoids conflict
    with other skill packs); every item is linked or copied on its own.
  - Skills are installed with prefix "${SKILL_PREFIX}" to avoid collisions (DEST/skills/sax-<name>).
`);
}

if (showHelp) { help(); process.exit(0); }

const booleanFlags = new Set(['--dry-run', '--uninstall', '--link', '--copy', '--global', '--project']);
const valueFlags = new Set(['--prefix']);
const removedFlags = new Map([
  ['--agent', 'only opencode is supported; pass no target flag'],
  ['--compat', 'only opencode is supported; use --project for ./.opencode'],
  ['--opencode', 'opencode is the only target; omit the flag'],
  ['--claude', 'only opencode is supported'],
  ['--codex', 'only opencode is supported'],
  ['--pi', 'only opencode is supported'],
  ['--all', 'only opencode is supported'],
]);

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (booleanFlags.has(arg)) continue;
  if (valueFlags.has(arg)) {
    if (i + 1 >= args.length || args[i + 1].startsWith('--')) fail(`${arg} requires a value`);
    i += 1;
    continue;
  }
  if (removedFlags.has(arg)) fail(`${arg} has been removed; ${removedFlags.get(arg)}`);
  fail(`Unknown option: ${arg}`);
}

let scopeGlobal = globalFlag;
let scopeProject = projectFlag;
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
  dests.push({ label: 'opencode (global)', base: path.join(prefix, '.config', 'opencode') });
}
if (scopeProject) {
  dests.push({ label: 'opencode (project)', base: path.join(cwd, '.opencode') });
}

// Editor backups (`~name`) and dotfiles are git-ignored scratch, never shipped.
function isSourceItem(name) {
  return !name.startsWith('.') && !name.startsWith('~');
}
function listSkills() {
  const dir = path.join(SRC, 'skills');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(n => isSourceItem(n) && fs.statSync(path.join(dir, n)).isDirectory());
}
function listAgents() {
  const dir = path.join(SRC, 'agents');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(n => isSourceItem(n) && n.endsWith('.md'));
}
function listCommands() {
  const dir = path.join(SRC, 'commands');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(n => isSourceItem(n) && n.endsWith('.md'));
}
// Top-level directories under src/ that the installer owns. plugins/ is
// reserved for opencode itself: it is never installed, and it is never
// uninstalled, so a user's own DEST/plugins/ cannot be wiped by `--uninstall`.
// Any other top-level directory is not a definition kind opencode can load, so
// it is not installed; the installer warns instead of silently dropping it.
const RESERVED_SRC_DIRS = new Set(['agents', 'skills', 'commands', 'plugins']);
function unexpectedSrcDirs() {
  return fs.readdirSync(SRC, { withFileTypes: true })
    .filter(e => e.isDirectory() && isSourceItem(e.name) && !RESERVED_SRC_DIRS.has(e.name))
    .map(e => e.name)
    .sort();
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
  // force:true makes a missing path a no-op, and unlike an existsSync guard it
  // still removes a symlink whose target is gone.
  fs.rmSync(p, { recursive: true, force: true });
}

function isSymlink(p) {
  try { return fs.lstatSync(p).isSymbolicLink(); } catch { return false; }
}

// Remove each dir in the list that exists and is empty, deepest first.
function removeEmptyDirs(...dirs) {
  for (const dir of dirs) {
    try {
      if (fs.existsSync(dir) && !isSymlink(dir) && fs.readdirSync(dir).length === 0) {
        fs.rmdirSync(dir);
        console.log(`  removed empty ${dir}`);
      }
    } catch {}
  }
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
  const legacySaxDir = path.join(base, 'sax');
  const legacySharedDest = path.join(agentsDest, '_shared');
  // Older versions installed the shared specs as DEST/_shared/sax/. That
  // namespace is now a skill (sax-project-context), so the stale copy is
  // removed on install and on uninstall.
  const legacySharedSpecDest = path.join(base, '_shared', 'sax');
  const legacySharedSpecRoot = path.join(base, '_shared');
  const legacySpecTargets = [
    path.join(legacySaxDir, 'shared', 'state-persistence.md'),
    legacySharedDest,
    legacySharedSpecDest,
  ];

  function removeLegacySpecs() {
    for (const target of legacySpecTargets) {
      if (fs.existsSync(target) || isSymlink(target)) { removeRecursive(target); console.log(`  removed legacy ${path.relative(base, target)}`); }
    }
    removeEmptyDirs(path.join(legacySaxDir, 'shared'), legacySaxDir);
    // A `--link` install of the retired namespace left DEST/_shared as a
    // symlink into src/_shared. Remove it only when it points into this
    // checkout or is already dangling, never a real directory the user owns.
    if (isSymlink(legacySharedSpecRoot)) {
      const link = fs.readlinkSync(legacySharedSpecRoot);
      const dangling = !fs.existsSync(legacySharedSpecRoot);
      if (dangling || link === path.join(SRC, '_shared')) {
        fs.unlinkSync(legacySharedSpecRoot);
        console.log(`  removed legacy ${path.relative(base, legacySharedSpecRoot)} symlink`);
      }
    }
    // The parent of the retired shared-spec namespace is removed only when it
    // is left empty, so no user content is lost.
    removeEmptyDirs(legacySharedSpecRoot);
  }

  function reportLegacySpecs(exists) {
    for (const target of legacySpecTargets) {
      if (exists(target)) console.log(`  would remove legacy ${path.relative(base, target)}`);
    }
  }

  if (uninstall) {
    const exists = p => fs.existsSync(p) || isSymlink(p);
    for (const name of skills) {
      const prefixed = prefixedSkillName(name);
      const target = path.join(skillsDest, prefixed);
      const legacyTargets = [
        path.join(skillsDest, name),
        path.join(base, LEGACY_PKG, 'skills', name),
        path.join(base, 'skills', LEGACY_PKG, name),
      ];
      if (dryRun) { if (exists(target)) console.log(`  would remove skills/${prefixed}`); }
      else {
        if (exists(target)) { removeRecursive(target); console.log(`  removed skills/${prefixed}`); }
        for (const lt of legacyTargets) {
          if (exists(lt) && lt !== target) { removeRecursive(lt); console.log(`  removed legacy skills/${path.basename(lt)}`); }
        }
      }
    }
    for (const name of agents) {
      const target = path.join(agentsDest, name);
      if (dryRun) { if (exists(target)) console.log(`  would remove agents/${name}`); }
      else if (exists(target)) { fs.rmSync(target, { force: true }); console.log(`  removed agents/${name}`); }
    }
    for (const name of commands) {
      const target = path.join(commandsDest, name);
      if (dryRun) { if (exists(target)) console.log(`  would remove commands/${name}`); continue; }
      if (exists(target)) { fs.rmSync(target, { force: true }); console.log(`  removed commands/${name}`); }
    }
    for (const name of RETIRED_COMMANDS) {
      const target = path.join(commandsDest, name);
      if (dryRun) { if (exists(target)) console.log(`  would remove retired commands/${name}`); continue; }
      if (exists(target)) { fs.rmSync(target, { force: true }); console.log(`  removed retired commands/${name}`); }
    }
    if (dryRun) reportLegacySpecs(exists);
    else removeLegacySpecs();
    // Older versions installed src/plugins/ as DEST/plugins/. Remove it only
    // when it is a symlink pointing into this checkout's src/, never a real
    // directory (which would belong to the user).
    {
      const pluginsDest = path.join(base, 'plugins');
      if (isSymlink(pluginsDest) && fs.readlinkSync(pluginsDest) === path.join(SRC, 'plugins')) {
        if (dryRun) console.log(`  would remove legacy plugins symlink ${pluginsDest}`);
        else { fs.unlinkSync(pluginsDest); console.log(`  removed legacy plugins symlink ${pluginsDest}`); }
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
  if (dryRun) reportLegacySpecs(p => fs.existsSync(p) || isSymlink(p));
  else removeLegacySpecs();
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
  // drop commands retired in favour of the sax-issue-bookmarks skill
  for (const name of RETIRED_COMMANDS) {
    const target = path.join(commandsDest, name);
    if (dryRun) { console.log(`  would remove retired commands/${name}`); continue; }
    if (fs.existsSync(target) || isSymlink(target)) { fs.rmSync(target, { force: true }); console.log(`  removed retired commands/${name}`); }
  }
}

console.log(`opencode-extras installer (${useLink ? 'link' : 'copy'} mode)`);
console.log(`src: ${SRC}`);
console.log(`prefix: ${prefix}${dryRun ? ' (dry-run)' : ''}${uninstall ? ' (uninstall)' : ''}`);

const unexpected = unexpectedSrcDirs();
if (unexpected.length > 0) {
  console.log(
    `  ! not installed: ${unexpected.join(', ')}/ -- opencode loads agents, skills, and commands only;`
    + ' move the content into a skill (src/skills/<name>/SKILL.md) or a command.'
  );
}

for (const d of dests) {
  installForDest(d);
}

console.log('\nDone.');
if (!uninstall && !dryRun) {
  console.log(`Installed skills with prefix "${SKILL_PREFIX}" per-item (coexistence-safe, no directory symlink).`);
  console.log('Tip: npx opencode-extras --project  for project-local opencode install');
}
