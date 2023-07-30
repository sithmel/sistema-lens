const { nodeResolve } = require("@rollup/plugin-node-resolve");

module.exports = {
  input: "src/client/index.js",
  output: {
    file: "build/lens.js",
    format: "iife",
  },
  plugins: [nodeResolve()],
};
