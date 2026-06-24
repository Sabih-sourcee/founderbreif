module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          // Transpile modern syntax (including private fields) for device Hermes.
          unstable_transformProfile: "default",
        },
      ],
    ],
  };
};
