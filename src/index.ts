import 'source-map-support/register';

import chalk from 'chalk';
import * as path from 'path';
import { runCommand } from './command';
import { getConfig } from './config';
import { getCommandsFromModule } from './get-commands';
import { parseArgs } from './utils/args';
import { ButlerError } from './utils/butler-error';
import { generateDoc } from './utils/docs';
import { writeFile } from './utils/file';

export * from './command';
export * from './parameters';
export * from './types';
export * from './utils/butler-error';
export * from './utils/execute';
export * from './utils/file';
export * from './utils/sleep';

const run = async () => {
  const config = await getConfig();
  const commands = config.commands.map(getCommandsFromModule).reduce((all, commands) => all.concat(commands), []);
  const command = process.argv[2];
  if (!command) {
    console.log('Please specify command to execute. Supported commands: ' +
      commands.map(cmd => cmd.name).join(', ')
    );
    process.exit(1);
  }
  const commandParams = command.split(':');
  const commandName = commandParams.shift();

  switch (commandName) {
    case 'docs':
      for (const command of commands) {
        const doc = generateDoc(command);
        await writeFile(path.join('./docs/commands', command.name + '.md'), doc);
      }
      break;
    default: {
      const command = commands.find(command => command.name === commandName);
      if (!command) {
        console.log('Command unsupported, please use one of: ' + commands.map(cmd => cmd.name).join(', '));
        process.exit(1);
      }
      try {
        return await runCommand(command, {
          configuration: config[commandName],
          cliArguments: parseArgs(process.argv),
          environment: process.env,
        });
      } catch (error) {
        if (error instanceof ButlerError) {
          console.log(chalk.red(chalk.bold(error.command) + ': ' + error.message));
          if (error.details) {
            console.log(chalk.bold.magenta('details:\n') + JSON.stringify(error.details));
          }
          process.exit(1);
        } else {
          throw error;
        }
      }
    }
  }
};

run()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('An error occurred while running Native Butler.\n', err);
    process.exit(1);
  });
