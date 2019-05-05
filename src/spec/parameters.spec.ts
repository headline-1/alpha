import { ParametersBuilder } from '../parameters';
import { Types } from '../types';

describe('ParametersBuilder', () => {
  const param1 = {
    type: Types.string,
    required: true,
    description: 'Test parameter',
  };
  const param2 = {
    type: Types.number,
    required: true,
    description: 'Test parameter 2',
  };
  const param3 = {
    type: Types.array(Types.string),
    required: true,
    description: 'Array parameter',
  };

  it('adds parameters with #add method', () => {
    const builder = new ParametersBuilder()
      .add('param1', param1)
      .add('param2', param2)
      .add('param3', param3);

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
