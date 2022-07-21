/* eslint-disable no-import-assign */

import * as github from '@actions/github';
import {
  type Bucket,
} from '@google-cloud/storage';
import anyTest, {
  type TestFn,
} from 'ava';
import * as sinon from 'sinon';
import {
  type SinonSandbox,
} from 'sinon';
import {
  getExactMatch,
} from '../../src/getExactMatch';

const test = anyTest as TestFn<{sandbox: SinonSandbox, }>;

test.beforeEach((t) => {
  t.context = {
    sandbox: sinon.createSandbox(),
  };

  // @ts-expect-error ignore intention override
  github.context = {
    repo: {
      owner: 'gajus',
      repo: 'gcs-cache',
    },
  };
});

test.afterEach((t) => {
  t.context.sandbox.restore();
});

test('gets File if there is an exact', async (t) => {
  const file = {
    exists: () => {
      return [
        true,
      ];
    },
  };

  const bucket = {
    file: sinon.stub().returns(file),
  } as unknown as Bucket;

  const exactMatch = await getExactMatch(bucket, 'foo');

  t.like(exactMatch, file);
});

test('gets null if there is no match', async (t) => {
  const file = {
    exists: () => {
      return [
        false,
      ];
    },
  };

  const bucket = {
    file: sinon.stub().returns(file),
  } as unknown as Bucket;

  const exactMatch = await getExactMatch(bucket, 'foo');

  t.is(exactMatch, null);
});
