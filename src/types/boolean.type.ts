import { Type } from '../type';

class BooleanType extends Type<boolean> {
  constructor() {
    super();
    this.init('boolean', 'A boolean value.');
  }

  async convert(value: any): Promise<boolean> {
    const b = typeof value === 'boolean'
      ? value
      : typeof value === 'number'
        ? value === 0 ? false : value === 1 ? true : undefined
        : typeof value === 'string'
          ? value === 'true' ? true : value === 'false' ? false : undefined
          : undefined;
    if (b === undefined) {
      throw new Error(`Expected a boolean or a value that can be evaluated to boolean, got ${value}.`);
    }
    return b;
  }
}

export const booleanType = (): BooleanType => Type.create(BooleanType);
