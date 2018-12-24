import { Input } from './parameters';
import { ActualType } from './type';

type CommandExec<Parameters extends Record<string, Input>> = (
  input: { [d in keyof Parameters]: ActualType<Parameters[d]['type']> }) => Promise<void>;

export interface Command<Parameters extends Record<string, Input>> {
  __command: true;
  name: string;
  syntax: string;
  description: string;
  parameters: Parameters;
  exec: CommandExec<Parameters>;
}

export type AnyCommand = Command<Record<string, Input<any>>>;

export class CommandBuilder<Parameters extends Record<string, any>> {
  private command: Partial<Command<Parameters>> = {
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

  parameters = <InputParameters extends Record<string, Input<any>>>(
    parameters: InputParameters
  ): CommandBuilder<InputParameters> => {
    this.command.parameters = parameters as any;
    return this as any;
  };

  execute = (exec: CommandExec<Parameters>): this => {
    this.command.exec = exec;
    return this;
  };

  build = (): Command<Parameters> => this.command as any;
}

type CommandParameters = {
  environment: Record<string, string | undefined>;
  cliArguments: Record<string, string>;
  configuration: Record<string, any>;
};

export const runCommand = async <Parameters extends Record<string, Input>>(
  command: Command<Parameters>,
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
    if (parameter.required && !value) {
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
  console.log(parameters);
  await command.exec(parameters);
};

export const isCommand = (maybeCommand: any): maybeCommand is AnyCommand =>
  maybeCommand && maybeCommand.__command === true;
