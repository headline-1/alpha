import { Type } from '../type';

export const StringType: Type<string> = {
  name: 'string',
  description: 'Any text value.',
  convert: (value: any) => value.toString(),
};
