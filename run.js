#! /usr/bin/env node
const { alpha } = require('./dist/index');
alpha().then(() => {
  process.exit(0);
});
