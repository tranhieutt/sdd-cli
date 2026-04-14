import { Command } from 'commander';
import * as p from '@clack/prompts';
import chalk from 'chalk';
import { resolve, join, basename } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { install } from '../template/installer.js';
import { buildVars } from '../template/engine.js';
import { readPackageVersion } from '../utils/version.js';
import { loadChecksums, saveChecksums, buildChecksums } from '../utils/checksum.js';
import { readdirSync, statSync } from 'fs';

export const MODULES = ['skills', 'rules', 'hooks', 'memory', 'agents', 'docs'] as const;
export type Module = (typeof MODULES)[number];

const MODULE_DESCRIPTIONS: Record<Module, string> = {
  agents:  '27 specialist agent definitions (backend, frontend, QA, ...)',
  skills:  '115 slash-command skills (/plan, /tdd, /spec, ...)',
  rules:   '13 domain coding rules (api, db, frontend, secrets, ...)',
  hooks:   '11 lifecycle hooks (session-start, bash-guard, validate-commit, ...)',
  memory:  'MEMORY.md tiered memory system',
  docs:    'Internal SDD documentation & templates',
};

export function addCommand(): Command {
  return new Command('add')
    .description(`Add or update a specific SDD module: ${MODULES.join(', ')}`)
    .argument('<module>', `Module to add: ${MODULES.join(' | ')}`)
    .option('--overwrite', 'Overwrite existing files (default: skip)')
    .option('-y, --yes', 'Skip confirmation prompt')
    .action(async (module: string, opts: { overwrite?: boolean; yes?: boolean }) => {
      await run(process.cwd(), module, opts);
    });
}

async function run(
  targetDir: string,
  module: string,
  opts: { overwrite?: boolean; yes?: boolean }
): Promise<void> {
  const absTarget = resolve(targetDir);

  p.intro(chalk.bgCyan(` sdd add ${module} `) + `  ${MODULE_DESCRIPTIONS[module as Module] ?? ''}`);

  // 1. Validate module name
  if (!MODULES.includes(module as Module)) {
    p.log.error(
      `Unknown module "${module}"\n` +
      `  Available: ${MODULES.join(', ')}`
    );
    process.exit(1);
  }

  // 2. Check SDD is initialized
  const versionFile = join(absTarget, '.claude', 'sdd-version.json');
  if (!existsSync(versionFile)) {
    p.log.warn('SDD not initialized in this directory. Run `sdd init` first.');
    process.exit(1);
  }

  // 3. Detect if module already installed
  const moduleDir = join(absTarget, '.claude', module);
  const alreadyInstalled = existsSync(moduleDir);
  const strategy = opts.overwrite ? 'overwrite' : 'skip';

  if (alreadyInstalled && !opts.overwrite && !opts.yes) {
    const action = await p.select({
      message: `Module "${module}" is already installed. What would you like to do?`,
      options: [
        { value: 'update',  label: 'Update — add missing files, skip existing ones' },
        { value: 'replace', label: 'Replace — overwrite all files with latest templates' },
        { value: 'cancel',  label: 'Cancel' },
      ],
    });

    if (p.isCancel(action) || action === 'cancel') {
      p.cancel('Aborted.');
      process.exit(0);
    }

    if (action === 'replace') {
      opts.overwrite = true;
    }
  }

  // 4. Confirm for overwrite
  if (opts.overwrite && !opts.yes) {
    const confirm = await p.confirm({
      message: `Overwrite all files in .claude/${module}/?`,
      initialValue: false,
    });
    if (p.isCancel(confirm) || !confirm) { p.cancel('Aborted.'); process.exit(0); }
  }

  // 5. Build template vars from existing CLAUDE.md
  const sddVersion = readPackageVersion();
  const stackVars = extractStackFromClaudeMd(join(absTarget, 'CLAUDE.md'));
  const vars = buildVars(
    { ...stackVars, PROJECT_NAME: basename(absTarget) },
    basename(absTarget),
    sddVersion
  );

  // 6. Install the single module
  const spinner = p.spinner();
  spinner.start(`Installing ${module}...`);

  const result = await install({
    targetDir: absTarget,
    vars,
    modules: [module],
    conflictStrategy: opts.overwrite ? 'overwrite' : 'skip',
  });

  spinner.stop(
    `Done — ${result.copied.length} added` +
    (result.skipped.length ? `, ${result.skipped.length} already present` : '')
  );

  // 7. Update sdd-version.json to record the new module
  updateInstalledModules(versionFile, module);

  // 8. Rebuild checksums
  const checksums = loadChecksums(absTarget);
  const modDir = join(absTarget, '.claude', module);
  if (existsSync(modDir)) {
    const newFiles = scanFiles(modDir).map((abs) => ({
      abs,
      rel: abs.replace(absTarget, '').replace(/\\/g, '/').replace(/^\//, ''),
    }));
    const newChecksums = buildChecksums(newFiles);
    saveChecksums(absTarget, { ...checksums, ...newChecksums });
  }

  p.outro(chalk.green(`✓ Module "${module}" installed!`));
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function updateInstalledModules(versionFile: string, newModule: string): void {
  try {
    const data = JSON.parse(readFileSync(versionFile, 'utf-8')) as {
      version: string;
      installedAt: string;
      modules: string[];
    };
    if (!data.modules.includes(newModule)) {
      data.modules.push(newModule);
      writeFileSync(versionFile, JSON.stringify(data, null, 2), 'utf-8');
    }
  } catch { /* ignore */ }
}

function scanFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) results.push(...scanFiles(full));
    else results.push(full);
  }
  return results;
}

function extractStackFromClaudeMd(claudeMdPath: string): Record<string, string> {
  if (!existsSync(claudeMdPath)) return {};
  const content = readFileSync(claudeMdPath, 'utf-8');
  const result: Record<string, string> = {};
  const patterns: Array<[string, RegExp]> = [
    ['LANGUAGE',           /\*\*Language\*\*:\s*(.+)/],
    ['FRONTEND_FRAMEWORK', /\*\*Frontend Framework\*\*:\s*(.+)/],
    ['BACKEND_FRAMEWORK',  /\*\*Backend Framework\*\*:\s*(.+)/],
    ['DATABASE',           /\*\*Database\*\*:\s*(.+)/],
    ['DEPLOYMENT',         /\*\*Deployment\*\*:\s*(.+)/],
    ['CICD',               /\*\*CI\/CD\*\*:\s*(.+)/],
  ];
  for (const [key, regex] of patterns) {
    const match = content.match(regex);
    if (match) {
      const val = match[1].replace(/<!--.*-->/, '').trim();
      if (val && val !== '[not configured]') result[key] = val;
    }
  }
  return result;
}
