import * as path from 'path';
import { CommandBuilder } from '../../command';
import { ParametersBuilder } from '../../parameters';
import { StringType } from '../../types';
import { generateDoc } from '../docs';
import { readFile } from '../file';

describe('docs', () => {
  describe('#generateDoc', () => {
    it('generates documentation for a complete command', async () => {
      const parameters = new ParametersBuilder()
        .add('parameter1', {
          type: StringType,
          description: 'parameter1 description',
          default: '1',
        })
        .build();
      const command = new CommandBuilder()
        .name('command')
        .description('description')
        .parameters(parameters)
        .build();

      const result = await readFile(path.resolve(__dirname, 'docs.spec.mock.complete.md'));
      expect(generateDoc(command)).toEqual(result);
    });

    it('generates documentation for an incomplete command', async () => {
      const command = new CommandBuilder()
        .name('command')
        .build();

      const result = await readFile(path.resolve(__dirname, 'docs.spec.mock.incomplete.md'));
      expect(generateDoc(command)).toEqual(result);
    });
  });
});
