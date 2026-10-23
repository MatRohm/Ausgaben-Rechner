const path = require('node:path');
const base = require('./.dependency-cruiser.cjs');

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: base.forbidden,
  options: {
    ...base.options,
    tsConfig: { fileName: path.resolve(__dirname, 'client/tsconfig.json') },
  },
};
