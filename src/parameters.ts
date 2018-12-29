import { Type } from 'io-ts';

export type Input<A = any, O = any, I = unknown> = {
  type: Type<A, O, I>;
  env?: string;
  cli?: string;
  description: string;
  default?: I;
  required: boolean;
};

class ParametersBuilder<Parameters extends Record<string, Input> = {}> {
  constructor(public readonly parameters: Parameters) {
  }

  add<Name extends string, In extends Input>(name: Name, input: In) {
    const param: Record<Name, In> = { [name]: input } as any;
    return new ParametersBuilder({ ...this.parameters, ...param });
  }

  build(): Parameters {
    return this.parameters;
  }
}

export const parameters = () => new ParametersBuilder({});
