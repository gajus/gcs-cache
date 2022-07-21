import * as core from '@actions/core';
import {
  type Inputs,
} from './types';

export const getInputs = (): Inputs => {
  const inputs = {
    bucket: core.getInput('bucket', {
      required: true,
    }),
    key: core.getInput('key', {
      required: true,
    }),
    paths: core.getInput('paths', {
      required: true,
    })
      .split(/\n/u)
      .map((path) => {
        return path.trim();
      }),
  };

  core.debug(`Loaded inputs: ${JSON.stringify(inputs)}.`);

  return inputs;
};
