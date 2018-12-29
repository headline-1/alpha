import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { Type } from '../type';

export class PathType extends Type<string> {
  constructor() {
    super();
    this.init(
      'path',
      'A valid path to existing file or directory.'
    );
  }

  async convert(value: any): Promise<string> {
    const p = path.resolve(value);
    if (await promisify(fs.access)(p).then(() => true, () => false)) {
      return p;
    }
    throw new Error(`Can't access path '${value}' resolved as '${p}'.`);
  }
}

export const pathType = () => Type.create(PathType);
