import { Command } from 'commander';
import * as p from '@clack/prompts';
import chalk from 'chalk';
import { resolve, join, relative, basename } from 'path';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { fetchLatestRelease, compareSemver } from '../utils/github.js';
import { loadChecksums, saveChecksums, buildChecksums, isUserModified, sha1 } from '../utils/checksum.js';
import { install } from '../template/installer.js';
import { buildVars } from '../template/engine.js';
import { readPackageVersion } from '../utils/version.js';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const TEMPLATES_DIR = resolve(__dirname, '../../templates');

export function upgradeCommand(): Command {
  return new Command('upgrade')
    .description('Upgrade SDD templates to the latest version')
    .option('--dry-run', 'Preview changes without writing files')
    .option('--module <name>', 'Upgrade only a specific module (agents|skills|rules|hooks|memory)')
    .option('-y, --yes', 'Skip confirmation prompt')
    .action(async (opts: { dryRun?: boolean; module?: string; yes?: boolean }) => {
      await run(process.cwd(), opts);
    });
}

interface UpgradeOpts {
  dryRun?: boolean;
  module?: string;
  yes?: boolean;
}

async function run(targetDir: string, opts: UpgradeOpts): Promise<void> {
  const absTarget = resolve(targetDir);
  const versionFile = join(absTarget, '.claude', 'sdd-version.json');

  p.intro(chalk.bgCyan(' sdd upgrade ') + '  Update SDD templates');

  // 1. Read installed version
  let installedVersion = '0.0.0';
  let installedModules: string[] = [];
  if (existsSync(versionFile)) {
    try {
      const v = JSON.parse(readFileSync(versionFile, 'utf-8')) as {
        version?: string;
        modules?: string[];
      };
      installedVersion = v.version ?? '0.0.0';
      installedModules = v.modules ?? [];
    } catch { /* ignore */ }
  } else {
    p.log.warn('No .claude/sdd-version.json found. Run `sdd init` first.');
    process.exit(1);
  }

  const currentPkgVersion = readPackageVersion();
  p.log.info(`Installed: v${installedVersion}  →  Package: v${currentPkgVersion}`);

  // 2. Check GitHub for newer release
  const spinner = p.spinner();
  spinner.start('Checking for updates...');
  const latest = await fetchLatestRelease();
  spinner.stop(latest ? `Latest on GitHub: ${latest.tag_name}` : 'Could not reach GitHub (offline?)');

  if (latest) {
    const cmp = compareSemver(latest.tag_name, currentPkgVersion);
    if (cmp > 0) {
      p.log.warn(
        `A newer version ${chalk.cyan(latest.tag_name)} is available!\n` +
        `  Run ${chalk.cyan('npm install -g create-sdd@latest')} then retry.`
      );
    }
  }

  // 3. Nothing to upgrade if already at latest local version
  if (compareSemver(currentPkgVersion, installedVersion) === 0 && !opts.dryRun) {
    p.log.success(`Already up to date (v${installedVersion})`);
    p.outro('');
    return;
  }

  // 4. Determine modules to upgrade
  const modules = opts.module ? [opts.module] : installedModules;
  if (modules.length === 0) {
    p.log.warn('No modules recorded. Run `sdd init` to reinstall.');
    process.exit(1);
  }

  // 5. Load existing checksums to detect user customizations
  const checksums = loadChecksums(absTarget);
  const customized: string[] = [];

  // Scan installed files against checksums
  for (const mod of modules) {
    const modDir = join(absTarget, '.claude', modToSubdir(mod));
    if (!existsSync(modDir)) continue;
    scanFiles(modDir).forEach((absFile) => {
      const rel = relative(absTarget, absFile).replace(/\\/g, '/');
      if (isUserModified(absFile, checksums, rel)) {
        customized.push(rel);
      }
    });
  }

  // 6. Report customizations
  if (customized.length > 0) {
    p.log.warn(`${customized.length} file(s) have been modified by you:`);
    customized.slice(0, 8).forEach((f) => p.log.message(`  ${chalk.yellow(f)}`));
    if (customized.length > 8) p.log.message(`  ... and ${customized.length - 8} more`);
    p.log.message('These files will be SKIPPED (your changes preserved).');
  }

  // 7. Dry-run: show summary and exit
  if (opts.dryRun) {
    p.log.message(
      chalk.cyan('\n[Dry run]') +
      ` Would upgrade modules: ${modules.join(', ')}\n` +
      `  ${customized.length} files would be skipped (user-modified)\n` +
      `  All other template files would be overwritten`
    );
    p.outro('No files written (--dry-run)');
    return;
  }

  // 8. Confirm
  if (!opts.yes) {
    const confirm = await p.confirm({
      message: `Upgrade ${modules.join(', ')} from v${installedVersion} → v${currentPkgVersion}?`,
      initialValue: true,
    });
    if (p.isCancel(confirm) || !confirm) { p.cancel('Aborted.'); process.exit(0); }
  }

  // 9. Build vars (reuse existing CLAUDE.md stack config if present)
  const claudeMdPath = join(absTarget, 'CLAUDE.md');
  const vars = buildVars(
    extractStackFromClaudeMd(claudeMdPath),
    basename(absTarget),
    currentPkgVersion
  );

  // 10. Install with 'skip' for user-modified files
  const installSpinner = p.spinner();
  installSpinner.start(`Upgrading v${installedVersion} → v${currentPkgVersion}...`);

  const result = await install({
    targetDir: absTarget,
    vars,
    modules,
    conflictStrategy: 'overwrite',
    dryRun: false,
  });

  installSpinner.stop(
    `Upgraded — ${result.copied.length} updated` +
    (result.skipped.length ? `, ${result.skipped.length} preserved` : '')
  );

  // 11. Rebuild checksums for next upgrade
  const newChecksums = buildChecksumsForModules(absTarget, modules);
  saveChecksums(absTarget, newChecksums);

  p.outro(chalk.green(`✓ Upgraded to v${currentPkgVersion}`));
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const MODULE_SUBDIR: Record<string, string> = {
  agents:  'agents',
  skills:  'skills',
  rules:   'rules',
  hooks:   'hooks',
  memory:  'memory',
  docs:    'docs',
};

function modToSubdir(mod: string): string {
  return MODULE_SUBDIR[mod] ?? mod;
}

function scanFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...scanFiles(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

function buildChecksumsForModules(targetDir: string, modules: string[]): Record<string, string> {
  const files: Array<{ abs: string; rel: string }> = [];
  for (const mod of modules) {
    const modDir = join(targetDir, '.claude', modToSubdir(mod));
    if (!existsSync(modDir)) continue;
    scanFiles(modDir).forEach((abs) => {
      files.push({ abs, rel: relative(targetDir, abs).replace(/\\/g, '/') });
    });
  }
  return buildChecksums(files);
}

/** Extract stack values from an existing CLAUDE.md to preserve them during upgrade */
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
