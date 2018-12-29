import { cloneDeep } from 'lodash';
import { ActualType, Type } from '../type';

class ArrayType<T extends any = unknown> extends Type<T[]> {
  private children: Type<T>[] = [];

  constructor() {
    super();
    this.init(
      () => this.children.length === 0
        ? 'any[]'
        : this.children.length === 1
          ? this.children[0].name + '[]'
          : `(${this.children.map(t => t!.name).join(' | ')})[]`,
      () => `An array containing: ${this.children.map(t => t!.description).join(', ') || 'any type'}`
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
  ): ArrayType<unknown extends T ? AT : (T | AT)> {
    return Type.clone(this, (type: ArrayType<unknown extends T ? AT : (T | AT)>) => {
      type.children = [...this.children, c1, c2, c3, c4, c5].filter(Boolean) as Type<any>[];
    });
  }

  copyTo(type: this): void {
    super.copyTo(type);
    type.children = this.children;
  }

  async convert(value: any): Promise<T[]> {
    if (typeof value === 'string') {
      value = value.split(',');
    }
    if (!Array.isArray(value)) {
      throw new Error(`Expected to receive an array or a string resembling an array, got ${value}`);
    }

    if (this.children.length) {
      return cloneDeep(value);
    }
    const result: T[] = [];
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
  }
}

export const arrayType = () => Type.create(ArrayType);
