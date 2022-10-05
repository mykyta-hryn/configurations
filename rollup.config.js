import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import url from '@rollup/plugin-url';
import glob from 'glob';
import del from 'rollup-plugin-delete';

const jsConfig = {
  input: glob.sync('src/index.js'),
  output: [
    {
      dir: 'dist/cjs',
      format: 'cjs',
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    {
      dir: 'dist/esm',
      format: 'es',
      preserveModules: true,
      preserveModulesRoot: 'src'
    }
  ],
  preserveEntrySignatures: 'allow-extension',
  plugins: [
    del({ targets: 'dist/*' }),
    nodeResolve(),
    commonjs({
      include: /node_modules/
    }),
    url(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**'
    })
  ]
};

export default [jsConfig];
