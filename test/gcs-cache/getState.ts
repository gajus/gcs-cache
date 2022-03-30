/* eslint-disable node/no-process-env */

import test from 'ava';
import {
  getState,
} from '../../src/getState';

test.beforeEach(() => {
  delete process.env.STATE_BUCKET;
  delete process.env.STATE_CACHE_HIT_KIND;
  delete process.env.STATE_PATHS;
  delete process.env.STATE_TARGET_FILE_NAME;
});

test('throws is "BUCKET" is unset', (t) => {
  process.env.STATE_CACHE_HIT_KIND = 'bar';
  process.env.STATE_PATHS = JSON.stringify([
    'baz',
  ]);
  process.env.STATE_TARGET_FILE_NAME = 'qux';

  t.throws(() => {
    getState();
  }, {
    message: '"BUCKET" state must be set.',
  });
});

test('throws is "CACHE_HIT_KIND" is unset', (t) => {
  process.env.STATE_BUCKET = 'foo';
  process.env.STATE_PATHS = JSON.stringify([
    'baz',
  ]);
  process.env.STATE_TARGET_FILE_NAME = 'qux';

  t.throws(() => {
    getState();
  }, {
    message: '"CACHE_HIT_KIND" state must be set.',
  });
});

test('throws is "PATHS" is unset', (t) => {
  process.env.STATE_BUCKET = 'foo';
  process.env.STATE_CACHE_HIT_KIND = 'bar';
  process.env.STATE_TARGET_FILE_NAME = 'qux';

  t.throws(() => {
    getState();
  }, {
    message: '"PATHS" state must be set.',
  });
});

test('throws is "TARGET_FILE_NAME" is unset', (t) => {
  process.env.STATE_BUCKET = 'foo';
  process.env.STATE_CACHE_HIT_KIND = 'bar';
  process.env.STATE_PATHS = JSON.stringify([
    'baz',
  ]);

  t.throws(() => {
    getState();
  }, {
    message: '"TARGET_FILE_NAME" state must be set.',
  });
});
