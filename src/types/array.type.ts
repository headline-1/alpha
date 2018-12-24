import { Type } from '../type';

export function ArrayType<T1>(t1: Type<T1>): Type<T1[]>;
export function ArrayType<T1, T2>(t1: Type<T1>, t2: Type<T2>): Type<(T1 | T2)[]>;
export function ArrayType<T1, T2, T3>(t1: Type<T1>, t2: Type<T2>, t3: Type<T3>): Type<(T1 | T2 | T3)[]>;
export function ArrayType<T1, T2, T3, T4>(
  t1: Type<T1>, t2: Type<T2>, t3: Type<T3>, t4: Type<T4>
): Type<(T1 | T2 | T3 | T4)[]>;
export function ArrayType<T>(...itemTypes: Type<T>[]): Type<T[]> {
  return {
    name: itemTypes.length === 1
      ? itemTypes[0].name + '[]'
      : `(${itemTypes.map(t => t.name).join(' | ')})[]`,
    description: `An array containing: ${itemTypes.map(t => t.description).join(', ')}`,
    convert: async (value: any) => {
      if (typeof value === 'string') {
        value = value.split(',');
      }
      if (!Array.isArray(value)) {
        throw new Error(`Expected to receive an array or a string resembling an array, got ${value}`);
      }
      const result: T[] = [];
      for (const t of value) {
        let value;
        const errors = [];
        for (const type of itemTypes) {
          try {
            value = await type.convert(t);
          } catch (error) {
            errors.push(error);
          }
        }
        if (value === undefined) {
          throw new Error(
            `Expected to match an array element to one of it's item types, but failed:
            ${errors.map(e => e.message).join(', ')}`);
        }
        result.push(value);
      }
      return result;
    },
  };
}
