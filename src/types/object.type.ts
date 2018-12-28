import { ActualType, Type } from '../type';

export class ObjectType<O extends Record<string, Type<any>>> extends Type<{
  [key in keyof O]: ActualType<O[key]>
}> {
  constructor(public readonly obj: O) {
    super();
    this.init(
      `{
  ${Object.entries(obj).map(([key, type]) => (
        `${key}: ${type.name}`
      )).join(',\n')}
  }`,
      `An object containing:\n${Object.entries(obj).map(([key, type]) => (
        `${key} - ${type.description}`
      )).join(',\n')}`
    );
  }

  convert = async (value: any) => {
    if (typeof value !== 'object') {
      throw new Error(`Expected an object, got ${value}`);
    }
    const typeEntries = Object.entries(this.obj);
    const result = {} as any;
    for (const [key, type] of typeEntries) {
      try {
        result[key] = await type.convert(value[key]);
      } catch (error) {
        throw new Error(`Expected to match type for object's key '${key}', but failed: ${error.message}`);
      }
    }
    return result;
  };
}

export const objectType = <O extends Record<string, Type<any>>>(obj: O) => new ObjectType(obj);
