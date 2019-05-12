#! /usr/bin/env node --max-old-space-size=4096
const { alpha } = require('./dist/index');
alpha().then(() => {
  process.exit(0);
});
