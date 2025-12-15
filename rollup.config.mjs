import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { dts } from "rollup-plugin-dts";

const input = "cspf/index.ts";
const externalDependencies = ["@ipld/dag-cbor", "multiformats", "zod", "tslib"];

const createTsPlugin = (compilerOptions = {}) =>
  typescript({
    tsconfig: "./tsconfig.json",
    compilerOptions,
  });

export default [
  {
    input,
    external: externalDependencies,
    output: {
      file: "dist/index.cjs",
      format: "cjs",
      sourcemap: true,
      exports: "named",
    },
    plugins: [
      resolve({ browser: false, preferBuiltins: true }),
      commonjs(),
      createTsPlugin(),
    ],
  },
  {
    input,
    external: externalDependencies,
    output: {
      file: "dist/index.mjs",
      format: "esm",
      sourcemap: true,
    },
    plugins: [
      resolve({ browser: true, preferBuiltins: false }),
      commonjs(),
      createTsPlugin({ declaration: false, declarationDir: undefined }),
    ],
  },
  {
    // input: "./my-input/index.d.ts",
    input,
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
];
