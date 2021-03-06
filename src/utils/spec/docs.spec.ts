import * as path from 'path';
import { CommandBuilder } from '../../command';
import { ParametersBuilder } from '../../parameters';
import { Types } from '../../types';
import { generateDoc } from '../docs.util';
import { readFile } from '../file.util';

describe('docs', () => {
  describe('#generateDoc', () => {
    it('generates documentation for a complete command', async () => {
      const params = new ParametersBuilder()
        .add('parameter1', {
          type: Types.string,
          required: true,
          description: 'parameter1 description',
          default: '1',
        })
        .build();
      const command = new CommandBuilder()
        .name('command')
        .description('description')
        .parameters(params)
        .execute(async () => void 0)
        .build();

      const result = await readFile(path.resolve(__dirname, 'docs.spec.mock.complete.md'));
      expect(generateDoc(command)).toEqual(result);
    });

    it('generates documentation for an incomplete command', async () => {
      const command = new CommandBuilder()
        .name('command')
        .execute(async () => void 0)
        .build();

      const result = await readFile(path.resolve(__dirname, 'docs.spec.mock.incomplete.md'));
      expect(generateDoc(command)).toEqual(result);
    });
  });
});
