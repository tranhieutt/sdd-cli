import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

/** Returns true if the directory is inside a git repo */
export function isGitRepo(dir: string): boolean {
  try {
    execSync('git rev-parse --git-dir', { cwd: dir, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/** Init a git repo in dir if one doesn't exist */
export function initGitRepo(dir: string): void {
  if (!isGitRepo(dir)) {
    execSync('git init', { cwd: dir, stdio: 'pipe' });
  }
}

/** Write a .gitignore that excludes SDD runtime data */
export function writeGitignore(dir: string): void {
  const path = join(dir, '.gitignore');
  if (existsSync(path)) return; // never overwrite user's .gitignore

  writeFileSync(path, [
    '# SDD runtime data',
    '.claude/memory/archive/',
    'production/session-state/',
    'production/session-logs/',
    '',
    '# Dependencies',
    'node_modules/',
    '',
    '# Environment',
    '.env',
    '.env.local',
    '',
  ].join('\n'), 'utf-8');
}
