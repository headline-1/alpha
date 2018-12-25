import chalk from 'chalk';
import * as path from 'path';
import { AnyCommand, runCommand } from './command';
import { getConfig } from './config';
import { getCommandsFromModule } from './get-commands';
import { AlphaError } from './utils/alpha-error';
import { parseArgs } from './utils/args';
import { generateDoc } from './utils/docs';
import { writeFile } from './utils/file';

export const alpha = async () => {
  const config = await getConfig();
  const commands: AnyCommand<any, any>[] = [];
  for (const commandName of config.commands) {
    await getCommandsFromModule(commandName, commands);
  }
  const commandName = process.argv[2];
  if (!commandName) {
    console.log('Please specify command to execute. Supported commands: ' +
      commands.map(cmd => cmd.name).join(', ')
    );
    process.exit(1);
  }

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
        return;
      }
      try {
        return await runCommand(command, {
          configuration: config[command.name] || {},
          cliArguments: parseArgs(process.argv),
          environment: process.env,
        });
      } catch (error) {
        if (error instanceof AlphaError) {
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
