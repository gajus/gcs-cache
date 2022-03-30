import * as exec from '@actions/exec';
import type {
  TestFn,
} from 'ava';
import anyTest from 'ava';
import * as sinon from 'sinon';
import type {
  SinonSandbox,
} from 'sinon';
import {
  getZstdVersion,
} from '../../src/getZstdVersion';

const test = anyTest as TestFn<{sandbox: SinonSandbox, }>;

test.beforeEach((t) => {
  t.context = {
    sandbox: sinon.createSandbox(),
  };
});

test.afterEach((t) => {
  t.context.sandbox.restore();
});

test('extracts zstd version', async (t) => {
  t.context.sandbox.stub(exec, 'getExecOutput').resolves({
    exitCode: 0,
    stderr: '',
    stdout: '*** zstd command line interface 64-bits v1.5.2, by Yann Collet ***\n',
  });

  const zstdVersion = await getZstdVersion();

  t.is(zstdVersion, '1.5.2');
});

test('returns null if error or version cannot be determined', async (t) => {
  t.context.sandbox.stub(exec, 'getExecOutput').rejects();

  const zstdVersion = await getZstdVersion();

  t.is(zstdVersion, null);
});
