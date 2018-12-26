import { isDefined } from './is-defined.util';

export type Args = Record<string, string>;

export const parseArgs = (argv: string[]): Args => argv
  .map(arg => arg.match(/^--(.+?)(?:=(.+))?$/))
  .filter(isDefined)
  .reduce((args, arg) => ({ ...args, [arg[1]]: arg[2] !== undefined ? arg[2] : 'true' }), {});
