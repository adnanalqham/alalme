module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@': './src',
          api: '../api',
          types: '../types',
          constants: '../constants',
        },
      },
    ],
  ],
};