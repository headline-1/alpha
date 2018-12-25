import { AnyCommand, isCommand } from './command';

export const requireModule = async (location: string) => require(location);

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

  allCommands.concat(commands);

  for (const command of commands) {
    command.location = location;
    for (const dependency of command.dependencies) {
      await getCommandsFromModule(dependency, allCommands);
    }
  }
};
