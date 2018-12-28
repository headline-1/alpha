import { Type } from '../type';

export class MapType<T1,
  T2 = unknown, T3 = unknown,
  T4 = unknown, T5 = unknown,
  T6 = unknown, T7 = unknown,
  T8 = unknown> extends Type<Record<string | number, (T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8)>> {
  private readonly children: Type<any>[];

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
        ? `Map<string, ${children[0].name}>`
        : `Map<string, ${children.map(t => t!.name).join(' | ')}>`,
      `A map containing: ${children.map(t => t!.description).join(', ')}`
    );
  }

  convert = async (object: any) => {
    const result: Record<string, any> = {} as any;
    for (const key in object) {
      if (!object.hasOwnProperty(key)) {
        continue;
      }
      const rawValue = object[key];
      let value;
      const errors = [];
      for (const type of this.children) {
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
  };
}

export const mapType = <T1,
  T2 = unknown, T3 = unknown,
  T4 = unknown, T5 = unknown,
  T6 = unknown, T7 = unknown,
  T8 = unknown>(...children: [
  Type<T1>, Type<T2>?,
  Type<T3>?, Type<T4>?,
  Type<T5>?, Type<T6>?,
  Type<T7>?, ...Type<T8>[]
  ]) => new MapType(...children);
