import * as path from 'path';
import { AnyCommand, isCommand } from './command';
import { Access, access, readDir } from './utils';

const validPackageNames = [
  /^@lpha\/plugin-/,
  /-alpha-plugin$/,
];
export const requireModule = async (location: string) => require(path.resolve(location));

export const findAllCommandModules = async () => {
  const files = [];
  let location = process.cwd();
  let oldLocation = location;
  do {
    const nodeModules = path.join(location, 'node_modules');
    if (await access(nodeModules, Access.EXISTS)) {
      files.push(
        ...(await readDir(nodeModules))
          .filter(file => validPackageNames.some(regexp => regexp.test(file)))
      );
    }
    oldLocation = location;
    location = path.resolve(location, '..');
  } while (oldLocation !== location);
  return [...new Set(files)];
};

export const getCommandsFromModule = async (location: string, allCommands: AnyCommand<any, any>[]): Promise<void> => {
  if (allCommands.find(command => command.location === location)) {
    return;
  }
  const commandModule = await requireModule(location);
  if (isCommand(commandModule)) {
    commandModule.location = location;
    allCommands.push(commandModule);
    return;
  }
  const commands: AnyCommand<any, any>[] = [];
  for (const maybeCommand of Object.values(commandModule)) {
    if (Array.isArray(maybeCommand)) {
      for (const c of maybeCommand) {
        if (isCommand(c)) {
          c.location = location;
          commands.push(c);
        }
      }
    } else if (isCommand(maybeCommand)) {
      maybeCommand.location = location;
      commands.push(maybeCommand);
    }
  }

  allCommands.push(...commands);

  for (const command of commands) {
    command.location = location;
    for (const dependency of command.dependencies) {
      await getCommandsFromModule(dependency, allCommands);
    }
  }
};
