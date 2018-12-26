import chalk from 'chalk';
import * as moment from 'moment';
import { inspect } from 'util';

const timestamp = () => moment().format('YYYY.MM.DD HH:mm:ss.SSS');
const stripChalk = (message: string) => message.replace(
  /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
  ''
);

const normalize = (message: any): string => {
  if (typeof message === 'string') {
    return message;
  }
  if (message instanceof Error) {
    const error = message as any;
    const code = error.code ? ` (${error.code})` : '';
    return chalk.red.bold('[ERROR]') + chalk.red(`${error.name + code}: ${message.message}\n${error.stack}`);
  }
  return inspect(message, {
    colors: true,
    depth: 5,
    maxArrayLength: 10,
  });
};

type Logger = {
  log: (message: string) => void;
  useChalk: boolean;
};

const loggers: Logger[] = [];

const add = (logger: Logger) => {
  loggers.push(logger);
};

const log = (logLevel = 'L', tag: string, message: any, ...args: any[]) => {
  const log = `${chalk.bold(
    `${chalk.white(timestamp())} [${logLevel}] [${tag}]`
  )} ${(normalize(message) + ' ' + args.map(normalize)
    .join(', ')).trim()}`;
  for (const logger of loggers) {
    logger.log(logger.useChalk ? log : stripChalk(log));
  }
};

export const Logger = {
  add,
  log: (tag: string, message: any, ...args: any[]) => log(chalk.green('L'), tag, message, ...args),
  warn: (tag: string, message: any, ...args: any[]) => log(chalk.yellow('W'), tag, message, ...args),
  error: (tag: string, message: any, ...args: any[]) => log(chalk.red('E'), tag, message, ...args),
};
