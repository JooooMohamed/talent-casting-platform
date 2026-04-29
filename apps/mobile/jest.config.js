module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|webp)$': '<rootDir>/__mocks__/fileMock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|@react-navigation|react-native-image-picker|react-native-video|@react-native-async-storage)/)',
  ],
};
