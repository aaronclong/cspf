import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

const input = 'index.ts';
const externalDependencies = ['@ipld/dag-cbor', 'multiformats', 'zod'];

const createTsPlugin = (compilerOptions = {}) =>
  typescript({
    tsconfig: './tsconfig.json',
    compilerOptions
  });

export default [
  {
    input,
    external: externalDependencies,
    output: {
      file: 'dist/cspf.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      resolve({ browser: false, preferBuiltins: true }),
      commonjs(),
      createTsPlugin()
    ]
  },
  {
    input,
    external: externalDependencies,
    output: {
      file: 'dist/cspf.mjs',
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      resolve({ browser: true, preferBuiltins: false }),
      commonjs(),
      createTsPlugin({ declaration: false, declarationDir: undefined })
    ]
  }
];
