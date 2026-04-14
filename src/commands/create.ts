import * as p from '@clack/prompts';
import chalk from 'chalk';
import { resolve, basename } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { promptStack } from '../prompts/stack.js';
import { promptModules, ALL_MODULES, MINIMAL_MODULES } from '../prompts/modules.js';
import { buildVars } from '../template/engine.js';
import { install } from '../template/installer.js';
import { readPackageVersion } from '../utils/version.js';
import { isGitRepo, writeGitignore } from '../utils/git.js';

export interface CreateOptions {
  stack?: string;
  minimal?: boolean;
  yes?: boolean;   // skip all confirmation prompts
}

/** Called when binary is invoked as `npx create-sdd [dir]` */
export function createCommand(args: string[]): void {
  const dir = args.find((a) => !a.startsWith('-')) ?? '.';
  const opts: CreateOptions = {
    stack:   args.includes('--stack')   ? args[args.indexOf('--stack') + 1]   : undefined,
    minimal: args.includes('--minimal'),
    yes:     args.includes('--yes') || args.includes('-y'),
  };
  run(dir, opts).catch((err) => {
    console.error(chalk.red('Error:'), err.message);
    process.exit(1);
  });
}

export async function run(targetDir: string, opts: CreateOptions = {}): Promise<void> {
  const absTarget = resolve(targetDir);
  const projectName = basename(absTarget);

  p.intro(chalk.bgCyan(' create-sdd ') + '  Claude Code Software Development Department');

  // 1. Confirm target directory (skip if --yes or dir is empty/new)
  const dirExists = existsSync(absTarget) && targetDir !== '.';
  if (dirExists && !opts.yes) {
    const overwrite = await p.confirm({
      message: `Directory "${projectName}" already exists. Continue anyway?`,
      initialValue: false,
    });
    if (p.isCancel(overwrite) || !overwrite) { p.cancel('Aborted.'); process.exit(0); }
  }
  mkdirSync(absTarget, { recursive: true });

  // 2. Stack selection (skip TTY prompts when preset is provided)
  const stackVars = opts.stack
    ? await promptStack(opts.stack)                        // preset → no TTY needed
    : opts.yes
      ? {}                                                 // --yes without stack → unconfigured
      : await promptStack();                               // interactive

  // 3. Module selection (skip TTY prompts when --minimal or --yes)
  const modules = (opts.minimal || opts.yes)
    ? (opts.minimal ? MINIMAL_MODULES : ALL_MODULES)
    : await promptModules();

  // 4. Build template vars
  const sddVersion = readPackageVersion();
  const vars = buildVars({ ...stackVars, PROJECT_NAME: projectName }, projectName, sddVersion);

  // 5. Install
  const spinner = p.spinner();
  spinner.start('Installing SDD...');
  const result = await install({
    targetDir: absTarget,
    vars,
    modules,
    conflictStrategy: 'overwrite',
  });
  spinner.stop(`Installed ${result.copied.length} files`);

  if (result.skipped.length > 0) {
    p.log.warn(`Skipped ${result.skipped.length} existing files (preserved user content)`);
  }

  // 6. Git setup
  writeGitignore(absTarget);
  if (!isGitRepo(absTarget)) {
    p.log.info('No git repo detected — run `git init` to start tracking changes');
  }

  // 7. Next steps
  p.outro(
    chalk.green('✓ SDD installed!') +
    `\n\n  Next steps:\n` +
    (targetDir !== '.' ? `    ${chalk.cyan(`cd ${projectName}`)}\n` : '') +
    `    ${chalk.cyan('code .')}\n` +
    `    Open Claude Code and run ${chalk.cyan('/start')} to configure your stack\n`
  );
}
