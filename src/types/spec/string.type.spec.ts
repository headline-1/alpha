import { Types } from '../';

describe('string.type', () => {
  it('returns string name and description', () => {
    const type = Types.string();
    expect(type.name).toEqual('string');
    expect(type.description).toEqual('Any string value.');
  });

  it('returns regexp name and description', () => {
    const type = Types.string(/^abc|def$/gi);
    expect(type.name).toEqual('string/^abc|def$/gi');
    expect(type.description).toEqual('A string matching /^abc|def$/gi regular expression.');
  });

  it('validates regexp', async () => {
    const type = Types.string(/^abc|def$/gi);
    await expect(type.convert('abc')).resolves.toEqual('abc');
    await expect(type.convert('def')).resolves.toEqual('def');
    await expect(type.convert('x')).rejects.toEqual(
      new Error('Expected a string matching /^abc|def$/gi regular expression, got x.')
    );
  });

  it('validates if input is a string', async () => {
    const type = Types.string();
    await expect(type.convert(undefined)).rejects.toEqual(
      new Error('Expected a string or a value that can be evaluated to string, got undefined')
    );
    await expect(type.convert(null)).rejects.toEqual(
      new Error('Expected a string or a value that can be evaluated to string, got null')
    );
  });

  it('always returns string', async () => {
    const type = Types.string();
    await expect(type.convert(false)).resolves.toEqual('false');
    await expect(type.convert(2)).resolves.toEqual('2');
    await expect(type.convert(10.44)).resolves.toEqual('10.44');
    await expect(type.convert({ a: 1 })).resolves.toEqual('[object Object]');
    await expect(type.convert([1, 2, 3])).resolves.toEqual('1,2,3');
  });
});
