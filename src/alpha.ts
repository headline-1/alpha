import * as path from 'path';
import { AnyCommand, runCommand } from './command';
import { getConfig } from './config';
import { findAllCommandModules, getCommandsFromModule } from './get-commands';
import { AlphaError, generateDoc, Logger, parseArgs, writeFile } from './utils';

const TAG = '@lpha';

export const alpha = () => (async () => {
  Logger.add({ log: console.log, useChalk: true });
  const config = await getConfig();
  const commands: AnyCommand<any, any>[] = [];
  for (const moduleName of await findAllCommandModules()) {
    await getCommandsFromModule(moduleName, commands);
  }
  if (!commands.length) {
    Logger.log(TAG, 'No commands available. You can include commands in commands array in @lpha configuration file.');
    process.exit(2);
  }
  const commandName = process.argv[2];
  if (!commandName) {
    Logger.log(TAG, 'Please specify command to execute. Available commands:\n' + (
      commands.length
      ? commands.map(cmd => cmd.name).join(', ')
      : 'No commands available. Command modules with "-alpha-plugin" name suffix are automatically imported.'
    ));
    process.exit(1);
  }

  switch (commandName) {
    case 'docs': {
      for (const command of commands) {
        const doc = generateDoc(command);
        await writeFile(path.join('./docs/commands', command.name + '.md'), doc);
      }
      break;
    }
    default: {
      const command = commands.find(command => command.name === commandName);
      if (!command) {
        Logger.log(
          TAG,
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
      break;
    }
  }
})()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('An error occurred while running @lpha.\n', err);
    process.exit(1);
  });
