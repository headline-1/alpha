import { get, isObject, set, unset } from 'lodash';
import * as Path from 'path';

const fsMock = {};

class MockedFSError extends Error {
  constructor(message: string) {
    super('Mocked FS Error: ' + message);
  }
}

const pathToKey = (path: string) => Path.resolve(path)
  .replace(/[\\/]/g, '.')
  .replace(/(^\.+)|(\.+$)/g, '');

const parentKey = (key: string) => key.substring(0, key.lastIndexOf('.'));
const assertHasParentDirectory = (key: string) => {
  const parent = get(fsMock, parentKey(key));
  if (!isObject(parent)) {
    throw new MockedFSError(`${key} must have a directory as a parent.`);
  }
};
const assertDoesExist = (key: string) => {
  const value = get(fsMock, key);
  if (value === undefined) {
    throw new MockedFSError(`${key} does not exist.`);
  }
};
const assertDoesNotExist = (key: string) => {
  if (get(fsMock, key) !== undefined) {
    throw new MockedFSError(`${key} already exists.`);
  }
};
const assertIsFile = (key: string) => {
  const value = get(fsMock, key);
  if (isObject(value)) {
    throw new MockedFSError(`${key}: Can not read an element which is not a file`);
  }
};
const assertIsDirectory = (key: string) => {
  const value = get(fsMock, key);
  if (!isObject(value)) {
    throw new MockedFSError(`${key}: Can not read an element which is not a directory`);
  }
};
const assertHasNoChildren = (key: string) => {
  const value = get(fsMock, key);
  if (isObject(value) && Object.keys(value)) {
    throw new MockedFSError(`${key}: Element has children`);
  }
};

set(fsMock, pathToKey(process.cwd()), {});

const rename = async (source: string, destination: string) => {
  const sourceKey = pathToKey(source);
  const destinationKey = pathToKey(destination);
  const value = get(fsMock, sourceKey);

  assertDoesExist(sourceKey);
  assertDoesNotExist(destinationKey);
  assertHasParentDirectory(destinationKey);

  set(fsMock, destinationKey, value);
  unset(fsMock, sourceKey);
};

const read = async (path: string, _format: string) => {
  const key = pathToKey(path);
  const value = get(fsMock, key);

  assertDoesExist(key);
  assertIsFile(key);

  return value;
};

const write = async (path: string, data: string, _format: string) => {
  const key = pathToKey(path);

  assertHasParentDirectory(key);

  set(fsMock, key, data);
};

const copyFile = async (source: string, destination: string) => {
  const sourceKey = pathToKey(source);
  const destinationKey = pathToKey(destination);
  const value = get(fsMock, sourceKey);

  assertDoesExist(sourceKey);
  assertIsFile(sourceKey);
  assertDoesNotExist(destinationKey);
  assertHasParentDirectory(destinationKey);

  set(fsMock, destinationKey, value);
};

const unlink = async (path: string) => {
  const key = pathToKey(path);

  assertDoesExist(key);
  assertHasNoChildren(key);

  unset(fsMock, key);
};

const mkdir = async (path: string) => {
  const key = pathToKey(path);

  assertHasParentDirectory(key);
  assertDoesNotExist(key);

  set(fsMock, key, {});
};

export const stat = async (path: string) => {
  const key = pathToKey(path);
  const value = get(fsMock, key);

  assertDoesExist(key);

  return {
    isFile: () => !isObject(value),
    isDirectory: () => isObject(value),
    isBlockDevice: () => false,
    isCharacterDevice: () => false,
    isSymbolicLink: () => false,
    isFIFO: () => false,
    isSocket: () => false,
    dev: 0,
    ino: 0,
    mode: 777,
    nlink: 0,
    uid: 0,
    gid: 0,
    rdev: 0,
    size: isObject(value) ? 0 : value.toString().length * 2,
    blksize: 0,
    blocks: 0,
    atimeMs: Date.now(),
    mtimeMs: Date.now(),
    ctimeMs: Date.now(),
    birthtimeMs: Date.now(),
    atime: new Date(),
    mtime: new Date(),
    ctime: new Date(),
    birthtime: new Date(),
  };
};

export const readDir = async (path: string): Promise<string[]> => {
  const key = pathToKey(path);
  assertIsDirectory(key);
  return Object.keys(get(fsMock, key));
};
export const exists = async (path: string) => {
  const key = pathToKey(path);
  return !!get(fsMock, key);
};

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
