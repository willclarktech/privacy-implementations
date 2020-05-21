import common from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

export default {
	input: "build/index.js",
	output: {
		file: "dist/index.js",
		sourcemap: false,
		format: "umd",
		name: "psiCardinality",
	},
	plugins: [common(), json(), resolve({ preferBuiltins: true }), terser()],
};
