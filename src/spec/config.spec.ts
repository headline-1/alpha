import { getConfig, readConfigFile, sanitizeConfig } from '../config';
import { makeDir, writeFile } from '../utils/file.util';
import { FSMock } from './fs.setup';

describe('config', () => {
  beforeEach(() => {
    FSMock.enable();
  });

  afterEach(() => {
    FSMock.disable();
  });

  describe('#sanitizeConfig', () => {
    it('merges configuration with defaults', () => {
      expect(sanitizeConfig({ a: { a: 1 } })).toEqual({
        a: { a: 1 },
        commands: [],
      });

      expect(sanitizeConfig({
        commands: ['a'],
        a: { a: 1 },
      })).toEqual({
        commands: ['a'],
        a: { a: 1 },
      });
    });

    it('returns undefined if passed config is undefined', () => {
      expect(sanitizeConfig(undefined)).toBe(undefined);
    });

    it('returns the config if it\'s a property of passed object', () => {
      expect(sanitizeConfig(
        {
          config: { a: { a: 1 } },
        },
        'config'
      )).toEqual({
        commands: [],
        a: { a: 1 },
      });
    });

    it('returns undefined if passed property does not exist', () => {
      expect(sanitizeConfig({}, 'config')).toBe(undefined);
    });
  });
  describe('#readConfigFile', () => {
    it('reads config stored in js file', async () => {
      await makeDir('/test');
      const config = { a: { a: 1 }, b: { b: 2 } };
      await writeFile('/test/config.js', `module.exports = ${JSON.stringify(config)};`);

      const readConfig = await readConfigFile('/test/config.js');
      expect(readConfig).toEqual(config);
    });

    it('reads config stored in json file', async () => {
      await makeDir('/test');
      const config = { a: { a: 1 }, b: { b: 2 } };
      await writeFile(
        '/test/config.json',
        JSON.stringify(config)
      );

      const readConfig = await readConfigFile('/test/config.json');
      expect(readConfig).toEqual(config);
    });

    it('reads default', async () => {
      const config = { a: { a: 1 } };
      await writeFile('alpha.json', JSON.stringify(config));

      const readConfig = await readConfigFile(/alpha/);
      expect(readConfig).toEqual(config);
    });

    it('doesn\'t read config stored in unknown file type', async () => {
      const config = { a: { a: 1 } };
      await writeFile('alpha.unknown', JSON.stringify(config));

      const readConfig = await readConfigFile(/alpha/);
      expect(readConfig).toEqual(undefined);
    });

    it('returns undefined if provided path or regexp is invalid', async () => {
      await expect(readConfigFile('')).rejects.toEqual(new Error('Config file has no location specified.'));
      await expect(readConfigFile('invalid-location')).resolves.toBe(undefined);
      await expect(readConfigFile(/^invalidregex$/)).resolves.toBe(undefined);
    });
  });

  describe('#getConfig', () => {
    beforeEach(() => {
      FSMock.setOverlay(false);
    });

    afterEach(() => {
      FSMock.setOverlay(true);
    });

    const testFile = async (fileName: string, customName?: string) => {
      const config = { a: { a: 1 }, commands: ['a'] };
      await writeFile(fileName, JSON.stringify(config));
      await expect(getConfig(customName)).resolves.toEqual(config);
    };

    const testPackageJson = async (key: string) => {
      const config = { a: { a: 1 }, commands: ['a'] };
      await writeFile('package.json', JSON.stringify({ [key]: config }));
      await expect(getConfig()).resolves.toEqual(config);
    };

    it('returns config stored in custom location "my-config.json"', async () => {
      await testFile('my-config.json', 'my-config.json');
    });

    it('throws error when config is not found in custom location "my-config.json"', async () => {
      await expect(getConfig('my-config.json')).rejects.toEqual(
        new Error('@lpha configuration does not exist at specified path "my-config.json"')
      );
    });

    it('throws error when config is not found in in "package.json:@"', async () => {
      await writeFile('package.json', '{}');
      await expect(getConfig()).rejects.toEqual(
        new Error('@lpha configuration wasn\'t found in current project.')
      );
    });

    it('returns config stored in "package.json:@"', async () => {
      await testPackageJson('@');
    });

    it('returns config stored in "@.json"', async () => {
      await testFile('@.json');
    });

    it('returns config stored in ".@.json"', async () => {
      await testFile('.@.json');
    });

    it('returns config stored in "@lpha.json"', async () => {
      await testFile('@lpha.json');
    });

    it('returns config stored in ".@lpha.json"', async () => {
      await testFile('.@lpha.json');
    });

    it('returns config stored in "alpha.json"', async () => {
      await testFile('alpha.json');
    });

    it('returns config stored in ".alpha.json"', async () => {
      await testFile('.alpha.json');
    });
  });
});
