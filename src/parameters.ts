import { ActualType, Type } from './type';

export type Input<T extends any = any> = {
  type: Type<T>;
  env?: string;
  cli?: string;
  required?: boolean;
  description: string;
  default?: ActualType<Type<T>>;
};

export class ParametersBuilder<Parameters extends Record<string, Input> = {}> {
  parameters: Parameters = {} as any;

  add<Name extends string, In extends Input>(name: Name, input: In): ParametersBuilder<Parameters
    & {[name in Name]: In}> {
    (this.parameters as any)[name] = input;
    return this as any;
  }

  build(): Parameters {
    return this.parameters;
  }
}
