import { Type } from '../type';

export class ArrayType<T1,
  T2 = unknown, T3 = unknown,
  T4 = unknown, T5 = unknown,
  T6 = unknown, T7 = unknown,
  T8 = unknown> extends Type<(T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8)[]> {
  public readonly children: Type<any>[];

  constructor(...children: [
    Type<T1>, Type<T2>?,
    Type<T3>?, Type<T4>?,
    Type<T5>?, Type<T6>?,
    Type<T7>?, ...Type<T8>[]
    ]) {
    super();
    this.children = children = children.filter(Boolean) as any;
    this.init(
      children.length === 1
        ? children[0].name + '[]'
        : `(${children.map(t => t!.name).join(' | ')})[]`,
      `An array containing: ${children.map(t => t!.description).join(', ')}`
    );
  }

  convert = async (value: any) => {
    if (typeof value === 'string') {
      value = value.split(',');
    }
    if (!Array.isArray(value)) {
      throw new Error(`Expected to receive an array or a string resembling an array, got ${value}`);
    }
    const result: (T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8)[] = [];
    for (const t of value) {
      let value;
      const errors = [];
      for (const type of this.children) {
        try {
          value = await type!.convert(t);
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
  };
}

export const arrayType = <T1,
  T2 = unknown, T3 = unknown,
  T4 = unknown, T5 = unknown,
  T6 = unknown, T7 = unknown,
  T8 = unknown>(...children: [
  Type<T1>, Type<T2>?,
  Type<T3>?, Type<T4>?,
  Type<T5>?, Type<T6>?,
  Type<T7>?, ...Type<T8>[]
  ]) => new ArrayType(...children);
