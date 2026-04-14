/**
 * checksum.ts — track which SDD template files have been customized by the user.
 *
 * Strategy: at install time, store SHA-1 of each template file in
 * .claude/sdd-checksums.json. At upgrade time, compare current file
 * content against the stored hash — if different, the user has edited it.
 */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export type ChecksumMap = Record<string, string>; // relPath → sha1

export function sha1(content: string): string {
  return createHash('sha1').update(content).digest('hex');
}

export function loadChecksums(targetDir: string): ChecksumMap {
  const path = join(targetDir, '.claude', 'sdd-checksums.json');
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as ChecksumMap;
  } catch {
    return {};
  }
}

export function saveChecksums(targetDir: string, map: ChecksumMap): void {
  const path = join(targetDir, '.claude', 'sdd-checksums.json');
  writeFileSync(path, JSON.stringify(map, null, 2), 'utf-8');
}

/**
 * Returns true if the file at `absPath` has been modified by the user
 * compared to the stored checksum.
 */
export function isUserModified(absPath: string, stored: ChecksumMap, relPath: string): boolean {
  const storedHash = stored[relPath];
  if (!storedHash) return false; // no baseline → treat as unmodified
  if (!existsSync(absPath)) return false;
  const current = sha1(readFileSync(absPath, 'utf-8'));
  return current !== storedHash;
}

/**
 * Build a checksum map from a set of installed files.
 */
export function buildChecksums(files: Array<{ abs: string; rel: string }>): ChecksumMap {
  const map: ChecksumMap = {};
  for (const { abs, rel } of files) {
    if (existsSync(abs)) {
      map[rel] = sha1(readFileSync(abs, 'utf-8'));
    }
  }
  return map;
}
