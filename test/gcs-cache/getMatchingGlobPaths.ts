/* eslint-disable node/no-process-env */

import path from 'node:path';
import test from 'ava';
import {
  getMatchingGlobPaths,
} from '../../src/getMatchingGlobPaths';

const FIXTURES_PATH = path.resolve(__dirname, '../fixtures');

test('gets all matching paths relative to the working directory', async (t) => {
  t.deepEqual(await getMatchingGlobPaths(__dirname, [
    FIXTURES_PATH,
  ]), [
    '../fixtures',
  ]);
});
