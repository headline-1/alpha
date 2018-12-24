import * as fs from 'fs';
import globCallback from 'glob';
import * as Path from 'path';
import { promisify } from 'util';

console.log(fs);
const rename = promisify(fs.rename);
const read = promisify(fs.readFile);
const write = promisify(fs.writeFile);
const copyFile = promisify(fs.copyFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);
export const stat = promisify(fs.stat);
export const readDir = promisify(fs.readdir);
export const exists = promisify(fs.exists);
export const glob = promisify(globCallback);

export const readFile = (file: string, format = 'utf8') => read(file, format);

export const writeFile = async (file: string, data: any, format = 'utf8') => {
  const fileExists = await exists(file);
  if (fileExists) {
    await rename(file, file + '.old');
  }
  await write(file, data, format);
  if (fileExists) {
    await unlink(file + '.old');
  }
};

export const makeDir = mkdir;

export const makeDirs = async (path: string) => {
  const parts = Path.resolve(path).split(Path.sep);
  for (let p = 0; p < parts.length; p++) {
    const partialPath = Path.join(...parts.slice(0, p + 1));
    if (!await exists(partialPath)) {
      await mkdir(partialPath);
    }
  }
};

export const copyFilesInternal = async (source: string, destination: string, inside = false): Promise<void> => {
  if (!await exists(source)) {
    throw new Error(`${source} does not exist and cannot be copied to ${destination}.`);
  }
  if ((await stat(source)).isDirectory()) {
    if (!await exists(destination)) {
      await inside ? makeDir(destination) : makeDirs(destination);
    }
    const files = await readDir(source);
    await Promise.all(
      files.map(file => copyFilesInternal(Path.join(source, file), Path.join(destination, file), true))
    );
  } else {
    await copyFile(source, destination);
  }
};

export const copy: (source: string, destination: string) => Promise<void> = copyFilesInternal;

export const remove = async (path: string) => {
  if (!await exists(path)) {
    return;
  }
  if ((await stat(path)).isDirectory()) {
    const files = await readDir(path);
    await Promise.all(
      files.map(file => remove(Path.join(path, file)))
    );
  } else {
    await unlink(path);
  }
};
