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
  const args = process.argv.slice(2);
  const self = args[0].match(/^self(?::(.+))?$/);
  const commandName = args[self ? 1 : 0];

  if (self) {
    const cwd = process.cwd();
    const filePath = self[1]
      ? path.isAbsolute(self[1]) ? self[1] : path.join(cwd, self[1])
      : path.join(cwd, (await import(path.join(cwd, 'package.json'))).main);
    try {
      await getCommandsFromModule(filePath, commands);
    } catch (err) {
      throw new AlphaError('@lpha', `Could not correctly import ${filePath}`, {
        name: err.name,
        message: err.message,
      });
    }
  }

  if (!commandName) {
    Logger.log(TAG, 'Please specify a command to execute. ' + (
      commands.length
        ? `Available commands:\n${commands.map(cmd => cmd.name).join(', ')}`
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
          cliArguments: parseArgs(args),
          environment: process.env,
        });
      } catch (error) {
        if (error instanceof AlphaError) {
          if (error.details) {
            Logger.error(error.command, error.message, error.details);
          } else {
            Logger.error(error.command, error.message);
          }
          process.exit(1);
        } else {
          throw error;
        }
      }
      break;
    }
  }
})()
  .catch((err) => {
    console.error('An error occurred while running @lpha.\n', err);
    process.exit(1);
  });
