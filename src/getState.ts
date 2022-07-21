import * as core from '@actions/core';
import {
  type State,
  type CacheHitKindState,
} from './types';

export const getState = (): State => {
  if (!core.getState('BUCKET')) {
    throw new Error('"BUCKET" state must be set.');
  }

  if (!core.getState('CACHE_HIT_KIND')) {
    throw new Error('"CACHE_HIT_KIND" state must be set.');
  }

  if (!core.getState('PATHS')) {
    throw new Error('"PATHS" state must be set.');
  }

  if (!core.getState('TARGET_FILE_NAME')) {
    throw new Error('"TARGET_FILE_NAME" state must be set.');
  }

  const state = {
    bucket: core.getState('BUCKET'),
    cacheHitKind: core.getState('CACHE_HIT_KIND') as CacheHitKindState,
    paths: JSON.parse(core.getState('PATHS')) as readonly string[],
    targetFileName: core.getState('TARGET_FILE_NAME'),
  };

  core.debug(`Loaded state: ${JSON.stringify(state)}.`);

  return state;
};
