// Preload only for the audited local test runner. Never load .env or a DB client.
const Module = require('node:module');
const blocked = () => {
  const error = new Error('OFFLINE_TEST_BLOCKED: outbound network is disabled');
  error.code = 'OFFLINE_TEST_BLOCKED';
  throw error;
};
globalThis.fetch = blocked;
for (const name of ['node:http', 'node:https']) {
  const mod = require(name);
  mod.request = blocked;
  mod.get = blocked;
}
require('node:net').connect = blocked;
require('node:net').createConnection = blocked;
require('node:tls').connect = blocked;
const originalLoad = Module._load;
Module._load = function (name, ...args) {
  if (
    name === '@marketingspa/database' ||
    name === '@prisma/client' ||
    name.includes('/@prisma/client')
  ) {
    throw new Error('OFFLINE_TEST_BLOCKED: database clients are disabled');
  }
  return originalLoad.call(this, name, ...args);
};
require('node:module').syncBuiltinESMExports();
