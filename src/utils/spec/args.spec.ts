import { parseArgs } from '../args';

describe('args', () => {
  describe('#parseArgs', () => {
    it('parses arguments array to an object', () => {
      expect(parseArgs(['--arg1', '--arg2', '--arg3=bla'])).toEqual({
        arg1: 'true',
        arg2: 'true',
        arg3: 'bla',
      });
    });
  });
});
