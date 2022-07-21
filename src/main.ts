import * as core from '@actions/core';
import * as github from '@actions/github';
import {
  Storage,
} from '@google-cloud/storage';
import {
  withFile as withTemporaryFile,
} from 'tmp-promise';
import {
  extractTar,
} from './extractTar';
import {
  getExactMatch,
} from './getExactMatch';
import {
  getInputs,
} from './getInputs';
import {
  saveState,
} from './saveState';
import {
  type ObjectMetadata,
} from './types';

const main = async () => {
  const inputs = getInputs();
  const bucket = new Storage().bucket(inputs.bucket);

  const folderPrefix = `${github.context.repo.owner}/${github.context.repo.repo}`;
  const exactFileName = `${folderPrefix}/${inputs.key}.tar`;

  const bestMatch = await core.group(
    '🔍 Searching the best cache archive available',
    () => {
      return getExactMatch(bucket, inputs.key);
    },
  );

  core.debug(`Best match kind: ${bestMatch}.`);

  if (!bestMatch) {
    saveState({
      bucket: inputs.bucket,
      cacheHitKind: 'none',
      paths: inputs.paths,
      targetFileName: exactFileName,
    });
    core.setOutput('cache-hit', 'false');
    console.log('😢 No cache candidate found.');
    return;
  }

  core.debug(`Best match name: ${bestMatch.name}.`);

  const bestMatchMetadata = await bestMatch
    .getMetadata()
    .then(([
      metadata,
    ]) => {
      return metadata as ObjectMetadata;
    })
    .catch((error) => {
      core.error('Failed to read object metadata');
      throw error;
    });

  core.debug(`Best match metadata: ${JSON.stringify(bestMatchMetadata)}.`);

  const compressionMethod = bestMatchMetadata.metadata['cache-action-compression-method'];

  core.debug(`Best match compression method: ${compressionMethod}.`);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!bestMatchMetadata || !compressionMethod) {
    saveState({
      bucket: inputs.bucket,
      cacheHitKind: 'none',
      paths: inputs.paths,
      targetFileName: exactFileName,
    });

    core.setOutput('cache-hit', 'false');
    core.info('😢 No cache candidate found (missing metadata).');

    return;
  }

  // eslint-disable-next-line node/no-process-env
  const workspace = process.env.GITHUB_WORKSPACE ?? process.cwd();

  await withTemporaryFile(async (temporaryFile) => {
    try {
      await core
        .group('🌐 Downloading cache archive from bucket', async () => {
          console.log(`🔹 Downloading file '${bestMatch.name}'...`);

          await bestMatch.download({
            destination: temporaryFile.path,
          });
        });
    } catch (error) {
      core.error('Failed to download the file');

      throw error;
    }

    try {
      await core
        .group('🗜️ Extracting cache archive', () => {
          core.info(
            `🔹 Detected '${compressionMethod}' compression method from object metadata.`,
          );

          return extractTar(temporaryFile.path, compressionMethod, workspace);
        });
    } catch (error) {
      core.error('Failed to extract the archive');

      throw error;
    }

    saveState({
      bucket: inputs.bucket,
      cacheHitKind: 'exact',
      paths: inputs.paths,
      targetFileName: exactFileName,
    });

    core.setOutput('cache-hit', 'true');

    console.log('✅ Successfully restored cache.');
  });
};

void main()
  .catch((error) => {
    core.setFailed(error.message);
  });
