import { Type } from '../type';

export const IntegerType: Type<number> = {
  name: 'integer',
  description: 'Any integer number.',
  convert: (value: any) => {
    const n = typeof value === 'number' ? value : parseInt(value, 10);
    if (isNaN(n)) {
      throw new Error(`Expected a number, got ${value}.`);
    }
    return n;
  },
};

export const FloatType: Type<number> = {
  name: 'float',
  description: 'Any float number.',
  convert: (value: any) => {
    const n = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(n)) {
      throw new Error(`Expected a number, got ${value}.`);
    }
    return n;
  },
};

export const IntegerRangeType = (min: number, max: number): Type<number> => ({
  name: `integer(${min}, ${max})`,
  description: `Integer number in range <${min}, ${max}>`,
  convert: (value: any) => {
    const n = IntegerType.convert(value);
    if (n >= min && n <= max) {
      return n;
    }
    throw new Error(`Expected number to be in range <${min}, ${max}>, got ${n}.`);
  },
});

export const FloatRangeType = (min: number, max: number): Type<number> => ({
  name: `float(${min}, ${max})`,
  description: `Float number in range <${min}, ${max}>`,
  convert: (value: any) => {
    const n = FloatType.convert(value);
    if (n >= min && n <= max) {
      return n;
    }
    throw new Error(`Expected number to be in range <${min}, ${max}>, got ${n}.`);
  },
});
