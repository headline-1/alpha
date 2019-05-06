import chalk from 'chalk';
import { getDefaultContext, TypeOf } from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { Input } from './parameters';
import { RevertStack } from './revert-stack';
import { AlphaError, Logger } from './utils';

type ParametersObject<Parameters extends AnyParameters> = {
  [d in keyof Parameters]: TypeOf<Parameters[d]['type']>;
};

type CommandExec<Parameters extends AnyParameters, Result> = (
  input: ParametersObject<Parameters>,
  revertStack: RevertStack
) => Promise<Result>;

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

  execute = <Result = void>(exec: CommandExec<Parameters, Result>): CommandBuilder<Parameters, Result> => {
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
    if (!this.command.name) {
      throw new Error('The command does not have a name.');
    }
    if (!this.command.exec) {
      throw new Error(`The command ${this.command.name} does not have an execution function.`);
    }

    const name = this.command.name;
    const baseExec = this.command.exec;

    this.command.exec = async (params: Parameters, revertStack: RevertStack) => {
      try {
        return await baseExec(params, revertStack);
      } catch (error) {
        Logger.error(name, error);
        await revertStack.revert();
        throw error;
      }
    };

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
    if (parameter.required && !value) {
      throw new AlphaError(command.name, chalk.red((
        `${chalk.bold(command.name)}: Required parameter '${chalk.bold(key)}' is missing. ` +
        `Expected ${parameter.type.name}.\n` +
        `It can be set in configuration as "${key}"\n` +
        (parameter.cli ? `It can be passed as CLI argument as "${parameter.cli}"\n` : '') +
        (parameter.env ? `It can be specified as an environmental variable "${parameter.env}"\n` : '')
      ).trim()));
    }
    if (value) {
      const validation = parameter.type.validate(value, getDefaultContext(parameter.type));
      if (validation.isLeft()) {
        throw new Error(PathReporter.report(validation).join('\n'));
      }
      parameters[key] = validation.value;
    }
  }
  await command.exec(parameters, new RevertStack());
};

export const isCommand = (maybeCommand: any): maybeCommand is AnyCommand<any, any> =>
  maybeCommand && maybeCommand.__command === true;
