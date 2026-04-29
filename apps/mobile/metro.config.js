const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

/**
 * Metro configuration for Turborepo monorepo
 * Watches the shared package and resolves it correctly
 */
const config = {
  watchFolders: [monorepoRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(monorepoRoot, 'node_modules'),
    ],
    // Resolve @talent-casting/shared to its compiled dist
    extraNodeModules: {
      '@talent-casting/shared': path.resolve(monorepoRoot, 'packages/shared/dist'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
