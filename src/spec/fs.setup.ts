import * as fs from 'fs';
import { isObject } from 'lodash';
import * as Path from 'path';

const fsModule: any = fs;
let fsMock = {};
let useOriginal = true;
let isOverlay = false;

const callbackify = (fn: (...args: any[]) => any) => (...args: any[]) => {
  const callback = args[args.length - 1];
  const newArgs = args.slice(0, -1);
  try {
    const result = fn(...newArgs);
    callback(null, result);
  } catch (err) {
    callback(err);
  }
};

const mockFsFunction = (name: string, isReadOnly: boolean, fnSync: (...args: any[]) => any) => {
  const originalSync = fsModule[name + 'Sync'];
  const original = fsModule[name];
  const fn = callbackify(fnSync);

  fsModule[name + 'Sync'] = (...args: any[]) => {
    if (useOriginal) {
      return originalSync(...args);
    }
    try {
      return fnSync(...args);
    } catch (error) {
      if (isReadOnly && isOverlay) {
        return originalSync(...args);
      }
      throw error;
    }
  };
  fsModule[name] = (...args: any[]) => {
    if (useOriginal) {
      return original(...args);
    }
    const argsWithoutCallback = args.slice(0, -1);
    const callback = args[args.length - 1];
    fn(...argsWithoutCallback, (err: any, result: any) => {
      if (err && isReadOnly && isOverlay) {
        return original(...args);
      }
      return callback(err, result);
    });
  };
};

class MockedFSError extends Error {
  constructor(message: string) {
    super(`Mocked FS Error: ${message}\nMocked FS:\n${JSON.stringify(fsMock, null, 2)}`);
  }
}

const pathToKey = (path: string): string[] => Path.resolve(path)
  .replace(/[\\/]+/g, '/')
  .replace(/(^\.+)|(\.+$)/g, '')
  .split('/')
  .filter(Boolean);

const get = (fsObject: any, path: string) => {
  const pathParts = pathToKey(path);
  let element = fsObject;
  for (const part of pathParts) {
    if (!element[part]) {
      return undefined;
    }
    element = element[part];
  }
  return element;
};
const set = (fsObject: any, path: string, value: any): void => {
  const pathParts = pathToKey(path);
  let element = fsObject;
  for (const part of pathParts.slice(0, -1)) {
    if (!element[part]) {
      element[part] = {};
    }
    element = element[part];
  }
  element[pathParts[pathParts.length - 1]] = value;
};
const unset = (fsObject: any, path: string): void => {
  const pathParts = pathToKey(path);
  let element = fsObject;
  for (const part of pathParts.slice(0, -1)) {
    if (!element[part]) {
      throw new MockedFSError('Attempt to reach undefined path.');
    }
    element = element[part];
  }
  delete element[pathParts[pathParts.length - 1]];
};

const assertHasParentDirectory = (key: string) => {
  const parentPath = Path.dirname(key);
  const parent = get(fsMock, parentPath);
  if (parentPath.length && !isObject(parent)) {
    throw new MockedFSError(`"${key}" must have a directory as a parent.`);
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

mockFsFunction('rename', false, (source: string, destination: string) => {
  const value = get(fsMock, source);

  assertDoesExist(source);
  assertDoesNotExist(destination);
  assertHasParentDirectory(destination);

  set(fsMock, destination, value);
  unset(fsMock, source);
});

mockFsFunction('readFile', true, (path: string) => {
  const value = get(fsMock, path);

  assertDoesExist(path);
  assertIsFile(path);

  return value;
});
mockFsFunction('writeFile', false, (path: string, data: string) => {
  assertHasParentDirectory(path);

  set(fsMock, path, data);
});

mockFsFunction('copyFile', false, (source: string, destination: string) => {
  const value = get(fsMock, source);

  assertDoesExist(source);
  assertIsFile(source);
  assertDoesNotExist(destination);
  assertHasParentDirectory(destination);

  set(fsMock, destination, value);
});

mockFsFunction('unlink', false, (path: string) => {
  assertDoesExist(path);
  assertHasNoChildren(path);

  unset(fsMock, path);
});

mockFsFunction('mkdir', false, (path: string) => {
  assertHasParentDirectory(path);
  assertDoesNotExist(path);

  set(fsMock, path, {});
});

mockFsFunction('stat', true, (path: string) => {
  const value = get(fsMock, path);

  assertDoesExist(path);

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
});

mockFsFunction('readdir', true, (path: string): string[] => {
  assertIsDirectory(path);
  return Object.keys(get(fsMock, path));
});

mockFsFunction('exists', true, (path: string) => !!get(fsMock, path));

mockFsFunction('access', true, (path: string) => {
  if (!get(fsMock, path)) {
    throw new Error('EACCESS');
  }
});

export const FSMock = {
  disable: () => {
    useOriginal = true;
  },
  enable: () => {
    fsMock = {};
    set(fsMock, process.cwd(), {});
    useOriginal = false;
  },
  setOverlay: (overlay: boolean) => {
    isOverlay = overlay;
  },
};
