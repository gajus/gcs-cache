import * as exec from '@actions/exec';
import {
  getTarCompressionMethod,
} from './getTarCompressionMethod';
import {
  CompressionMethod,
} from './types';

export const createTar = async (
  archivePath: string,
  paths: readonly string[],
  cwd: string,
): Promise<CompressionMethod> => {
  const compressionMethod = await getTarCompressionMethod();

  console.log(`🔹 Using '${compressionMethod}' compression method.`);

  const compressionArgs =
    compressionMethod === CompressionMethod.GZIP ?
      [
        '-z',
      ] :
      [
        '--use-compress-program',
        'zstd -T0 --long=30',
      ];

  await exec.exec('tar', [
    '-c',
    ...compressionArgs,
    '--posix',
    '-P',
    '-f',
    archivePath,
    '-C',
    cwd,
    ...paths,
  ]);

  return compressionMethod;
};
