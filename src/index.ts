#!/usr/bin/env node
import { Command } from 'commander';
import { createCommand } from './commands/create.js';
import { initCommand } from './commands/init.js';
import { addCommand } from './commands/add.js';
import { upgradeCommand } from './commands/upgrade.js';

const program = new Command();

program
  .name('sdd')
  .description('Claude Code Software Development Department — scaffold & manage')
  .version('0.1.0');

// npx create-sdd [dir] — invoked when binary name is "create-sdd"
if (process.argv[1]?.endsWith('create-sdd') || process.argv[1]?.endsWith('create-sdd.js')) {
  createCommand(process.argv.slice(2));
} else {
  // sdd <subcommand>
  program.addCommand(initCommand());
  program.addCommand(addCommand());
  program.addCommand(upgradeCommand());

  // "sdd create [dir]" alias
  program.addCommand(
    new Command('create')
      .description('Create SDD in a new directory')
      .argument('[dir]', 'Target directory', '.')
      .option('--stack <preset>', 'Use a preset stack (ts-nextjs, py-fastapi, go-gin, ...)')
      .option('--minimal', 'Install only CLAUDE.md and core rules')
      .option('-y, --yes', 'Skip all confirmation prompts')
      .action(async (dir: string, opts: { stack?: string; minimal?: boolean; yes?: boolean }) => {
        const { run } = await import('./commands/create.js');
        await run(dir, opts);
      })
  );

  program.parse();
}
