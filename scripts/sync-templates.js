#!/usr/bin/env node
/**
 * sync-templates.js
 * Copies .claude/ from the SDD repo root into create-sdd/templates/.claude/
 * Run: node scripts/sync-templates.js
 */
import { copySync, removeSync, ensureDirSync } from 'fs-extra/esm';
import { readdirSync, statSync, existsSync } from 'fs';
import { join, relative, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PACKAGE_ROOT = resolve(__dirname, '..');
const SDD_ROOT = resolve(PACKAGE_ROOT, '..');
const TEMPLATES_DIR = join(PACKAGE_ROOT, 'templates');

// Files/dirs to EXCLUDE from templates (runtime or project-specific)
const EXCLUDE = new Set([
  '.claude/memory/archive',
  '.claude/memory/annotations.md',
  '.claude/memory/gitnexus-registry.md',
  '.claude/memory/user_role.md',
  '.claude/memory/feedback_rules.md',
  '.claude/memory/project_tech_decisions.md',
  '.claude/memory/reference_links.md',
  '.claude/settings.json', // handled separately as settings.json.template
]);

function shouldExclude(relPath) {
  return [...EXCLUDE].some((ex) => relPath === ex || relPath.startsWith(ex + '/'));
}

function syncDir(srcDir, destDir, baseRel = '') {
  ensureDirSync(destDir);
  const entries = readdirSync(srcDir);
  for (const entry of entries) {
    const relPath = baseRel ? `${baseRel}/${entry}` : entry;
    const src = join(srcDir, entry);
    const dest = join(destDir, entry);
    if (shouldExclude(relPath)) {
      console.log(`  SKIP  ${relPath}`);
      continue;
    }
    const stat = statSync(src);
    if (stat.isDirectory()) {
      syncDir(src, dest, relPath);
    } else {
      copySync(src, dest, { overwrite: true });
      console.log(`  COPY  ${relPath}`);
    }
  }
}

console.log('=== sync-templates ===');
console.log(`SDD root : ${SDD_ROOT}`);
console.log(`Templates: ${TEMPLATES_DIR}`);
console.log('');

// 1. Sync .claude/
const srcClaude = join(SDD_ROOT, '.claude');
const destClaude = join(TEMPLATES_DIR, '.claude');
console.log('Syncing .claude/ ...');
syncDir(srcClaude, destClaude, '.claude');

// 2. Copy settings.json → templates/settings.json.template
copySync(
  join(SDD_ROOT, '.claude', 'settings.json'),
  join(TEMPLATES_DIR, 'settings.json.template'),
  { overwrite: true }
);
console.log('  COPY  settings.json.template');

console.log('');
console.log('Done.');
