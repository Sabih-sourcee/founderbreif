const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Use Babel (not Hermes parser) so private class fields in RN sources are transpiled.
config.transformer.hermesParser = false;

module.exports = config;
