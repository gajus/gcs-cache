import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/main.ts',
  output: {
    format: 'cjs'
  },
  plugins: [typescript(),commonjs()]
};