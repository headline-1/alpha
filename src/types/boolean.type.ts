import { Type } from '../type';

export const BooleanType: Type<boolean> = {
  name: 'boolean',
  description: 'A boolean value.',
  convert: (value: any) => {
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
  },
};
