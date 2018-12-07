import { AnyCommand, isCommand } from './command';

export const getCommandsFromModule = (location: string): AnyCommand[] => {
  const commandModule = require(location);
  if (commandModule.__command === true) {
    return [commandModule];
  }
  const commands: AnyCommand[] = [];
  for (const maybeCommand of Object.values(commandModule)) {
    if (Array.isArray(maybeCommand) && isCommand(maybeCommand[0].__command)) {
      commands.concat(maybeCommand);
    } else if (isCommand(maybeCommand)) {
      commands.push(maybeCommand);
    }
  }
  return commands;
};
