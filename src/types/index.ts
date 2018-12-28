import { arrayType } from './array.type';
import { booleanType } from './boolean.type';
import { enumType } from './enum.type';
import { mapType } from './map.type';
import { numberType } from './number.type';
import { objectType } from './object.type';
import { pathType } from './path.type';
import { stringType } from './string.type';

export * from './array.type';
export * from './boolean.type';
export * from './enum.type';
export * from './map.type';
export * from './number.type';
export * from './object.type';
export * from './path.type';
export * from './string.type';

export const Types = {
  array: arrayType,
  boolean: booleanType,
  enum: enumType,
  map: mapType,
  number: numberType,
  object: objectType,
  path: pathType,
  string: stringType,
};
