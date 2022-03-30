import * as core from '@actions/core';
import * as semver from 'semver';
import {
  getZstdVersion,
} from './getZstdVersion';
import {
  CompressionMethod,
} from './types';

const ZSTD_WITHOUT_LONG_VERSION = '1.3.2';

export const getTarCompressionMethod = async (): Promise<CompressionMethod> => {
  const zstdVersion = await getZstdVersion();

  if (!zstdVersion) {
    core.warning('zstd not available');

    return CompressionMethod.GZIP;
  }

  if (semver.lt(zstdVersion, ZSTD_WITHOUT_LONG_VERSION)) {
    core.warning('zstd does not support long');

    return CompressionMethod.GZIP;
  }

  return CompressionMethod.ZSTD;
};
