import { get } from 'lodash';
import * as path from 'path';
import { readDir } from './utils/file';

export interface Config {
  commands: string[];

  [commandName: string]: Record<string, any>;
}

const CONFIG_LOCATIONS: ([RegExp, string?])[] = [
  [/^\.?[a@]?(?:lpha)?\.js(?:on)?$/],
  [/^package\.json$/, '@'],
];

export const sanitizeConfig = (config: Partial<Config> | undefined): Config | undefined => config ? ({
  commands: [],
  ...config,
}) : undefined;

export const readConfigFile = async ([file, key]: [RegExp | string, string?]): Promise<Config | undefined> => {
  if (!file) {
    throw new Error('Config file has no location specified.');
  }
  const directory = path.resolve('.');
  const files = await readDir(directory);
  const fileName = files.find(f => typeof file === 'string' ? file === f : file.test(f));
  if (!fileName) {
    return undefined;
  }
  const filePath = path.join(directory, fileName);
  if (filePath.endsWith('.js') || filePath.endsWith('.json')) {
    try {
      const configFile = require(filePath);
      return sanitizeConfig(key ? get(configFile, key) : configFile);
    } catch (error) {
      // If there's an error loading file, just return undefined; otherwise rethrow error
      if (error.code === 'MODULE_NOT_FOUND') {
        return undefined;
      }
      throw error;
    }
  }
  return undefined;
};

export const getConfig = async (configLocation?: string): Promise<Config> => {
  if (configLocation) {
    const config = await readConfigFile(configLocation.split(':') as [string, string?]);
    if (config) {
      return config;
    }
    throw new Error(`@lpha configuration does not exist at specified path "${configLocation}"`);
  }
  for (const location of CONFIG_LOCATIONS) {
    const config = await readConfigFile(location);
    if (config) {
      return config;
    }
  }
  throw new Error('@lpha configuration wasn\'t found in current project.');
};
