import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

export default {
  input: 'src/main.ts',
  output: {
    format: 'cjs'
  },
  plugins: [typescript(),nodeResolve(),json(),commonjs()]
};