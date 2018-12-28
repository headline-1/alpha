import * as path from 'path';
import { AnyCommand, runCommand } from './command';
import { getConfig } from './config';
import { getCommandsFromModule } from './get-commands';
import { AlphaError, generateDoc, Logger, parseArgs, writeFile } from './utils';

export const alpha = async () => {
  Logger.add({ log: console.log, useChalk: true });
  const config = await getConfig();
  const commands: AnyCommand<any, any>[] = [];
  for (const commandName of config.commands) {
    await getCommandsFromModule(commandName, commands);
  }
  const commandName = process.argv[2];
  if (!commandName) {
    Logger.log('@lpha', 'Please specify command to execute. Supported commands: ' +
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
        Logger.log(
          '@lpha',
          'Command unsupported or not registered, please use one of: ' + commands.map(cmd => cmd.name).join(', ')
        );
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
          Logger.error(error.command, error.message, error.details);
          process.exit(1);
        } else {
          throw error;
        }
      }
    }
  }
};
