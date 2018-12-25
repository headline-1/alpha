import 'source-map-support/register';

import { alpha } from './alpha';

export * from './command';
export * from './parameters';
export * from './types';
export * from './utils/alpha-error';
export * from './utils/execute';
export * from './utils/file';
export * from './utils/sleep';

alpha()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('An error occurred while running @lpha.\n', err);
    process.exit(1);
  });
