import { Input } from './parameters';
import { ActualType } from './type';

type CommandExec<Parameters extends AnyParameters, Result> = (
  input: { [d in keyof Parameters]: ActualType<Parameters[d]['type']> }) => Promise<CommandResult<Result>>;

export interface Command<Parameters extends AnyParameters, Result> {
  __command: true;
  name: string;
  location?: string;
  syntax: string;
  description: string;
  parameters: Parameters;
  dependencies: string[];
  exec: CommandExec<Parameters, Result>;
}

export interface CommandResult<T> {
  result: T;
  revert: () => Promise<void>;
}

export type AnyParameters = Record<string, Input<any>>;
export type AnyCommand<Params extends AnyParameters, Result> = Command<Params, Result>;

export class CommandBuilder<Parameters extends AnyParameters = {}, Result = void> {
  private command: Partial<Command<Parameters, Result>> = {
    __command: true,
  };

  name = (name: string): this => {
    this.command.name = name;
    return this;
  };

  description = (description: string): this => {
    this.command.description = description;
    return this;
  };

  dependencies = (dependencies: string[]): this => {
    this.command.dependencies = dependencies;
    return this;
  };

  parameters = <InputParameters extends Record<string, Input<any>>>(
    parameters: InputParameters
  ): CommandBuilder<InputParameters, Result> => {
    this.command.parameters = parameters as any;
    return this as any;
  };

  execute = <ExecResult>(exec: CommandExec<Parameters, ExecResult>): CommandBuilder<Parameters, ExecResult> => {
    this.command.exec = exec as any;
    return this as any;
  };

  build = (): Command<Parameters, Result> => {
    if (!this.command.parameters) {
      this.parameters({});
    }
    if (!this.command.dependencies) {
      this.dependencies([]);
    }
    return this.command as any;
  };
}

type CommandParameters = {
  environment: Record<string, string | undefined>;
  cliArguments: Record<string, string>;
  configuration: Record<string, any>;
};

export const runCommand = async <Parameters extends AnyParameters, Result>(
  command: Command<Parameters, Result>,
  { environment, cliArguments, configuration }: CommandParameters
) => {
  const parameters: Record<keyof Parameters, any> = {} as any;
  for (const key in command.parameters) {
    if (!command.parameters.hasOwnProperty(key)) {
      continue;
    }
    const parameter = command.parameters[key];
    // Get order: Config, argument, environmental variable, default
    const value = configuration[key]
      || (parameter.cli && cliArguments[parameter.cli])
      || (parameter.env && environment[parameter.env])
      || parameter.default;
    if (!parameter.type._optional && !value) {
      throw new Error((
        `${command.name}: Required parameter '${key}' is missing. Expected ${parameter.type.name}.\n` +
        `It can be set in configuration as "${key}"\n` +
        (parameter.cli ? `It can be passed as CLI argument as "${parameter.cli}"\n` : '') +
        (parameter.env ? `It can be specified as an environmental variable "${parameter.env}"\n` : '')
      ).trim());
    }
    if (value) {
      parameters[key] = await Promise.resolve(parameter.type.convert(value));
    }
  }
  await command.exec(parameters);
};

export const isCommand = (maybeCommand: any): maybeCommand is AnyCommand<any, any> =>
  maybeCommand && maybeCommand.__command === true;
