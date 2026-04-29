module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@talent-casting/shared': '../../packages/shared/src',
        },
      },
    ],
  ],
};
