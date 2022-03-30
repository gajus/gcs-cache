import * as exec from '@actions/exec';
import {
  CompressionMethod,
} from './types';

export const extractTar = async (
  archivePath: string,
  compressionMethod: CompressionMethod,
  cwd: string,
): Promise<void> => {
  const compressionArgs =
    compressionMethod === CompressionMethod.GZIP ?
      [
        '-z',
      ] :
      [
        '--use-compress-program',
        'zstd -d --long=30',
      ];

  await exec.exec('tar', [
    '-x',
    ...compressionArgs,
    '-P',
    '-f',
    archivePath,
    '-C',
    cwd,
  ]);
};
