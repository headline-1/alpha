import { parameters } from '../parameters';
import { Types } from '../types';

describe('ParametersBuilder', () => {
  const param1 = {
    type: Types.string(),
    description: 'Test parameter',
  };
  const param2 = {
    type: Types.number(),
    description: 'Test parameter 2',
  };
  const param3 = {
    type: Types.array(),
    description: 'Array parameter',
  };

  it('adds parameters with #add method', () => {
    const builder = parameters()
      .add('param1', param1)
      .add('param2', param2)
      .add('param3', param3);

    expect(builder.parameters)
      .toMatchObject({ param1, param2 });
  });
  it('returns all parameters with #build method', () => {
    const builder = parameters()
      .add('param1', param1)
      .add('param2', param2);

    expect(builder.build()).toEqual({ param1, param2 });
  });
});
