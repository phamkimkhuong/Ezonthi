const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getSentryExpoConfig(projectRoot);

// Watch all files in the repo so we can import shared math data from ../src/data
config.watchFolders = [workspaceRoot];

// Let Metro know where to look for node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules')
];

module.exports = withNativeWind(config, { input: './global.css' });
