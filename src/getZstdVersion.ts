import * as core from '@actions/core';
import * as exec from '@actions/exec';
import {
  extractSemver,
} from './extractSemver';

export const getZstdVersion = async (): Promise<string | null> => {
  let output;

  try {
    output = await exec
      .getExecOutput('zstd', [
        '--version',
      ], {
        silent: true,
      });
  } catch {
    core.warning('zstd not found');

    return null;
  }

  return extractSemver(output.stdout);
};
