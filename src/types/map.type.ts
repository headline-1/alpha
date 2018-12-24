import { Type } from '../type';

export function MapType<T1>(t1: Type<T1>): Type<Record<string, T1>>;
export function MapType<T1, T2>(t1: Type<T1>, t2: Type<T2>): Type<Record<string, T1>>;
export function MapType<T1, T2, T3>(t1: Type<T1>, t2: Type<T2>, t3: Type<T3>): Type<Record<string, T1 | T2 | T3>>;
export function MapType<T1, T2, T3, T4>(
  t1: Type<T1>, t2: Type<T2>, t3: Type<T3>, t4: Type<T4>
): Type<Record<string, T1 | T2 | T3 | T4>>;
export function MapType(...itemTypes: Type<any>[]): Type<Record<string, any>> {
  return {
    name: itemTypes.length === 1
      ? `Map<string, ${itemTypes[0].name}>`
      : `Map<string, ${itemTypes.map(t => t.name).join(' | ')}>`,
    description: `A map containing: ${itemTypes.map(t => t.description).join(', ')}`,
    convert: async (object: any) => {
      const result: Record<string, any> = {} as any;
      for (const key in object) {
        if (!object.hasOwnProperty(key)) {
          continue;
        }
        const rawValue = object[key];
        let value;
        const errors = [];
        for (const type of itemTypes) {
          try {
            value = await type.convert(rawValue);
          } catch (error) {
            errors.push(error);
          }
        }
        if (value === undefined) {
          throw new Error(
            `Expected to match an array element to one of it's item types, but failed:
            ${errors.map(e => e.message).join(', ')}`);
        }
        result[key] = value;
      }
      return result;
    },
  };
}
