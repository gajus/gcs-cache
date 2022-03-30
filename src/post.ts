import * as path from 'node:path';
import * as core from '@actions/core';
import * as glob from '@actions/glob';
import {
  Storage,
} from '@google-cloud/storage';
import {
  withFile as withTemporaryFile,
} from 'tmp-promise';
import {
  createTar,
} from './createTar';
import {
  getState,
} from './getState';
import type {
  CacheActionMetadata,
} from './types';

const main = async () => {
  const state = getState();

  if (state.cacheHitKind === 'exact') {
    console.log(
      '🌀 Skipping uploading cache as the cache was hit by exact match.',
    );
    return;
  }

  const bucket = new Storage().bucket(state.bucket);
  const targetFileName = state.targetFileName;
  const [
    targetFileExists,
  ] = await bucket
    .file(targetFileName)
    .exists()
    .catch((error) => {
      core.error('Failed to check if the file already exists');

      throw error;
    });

  core.debug(`Target file name: ${targetFileName}.`);

  if (targetFileExists) {
    console.log(
      '🌀 Skipping uploading cache as it already exists (probably due to another job).',
    );
    return;
  }

  // eslint-disable-next-line node/no-process-env
  const workspace = process.env.GITHUB_WORKSPACE ?? process.cwd();

  const globber = await glob.create(state.paths.join('\n'), {
    implicitDescendants: false,
  });

  const paths = await globber
    .glob()
    .then((files) => {
      return files.map((file) => {
        return path.relative(workspace, file);
      });
    });

  core.debug(`Paths: ${JSON.stringify(paths)}.`);

  await withTemporaryFile(async (temporaryFile) => {
    const compressionMethod = await core
      .group('🗜️ Creating cache archive', () => {
        return createTar(temporaryFile.path, paths, workspace);
      })
      .catch((error) => {
        core.error('Failed to create the archive');
        throw error;
      });

    const customMetadata: CacheActionMetadata = {
      'cache-action-compression-method': compressionMethod,
    };

    core.debug(`Metadata: ${JSON.stringify(customMetadata)}.`);

    await core
      .group('🌐 Uploading cache archive to bucket', async () => {
        console.log(`🔹 Uploading file '${targetFileName}'...`);

        await bucket.upload(temporaryFile.path, {
          destination: targetFileName,
          metadata: {
            metadata: customMetadata,
          },
        });
      })
      .catch((error) => {
        core.error('Failed to upload the file');
        throw error;
      });

    console.log('✅ Successfully saved cache.');
  });
};

void main()
  .catch((error) => {
    core.setFailed(error);
  });
