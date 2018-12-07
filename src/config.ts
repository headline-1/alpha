import { get } from 'lodash';

export interface Config {
  commands: string[];
}

const CONFIG_LOCATIONS = [
  '.butler.json',
  'butler.js',
  'package.json:butler',
];
const SUPPORTED_CONFIG_EXTENSIONS = [
  '.js', '.json',
];

const sanitizeConfig = (config: Partial<Config>): Config => config ? ({
  commands: [],
  ...config,
}) : undefined;

const readConfigFile = async (location: string): Promise<Config | undefined> => {
  const [file, key] = location.split(':');
  if (!file) {
    throw new Error('Config file has no location specified.');
  }
  const extension = file.slice(file.lastIndexOf('.'));
  if (SUPPORTED_CONFIG_EXTENSIONS.indexOf(extension) < 0) {
    throw new Error('Config file has unsupported extension.');
  }
  if (file.endsWith('.js') || file.endsWith('.json')) {
    try {
      const configFile = require(file);
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
    return readConfigFile(configLocation);
  }
  for (const location of CONFIG_LOCATIONS) {
    const config = readConfigFile(location);
    if (config) {
      return config;
    }
  }
  throw new Error('Butler configuration wasn\'t found in current project.');
};
