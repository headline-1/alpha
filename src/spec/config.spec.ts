import { sanitizeConfig } from '../config';

describe('config', () => {
  describe('#sanitizeConfig', () => {
    it('merges configuration with defaults', () => {
      expect(sanitizeConfig({})).toEqual({
        commands: [],
      });

      expect(sanitizeConfig({
        commands: ['a'],
      })).toEqual({
        commands: ['a'],
      });
    });

    it('returns undefined if passed config is undefined', () => {
      expect(sanitizeConfig(undefined)).toBe(undefined);
    });
  });
});
