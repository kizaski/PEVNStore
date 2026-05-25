module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    ["@babel/preset-typescript", { allExtensions: true }],
  ],
  plugins: ["babel-plugin-transform-vite-meta-env"],
};
