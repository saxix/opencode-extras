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

const showHelp = has('--help') || has('-h');
const dryRun = has('--dry-run');
const uninstall = has('--uninstall');
const useLink = has('--link');
const useCopy = has('--copy') || !useLink; // default copy
const globalFlag = has('--global');
const projectFlag = has('--project');
const compatFlag = has('--compat');
const opencodeFlag = has('--opencode');
const claudeFlag = has('--claude');
const codexFlag = has('--codex');
const allFlag = has('--all');
const prefixFlag = get('--prefix');
let prefix = prefixFlag || process.env.PREFIX || os.homedir();

function help() {
  console.log(`
opencode-utils installer

Usage:
  npx opencode-utils [options]
  npx github:saxix/opencode-utils [options]
  opencode-utils [options]          (via npm bin)

Options:
  --global        Install to HOME (~/.config/opencode, ~/.claude, ~/.codex) [default if no --project]
  --project       Install to project ./.opencode, ./.claude, ./.codex
  --compat        With --project, install to ./.agents (compat) instead of dedicated folders (only with --project)
  --opencode      Only opencode
  --claude        Only claude
  --codex         Only codex
  --all           All runtimes (opencode + claude + codex)
  --copy          Copy files per-item (default, coexistence-safe)
  --link          Symlink per-item (dev live, opt-in)
  --prefix <dir>  Override HOME prefix (also env PREFIX)
  --uninstall     Remove installed items
  --dry-run       Show what would be done
  --help, -h      Show this help

Examples:
  npx opencode-utils --global --all                 # global, all runtimes, copy
  npx opencode-utils --project --opencode          # project-local opencode only
  npx opencode-utils --project --compat            # project-local compat: .agents/saxix-utils
  npx opencode-utils --global --claude --copy      # only claude global
  npx opencode-utils --project --link              # dev live symlinks
  npx opencode-utils --uninstall --global --all    # remove
  npx opencode-utils --dry-run --global --all      # preview

Notes:
  - Default is --copy per-item (coexistence-safe, no directory symlink conflict).
  - --link creates per-item symlinks: DEST/skills/sax-<name> -> src/skills/<name>.
  - Never creates a directory symlink (avoids conflict with other skill packs).
  - Skills are installed with prefix "${SKILL_PREFIX}" to avoid collisions (DEST/skills/sax-<name>).
`);
}

if (showHelp) { help(); process.exit(0); }

if (compatFlag && !projectFlag) {
  console.error('Error: --compat requires --project');
  process.exit(1);
}

// Resolve scope: if nothing specified, default to global + opencode
let scopeGlobal = globalFlag || (!globalFlag && !projectFlag);
let scopeProject = projectFlag;
// allow both --global --project
if (!scopeGlobal && !scopeProject) scopeGlobal = true;

let wantOpencode = opencodeFlag;
let wantClaude = claudeFlag;
let wantCodex = codexFlag;
let wantAll = allFlag;
if (!wantOpencode && !wantClaude && !wantCodex && !wantAll) {
  // default: opencode only (backward compat); with --all flag later
  // if user asked npx without flags -> install opencode global
  wantOpencode = true;
}
if (wantAll) {
  wantOpencode = wantClaude = wantCodex = true;
}

// Expand prefix
function expandPrefix(p) {
  if (p.startsWith('~/')) return path.join(os.homedir(), p.slice(2));
  return path.resolve(p);
}
prefix = expandPrefix(prefix);

const dests = [];
if (scopeGlobal) {
  if (wantOpencode) dests.push({ label: 'opencode (global)', base: path.join(prefix, '.config', 'opencode') });
  if (wantClaude) dests.push({ label: 'claude (global)', base: path.join(prefix, '.claude') });
  if (wantCodex) dests.push({ label: 'codex (global)', base: path.join(prefix, '.codex') });
}
if (scopeProject) {
  const cwd = process.cwd();
  if (compatFlag) {
    dests.push({ label: 'agents (compat project)', base: path.join(cwd, '.agents') });
  } else {
    if (wantOpencode) dests.push({ label: 'opencode (project)', base: path.join(cwd, '.opencode') });
    if (wantClaude) dests.push({ label: 'claude (project)', base: path.join(cwd, '.claude') });
    if (wantCodex) dests.push({ label: 'codex (project)', base: path.join(cwd, '.codex') });
  }
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
  console.log('Tip: npx opencode-utils --project --all  for project-local install');
  console.log('     npx opencode-utils --link --global --all  for dev live symlinks');
}
