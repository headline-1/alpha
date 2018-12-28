import { AlphaError } from '../alpha-error.util';

describe('AlphaError', () => {
  it('constructs an error with details', () => {
    const error = new AlphaError('command', 'message', {
      obj: {},
    });
    expect(error.command).toEqual('command');
    expect(error.message).toEqual('message');
    expect(error.details).toEqual({ obj: {} });
  });
});
