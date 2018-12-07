import { ActualType, Type } from '../type';

export const ObjectType = <O extends Record<string, Type<any>>>(obj: O): Type<{
  [key in keyof O]: ActualType<O[key]>
}> => ({
  name: `{
  ${Object.entries(obj).map(([key, type]) => (
    `${key}: ${type.name}`
  )).join(',\n')}
  }`,
  description: `An object containing:\n${Object.entries(obj).map(([key, type]) => (
    `${key} - ${type.description}`
  )).join(',\n')}`,
  convert: (value: any) => {
    if (typeof value !== 'object') {
      throw new Error(`Expected an object, got ${value}`);
    }
    const typeEntries = Object.entries(obj);
    const result = {} as any;
    for (const [key, type] of typeEntries) {
      try {
        result[key] = type.convert(value[key]);
      } catch (error) {
        throw new Error(`Expected to match type for object's key '${key}', but failed: ${error.message}`);
      }
    }
    return result;
  },
});
