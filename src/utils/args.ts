export type Args = Record<string, string>;

export const parseArgs = (argv: string[]): Args => argv
  .map(arg => arg.match(/^--(.+?)(?:=(.+))?$/))
  .filter(arg => !!arg)
  .reduce((args, arg) => ({ ...args, [arg[1]]: arg[2] !== undefined ? arg[2] : 'true' }), {});
