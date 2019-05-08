import * as fs from 'fs';
import { Glob } from 'glob';
import * as Path from 'path';
import { promisify } from 'util';

const rename = promisify(fs.rename);
const read = promisify(fs.readFile);
const write = promisify(fs.writeFile);
const copyFile = promisify(fs.copyFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);
const rmdir = promisify(fs.rmdir);
export const stat = promisify(fs.stat);
export const readDir = promisify(fs.readdir);
export const glob = promisify(Glob);

export enum Access {
  EXISTS = fs.constants.F_OK,
  WRITE = fs.constants.W_OK,
  READ = fs.constants.R_OK,
  EXECUTE = fs.constants.X_OK,
}

export const access = (path: string, mode: Access): Promise<boolean> =>
  new Promise(resolve => fs.access(path, mode, err => resolve(!err)));

export const readFile = (file: string, format = 'utf8') => read(file, format);

export const writeFile = async (file: string, data: any, format = 'utf8') => {
  const fileAccessible = await access(file, Access.EXISTS);
  if (fileAccessible) {
    await rename(file, file + '.old');
  }
  await write(file, data, format);
  if (fileAccessible) {
    await unlink(file + '.old');
  }
};

export const makeDir = (path: string, mode: number = 0o777) => mkdir(path, {
  recursive: true,
  mode,
});

export const copyFilesInternal = async (source: string, destination: string): Promise<void> => {
  if (!await access(source, Access.READ)) {
    throw new Error(`${source} does not exist and cannot be copied to ${destination}.`);
  }
  if ((await stat(source)).isDirectory()) {
    if (!await access(destination, Access.WRITE)) {
      await makeDir(destination);
    }
    const files = await readDir(source);
    await Promise.all(
      files.map(file => copyFilesInternal(Path.join(source, file), Path.join(destination, file)))
    );
  } else {
    await copyFile(source, destination);
  }
};

export const copy: (source: string, destination: string) => Promise<void> = copyFilesInternal;

export const remove = async (path: string) => {
  if (!await access(path, Access.EXISTS)) {
    return;
  }

  const status = await stat(path);
  if (!status.isDirectory()) {
    await unlink(path);
    return;
  }
  const files = await readDir(path);
  await Promise.all(
    files.map(file => remove(Path.join(path, file)))
  );
  await rmdir(path);
};
