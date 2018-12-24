import { Type } from '../type';

export const StringType: Type<string> = {
  name: 'string',
  description: 'Any text value.',
  convert: async (value: any) => value.toString(),
};
