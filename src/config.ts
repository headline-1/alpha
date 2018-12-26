import * as path from 'path';
import { exists, readDir, readFile } from './utils/file.util';

export interface Config {
  commands: string[];

  [commandName: string]: Record<string, any>;
}

const CONFIG_LOCATIONS: ([RegExp, string?])[] = [
  [/^\.?[a@]?(?:lpha)?\.js(?:on)?$/],
  [/^package\.json$/, '@'],
];

export const sanitizeConfig = (object: any | undefined, key?: string): Config | undefined => {
  if (!object || (key && !object[key])) {
    return undefined;
  }
  const config = key ? object[key] : object;
  return {
    commands: [],
    ...config,
  };
};

export const readConfigFile = async (file: RegExp | string): Promise<object | undefined> => {
  if (!file) {
    throw new Error('Config file has no location specified.');
  }
  if (typeof file === 'string') {
    file = path.resolve(file);
  } else {
    const directory = path.resolve('.');
    const files = await readDir(directory);
    const fileName = files.find(f => (file as RegExp).test(f));
    if (!fileName) {
      return undefined;
    }
    file = path.join(directory, fileName);
  }
  if (!(await exists(file))) {
    return undefined;
  }
  switch (path.extname(file)) {
    case '.json':
      return JSON.parse(await readFile(file));
    case '.js':
      // tslint:disable-next-line
      return eval(await readFile(file));
    default:
      return undefined;
  }
};

export const getConfig = async (configLocation?: string): Promise<Config> => {
  if (configLocation) {
    const [path, key] = configLocation.split(':') as [string, string?];
    const config = sanitizeConfig(await readConfigFile(path), key);
    if (config) {
      return config;
    }
    throw new Error(`@lpha configuration does not exist at specified path "${configLocation}"`);
  }
  for (const [path, key] of CONFIG_LOCATIONS) {
    const config = sanitizeConfig(await readConfigFile(path), key);
    if (config) {
      return config;
    }
  }
  throw new Error('@lpha configuration wasn\'t found in current project.');
};
