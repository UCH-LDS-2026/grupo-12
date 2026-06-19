// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add 'wasm' to the existing extensions
config.resolver.assetExts.push('wasm');
config.resolver.sourceExts.push('wasm');

module.exports = withNativeWind(config, { input: './global.css' })
