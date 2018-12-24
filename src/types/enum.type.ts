import { Type } from '../type';
import { isDefined } from '../utils/is-defined';

const getEnumMap = (e: any): Record<string, string | number> => {
  const filteredKeys = Object.values(e)
    .map(v => e[v as string])
    .filter(isDefined);
  const keys = filteredKeys.length
    ? Object.values(e).filter(k => typeof k === 'string') as string[]
    : Object.keys(e);
  return keys.reduce((map, key) => {
    map[key] = e[key];
    return map;
  }, {} as Record<string, string | number>);
};

// @TODO fix typings - enums are too special to work properly this way
export function EnumType<E extends any>(e: E): Type<E[keyof E]> {
  const enumMap = getEnumMap(e);
  const enumKeys = Object.keys(enumMap);
  const enumValues = Object.values(enumMap);
  return {
    name: `enum("${enumKeys.join('", "')}")`,
    description: `Text value matching one of: "${enumKeys.join('", "')}".`,
    convert: async (rawValue: any): Promise<E[keyof E]> => {
      const key = rawValue.toString();
      const value = e[key];
      if (enumValues.indexOf(key) >= 0) {
        return key;
      }
      if (value !== undefined) {
        return value;
      }
      throw new Error(`Expected one of: "${enumKeys.join('", "')}", got ${value}`);
    },
  };
}
