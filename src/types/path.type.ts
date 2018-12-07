import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { Type } from '../type';

export const PathType: Type<string> = {
  name: 'path',
  description: 'A valid path to existing file or directory.',
  convert: async (value: any) => {
    const p = path.resolve(value);
    if (await promisify(fs.access)(p).then(() => true, () => false)) {
      return p;
    }
    throw new Error(`Can't access path '${value}' resolved as '${p}'.`);
  },
};
