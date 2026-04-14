import { Command } from 'commander';
import * as p from '@clack/prompts';
import chalk from 'chalk';
import { resolve, join, basename } from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { promptStack } from '../prompts/stack.js';
import { promptModules, ALL_MODULES, MINIMAL_MODULES } from '../prompts/modules.js';
import { buildVars } from '../template/engine.js';
import { install, type ConflictStrategy } from '../template/installer.js';
import { readPackageVersion } from '../utils/version.js';
import { writeGitignore } from '../utils/git.js';

export interface InitOptions {
  stack?: string;
  minimal?: boolean;
  yes?: boolean;
}

export function initCommand(): Command {
  return new Command('init')
    .description('Add SDD to an existing project in the current directory')
    .option('--stack <preset>', 'Use a preset stack (ts-nextjs, py-fastapi, go-gin, ...)')
    .option('--minimal', 'Install only CLAUDE.md and core rules')
    .option('-y, --yes', 'Skip all confirmation prompts (merge by default)')
    .action(async (opts: InitOptions) => {
      await run(process.cwd(), opts);
    });
}

export async function run(targetDir: string, opts: InitOptions = {}): Promise<void> {
  const absTarget = resolve(targetDir);
  const claudeDir = join(absTarget, '.claude');
  const claudeExists = existsSync(claudeDir);
  const claudeMdExists = existsSync(join(absTarget, 'CLAUDE.md'));

  p.intro(chalk.bgCyan(' sdd init ') + '  Add SDD to an existing project');

  // 1. Detect existing SDD installation
  let conflictStrategy: ConflictStrategy = 'overwrite';

  if ((claudeExists || claudeMdExists) && !opts.yes) {
    p.log.warn('Existing SDD files detected in this directory.');

    const strategy = await p.select({
      message: 'How should conflicts be handled?',
      options: [
        {
          value: 'merge',
          label: 'Merge  — keep existing files, only add missing ones',
          hint: 'safest for existing projects',
        },
        {
          value: 'overwrite',
          label: 'Overwrite  — replace all files with latest templates',
          hint: 'your customizations will be lost',
        },
        {
          value: 'cancel',
          label: 'Cancel',
        },
      ],
    });

    if (p.isCancel(strategy) || strategy === 'cancel') {
      p.cancel('Aborted.');
      process.exit(0);
    }

    conflictStrategy = strategy as ConflictStrategy;
  } else if (claudeExists || claudeMdExists) {
    // --yes with existing files → default to merge (safer)
    conflictStrategy = 'merge';
    p.log.info('Existing SDD detected — using merge strategy (--yes)');
  }

  // 2. Show existing SDD version if present
  const versionFile = join(claudeDir, 'sdd-version.json');
  if (existsSync(versionFile)) {
    try {
      const v = JSON.parse(readFileSync(versionFile, 'utf-8')) as { version?: string; installedAt?: string };
      p.log.info(`Currently installed: SDD v${v.version ?? '?'} (${v.installedAt?.slice(0, 10) ?? '?'})`);
    } catch { /* ignore */ }
  }

  // 3. Stack selection
  const stackVars = opts.stack
    ? await promptStack(opts.stack)
    : opts.yes
      ? {}
      : await promptStack();

  // 4. Module selection
  const modules = (opts.minimal || opts.yes)
    ? (opts.minimal ? MINIMAL_MODULES : ALL_MODULES)
    : await promptModules();

  // 5. Install
  const sddVersion = readPackageVersion();
  const projectName = basename(absTarget);
  const vars = buildVars({ ...stackVars, PROJECT_NAME: projectName }, projectName, sddVersion);

  const spinner = p.spinner();
  spinner.start(`Installing SDD (${conflictStrategy})...`);

  const result = await install({
    targetDir: absTarget,
    vars,
    modules,
    conflictStrategy,
  });

  spinner.stop(
    `Done — ${result.copied.length} copied` +
    (result.merged.length  ? `, ${result.merged.length} merged`  : '') +
    (result.skipped.length ? `, ${result.skipped.length} skipped` : '')
  );

  // 6. .gitignore
  writeGitignore(absTarget);

  // 7. Summary
  if (result.skipped.length > 0 && conflictStrategy === 'merge') {
    p.log.info(`${result.skipped.length} files preserved (your customizations kept)`);
  }

  p.outro(
    chalk.green('✓ SDD initialized!') +
    `\n\n  Open Claude Code and run ${chalk.cyan('/start')} to configure your stack\n`
  );
}
