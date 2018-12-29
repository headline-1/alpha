import { ActualType, Type } from '../type';

class MapType<T extends any = unknown> extends Type<Record<string | number, T>> {
  private children: Type<T>[] = [];

  constructor() {
    super();
    this.init(
      () => this.children.length === 1
        ? `Map<string, ${this.children[0].name}>`
        : `Map<string, ${this.children.map(t => t!.name).join(' | ')}>`,
      () => `A map containing: ${this.children.map(t => t!.description).join(', ')}`
    );
  }

  containing<T1 extends Type<any>,
    T2 extends Type<any> | never = never,
    T3 extends Type<any> | never = never,
    T4 extends Type<any> | never = never,
    T5 extends Type<any> | never = never,
    AT1 = ActualType<T1>,
    AT2 = ActualType<T1>,
    AT3 = ActualType<T1>,
    AT4 = ActualType<T1>,
    AT5 = ActualType<T1>,
    AT = AT1 | AT2 | AT3 | AT4 | AT5>(
    c1?: T1, c2?: T2, c3?: T3, c4?: T4, c5?: T5
  ): MapType<unknown extends T ? AT : (T | AT)> {
    return Type.clone(this, (type: MapType<unknown extends T ? AT : (T | AT)>) => {
      type.children = [...this.children, c1, c2, c3, c4, c5].filter(Boolean) as Type<any>[];
    });
  }

  async convert(object: any) {
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
  }

  copyTo(type: this): void {
    super.copyTo(type);
    type.children = this.children;
  }
}

export const mapType = () => Type.create(MapType);
