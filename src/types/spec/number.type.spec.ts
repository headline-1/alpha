import { Types } from '../';

describe('number.type', () => {
  it('returns number name and description', () => {
    const type = Types.number();
    expect(type.name).toEqual('number');
    expect(type.description).toEqual('Any number.');
  });

  it('validates if input is a number', async () => {
    const type = Types.number();
    await expect(type.convert(undefined)).rejects.toEqual(
      new Error('Expected a number or a value that can be evaluated to number, got undefined evaluated to NaN.')
    );
    await expect(type.convert(null)).rejects.toEqual(
      new Error('Expected a number or a value that can be evaluated to number, got null evaluated to NaN.')
    );
    await expect(type.convert({})).rejects.toEqual(
      new Error('Expected a number or a value that can be evaluated to number, got [object Object] evaluated to NaN.')
    );
    await expect(type.convert([])).rejects.toEqual(
      new Error('Expected a number or a value that can be evaluated to number, got  evaluated to NaN.')
    );
    await expect(type.convert(NaN)).rejects.toEqual(
      new Error('Expected a number or a value that can be evaluated to number, got NaN evaluated to NaN.')
    );
  });

  it('always returns number', async () => {
    const type = Types.number();
    await expect(type.convert(0)).resolves.toEqual(0);
    await expect(type.convert(33)).resolves.toEqual(33);
    await expect(type.convert(4.34)).resolves.toEqual(4.34);
    await expect(type.convert('123')).resolves.toEqual(123);
    await expect(type.convert(' 22.244 ')).resolves.toEqual(22.244);
  });

  it('validates if the input is integer', async () => {
    const type = Types.number().integer();
    await expect(type.convert(33)).resolves.toEqual(33);
    await expect(type.convert(33.123)).rejects.toEqual(
      new Error('Expected an integer, got 33.123.')
    );
  });

  it('validates if the input is finite', async () => {
    const type = Types.number();
    await expect(type.convert(Infinity)).rejects.toEqual(
      new Error('Expected an finite number, got Infinity.')
    );
    type.infinity();
    await expect(type.convert(Infinity)).resolves.toEqual(Infinity);
  });

  it('validates if the input is in specified range', async () => {
    const type = Types.number().min(12).max(999);
    const typeMin = Types.number().min(100).infinity();
    const typeMax = Types.number().max(-100).infinity();

    await expect(type.convert(0)).rejects.toEqual(
      new Error('Expected number to be in range <12, 999>, got 0.')
    );
    await expect(type.convert(12)).resolves.toEqual(12);
    await expect(type.convert(999)).resolves.toEqual(999);
    await expect(type.convert(999.1)).rejects.toEqual(
      new Error('Expected number to be in range <12, 999>, got 999.1.')
    );

    await expect(typeMin.convert(0)).rejects.toEqual(
      new Error('Expected number to be in range <100, +∞>, got 0.')
    );
    await expect(typeMin.convert(Number.POSITIVE_INFINITY)).resolves.toEqual(Infinity);

    await expect(typeMax.convert(0)).rejects.toEqual(
      new Error('Expected number to be in range <-∞, -100>, got 0.')
    );
    await expect(typeMax.convert(Number.NEGATIVE_INFINITY)).resolves.toEqual(-Infinity);
  });
});
