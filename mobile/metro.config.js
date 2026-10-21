const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "@revenuecat/purchases-js-hybrid-mappings") {
    return {
      filePath: path.resolve(
        __dirname,
        "node_modules/@revenuecat/purchases-js-hybrid-mappings/dist/index.umd.js"
      ),
      type: "sourceFile",
    };
  }
  if (moduleName === "@revenuecat/purchases-js") {
    return {
      filePath: path.resolve(
        __dirname,
        "node_modules/@revenuecat/purchases-js/dist/Purchases.umd.js"
      ),
      type: "sourceFile",
    };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
