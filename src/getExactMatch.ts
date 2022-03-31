import * as core from '@actions/core';
import * as github from '@actions/github';
import type {
  File,
  Bucket,
} from '@google-cloud/storage';

export const getExactMatch = async (
  bucket: Bucket,
  key: string,
): Promise<File | null> => {
  const folderPrefix = `${github.context.repo.owner}/${github.context.repo.repo}`;

  core.debug(`Looking up ${folderPrefix}/${key}.tar`);

  const exactFile = bucket.file(`${folderPrefix}/${key}.tar`);

  let exactFileExists: boolean;

  try {
    console.log('>>>', await exactFile.exists());

    exactFileExists = await exactFile.exists()?.[0];
  } catch (error) {
    core.error('Failed to check if an exact match exists');

    throw error;
  }

  core.debug(`Exact file name: ${exactFile.name}.`);

  if (exactFileExists) {
    console.log(`🙌 Found exact match from cache for key '${key}'.`);

    return exactFile;
  } else {
    console.log(`🔸 No exact match found for key '${key}'.`);

    return null;
  }
};
