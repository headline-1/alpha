import { Types } from '../';

describe('boolean.type', () => {
  it('returns boolean name and description', () => {
    const type = Types.boolean();
    expect(type.name).toEqual('boolean');
    expect(type.description).toEqual('A boolean value.');
  });

  it('validates if input is a boolean', async () => {
    const type = Types.boolean();
    await expect(type.convert(undefined)).rejects.toEqual(
      new Error('Expected a boolean or a value that can be evaluated to boolean, got undefined.')
    );
    await expect(type.convert(null)).rejects.toEqual(
      new Error('Expected a boolean or a value that can be evaluated to boolean, got null.')
    );
    await expect(type.convert({})).rejects.toEqual(
      new Error('Expected a boolean or a value that can be evaluated to boolean, got [object Object].')
    );
    await expect(type.convert([])).rejects.toEqual(
      new Error('Expected a boolean or a value that can be evaluated to boolean, got .')
    );
  });

  it('always returns boolean', async () => {
    const type = Types.boolean();
    await expect(type.convert(false)).resolves.toEqual(false);
    await expect(type.convert(true)).resolves.toEqual(true);
    await expect(type.convert(0)).resolves.toEqual(false);
    await expect(type.convert(1)).resolves.toEqual(true);
    await expect(type.convert('false')).resolves.toEqual(false);
    await expect(type.convert('true')).resolves.toEqual(true);
  });

  it('is immutable', () => {
    const type = Types.boolean();

    expect(Object.isFrozen(type)).toBe(true);
  });

  it('is cloneable', () => {
    const type = Types.boolean();
    const clone = type.clone();

    // tslint:disable-next-line
    expect(new String('abc')).toEqual(new String('abc'));
    expect(clone).not.toBe(type);
    expect(clone).toEqual(type);
  });
});
