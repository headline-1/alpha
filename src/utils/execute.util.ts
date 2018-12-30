import { exec as processExec } from 'child_process';
import { Logger } from './log.util';

interface ExecOptions {
  tag?: string;
  silent?: boolean;
}

const firstWord = (str: string, separator: string) => {
  const end = str.indexOf(separator);
  return end < 0 ? str : str.substring(0, end);
};

export const exec = (
  command: string,
  {
    silent = true,
    tag = `ProcessExec(${firstWord(command, ' ')})`,
  }: ExecOptions = {}
): Promise<string> => new Promise<string>((resolve, reject) => {
  const child = processExec(command, { windowsHide: true });
  let result = '';
  child.stdout.on('data', chunk => result += chunk);
  child.stderr.on('data', chunk => result += chunk);
  if (!silent) {
    child.stdout.on('data', data => Logger.log(tag, data));
    child.stderr.on('data', data => Logger.error(tag, data));
  }
  child.on('exit', (code, signal) => code === 0
    ? resolve(result.toString())
    : reject(new Error(`${command} exited with code ${code}:${signal}\nLog:\n${result}`))
  );
});
