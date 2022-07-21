import * as core from '@actions/core';
import {
  type State,
} from './types';

export const saveState = (state: State): void => {
  core.debug(`Saving state: ${JSON.stringify(state)}.`);

  core.saveState('BUCKET', state.bucket);
  core.saveState('PATHS', state.paths);
  core.saveState('CACHE_HIT_KIND', state.cacheHitKind);
  core.saveState('TARGET_FILE_NAME', state.targetFileName);
};
