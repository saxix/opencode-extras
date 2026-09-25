import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, '..');
export const SRC_SKILLS = path.join(REPO_ROOT, 'src', 'skills');
export const SRC_AGENTS = path.join(REPO_ROOT, 'src', 'agents');
export const SRC_COMMANDS = path.join(REPO_ROOT, 'src', 'commands');
export const INSTALL_MJS = path.join(REPO_ROOT, 'scripts', 'install.mjs');
export const PKG_NAME = 'saxix-utils';
export const SKILL_PREFIX = 'sax-';

export function parseFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const yaml = m[1];
  const lines = yaml.split('\n');
  const data = {};
  let currentKey = null;
  let currentVal = '';
  for (const line of lines) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) {
      if (currentKey) data[currentKey] = currentVal.trim();
      currentKey = kv[1];
      currentVal = kv[2];
    } else if (currentKey) {
      currentVal += '\n' + line;
    }
  }
  if (currentKey) data[currentKey] = currentVal.trim();
  for (const k of Object.keys(data)) {
    let v = data[k];
    if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
      v = v.slice(1, -1);
      data[k] = v;
    }
  }
  return data;
}

export function listSkills() {
  return fs.readdirSync(SRC_SKILLS).filter(n => !n.startsWith('.') && fs.statSync(path.join(SRC_SKILLS, n)).isDirectory());
}

export function listAgents() {
  return fs.readdirSync(SRC_AGENTS).filter(n => n.endsWith('.md'));
}

export function listCommands() {
  return fs.readdirSync(SRC_COMMANDS).filter(n => n.endsWith('.md'));
}

export function runInstall(args, env = {}, cwd = REPO_ROOT) {
  const fullEnv = { ...process.env, ...env };
  return execSync(`node "${INSTALL_MJS}" ${args}`, { cwd, env: fullEnv, encoding: 'utf8' });
}
