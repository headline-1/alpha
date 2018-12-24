import { ParametersBuilder } from '../parameters';
import { FloatType, StringType } from '../types';

describe('ParametersBuilder', () => {
  const param1 = {
    type: StringType,
    description: 'Test parameter',
  };
  const param2 = {
    type: FloatType,
    description: 'Test parameter 2',
  };

  it('adds parameters with #add method', () => {
    const builder = new ParametersBuilder()
      .add('param1', param1)
      .add('param2', param2);

    expect(builder.parameters)
      .toMatchObject({ param1, param2 });
  });
  it('returns all parameters with #build method', () => {
    const builder = new ParametersBuilder()
      .add('param1', param1)
      .add('param2', param2);

    expect(builder.build()).toEqual({ param1, param2 });
  });
});
