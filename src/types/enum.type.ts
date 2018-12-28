import { Type } from '../type';
import { isDefined } from '../utils/is-defined.util';

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

export class EnumType<E extends any> extends Type<E[keyof E]> {
  private readonly enumValues: (string | number)[];
  private readonly enumKeys: (string)[];

  constructor(private readonly e: E) {
    super();
    const enumMap = getEnumMap(e);
    this.enumKeys = Object.keys(enumMap);
    this.enumValues = Object.values(enumMap);

    this.init(
      `enum("${this.enumKeys.join('", "')}")`,
      `Text value matching one of: "${this.enumKeys.join('", "')}".`
    );
  }

  convert = async (rawValue: any): Promise<E[keyof E]> => {
    const key = rawValue.toString();
    const value = this.e[key];
    if (this.enumValues.indexOf(key) >= 0) {
      return key;
    }
    if (value !== undefined) {
      return value;
    }
    throw new Error(`Expected one of: "${this.enumKeys.join('", "')}", got ${value}`);
  };
}

export const enumType = <E extends any>(e: E) => new EnumType(e);
