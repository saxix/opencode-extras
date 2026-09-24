#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const SRC = path.join(REPO_ROOT, 'src');

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
  npx opencode-utils --global --claude --copy      # only claude global
  npx opencode-utils --project --link              # dev live symlinks
  npx opencode-utils --uninstall --global --all    # remove
  npx opencode-utils --dry-run --global --all      # preview

Notes:
  - Default is --copy per-item (coexistence-safe, no directory symlink conflict).
  - --link creates per-item symlinks: DEST/skills/<name> -> src/skills/<name>.
  - Never creates a directory symlink (avoids conflict with other skill packs).
`);
}

if (showHelp) { help(); process.exit(0); }

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
  if (wantOpencode) dests.push({ label: 'opencode (project)', base: path.join(cwd, '.opencode') });
  if (wantClaude) dests.push({ label: 'claude (project)', base: path.join(cwd, '.claude') });
  if (wantCodex) dests.push({ label: 'codex (project)', base: path.join(cwd, '.codex') });
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

function installForDest(dest) {
  const { label, base } = dest;
  console.log(`\n[${label}] -> ${base} (${useLink ? 'link' : 'copy'}${dryRun ? ', dry-run' : ''})`);

  const skills = listSkills();
  const agents = listAgents();
  const commands = listCommands();

  const skillsDest = path.join(base, 'skills');
  const agentsDest = path.join(base, 'agents');
  const commandsDest = path.join(base, 'commands');

  if (uninstall) {
    for (const name of skills) {
      const target = path.join(skillsDest, name);
      if (dryRun) console.log(`  would remove skills/${name}`);
      else if (fs.existsSync(target) || isSymlink(target)) { removeRecursive(target); console.log(`  removed skills/${name}`); }
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
    // also remove legacy directory symlinks if present
    for (const legacy of [skillsDest, agentsDest, commandsDest]) {
      if (isSymlink(legacy)) {
        if (dryRun) console.log(`  would remove legacy dir symlink ${legacy}`);
        else { fs.unlinkSync(legacy); console.log(`  removed legacy dir symlink ${legacy}`); }
      }
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
    const srcPath = path.join(SRC, 'skills', name);
    const destPath = path.join(skillsDest, name);
    if (dryRun) { console.log(`  would ${useLink ? 'link' : 'copy'} skills/${name}`); continue; }
    removeRecursive(destPath);
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
  // copy shared agent assets (e.g., _shared) so relative references remain valid after install
  const sharedSrc = path.join(SRC, 'agents', '_shared');
  if (fs.existsSync(sharedSrc)) {
    const sharedDest = path.join(agentsDest, '_shared');
    if (dryRun) console.log(`  would ${useLink ? 'link' : 'copy'} agents/_shared`);
    else {
      removeRecursive(sharedDest);
      if (useLink) {
        const type = process.platform === 'win32' ? 'junction' : 'dir';
        fs.symlinkSync(sharedSrc, sharedDest, type);
        console.log(`  linked agents/_shared`);
      } else {
        copyRecursive(sharedSrc, sharedDest);
        console.log(`  copied agents/_shared`);
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
  console.log('Installed per-item (coexistence-safe, no directory symlink).');
  console.log('Tip: npx opencode-utils --project --all  for project-local install');
  console.log('     npx opencode-utils --link --global --all  for dev live symlinks');
}
