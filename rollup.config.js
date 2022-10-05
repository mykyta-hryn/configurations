import path from 'path';

import alias from '@rollup/plugin-alias';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import url from '@rollup/plugin-url';
import svgr from '@svgr/rollup';
import glob from 'glob';
import del from 'rollup-plugin-delete';
import ignoreImport from 'rollup-plugin-ignore-import';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

const jsConfig = {
  input: glob.sync('src/**/index.js'),
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
    ignoreImport({
      extensions: ['.css']
    }),
    peerDepsExternal(),
    alias({
      entries: {
        '@basics': path.resolve('./src/basics'),
        '@components': path.resolve('./src/components'),
        '@lib': path.resolve('./src/lib'),
        '@assets': path.resolve('./src/assets')
      }
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: ['@babel/preset-react']
    }),
    commonjs({
      include: /node_modules/
    }),
    nodeResolve(),
    url(),
    svgr({
      icon: true,
      titleProp: true,
      exportType: 'default'
    })
  ]
};

export default [jsConfig];
