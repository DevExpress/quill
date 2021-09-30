const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const pkg = require('../package.json');

const bannerPack = new webpack.BannerPlugin({
  banner: [
    `DevExtreme-Quill Editor v.${pkg.version}`,
    'https://js.devexpress.com/',
    'Copyright (c) 2020, Developer Express Inc.',
    'Copyright (c) 2017, Slab',
    'Copyright (c) 2014, Jason Chen',
    'Copyright (c) 2013, salesforce.com',
  ].join('\n'),
  entryOnly: true,
});
const constantPack = new webpack.DefinePlugin({
  QUILL_VERSION: JSON.stringify(pkg.version),
});

const source = [
  'quill.js',
  'core.js',
  'attributors',
  'blots',
  'core',
  'formats',
  'modules',
  'test',
  'themes',
  'utils',
].map(file => {
  return path.resolve(__dirname, '..', file);
});

const babelLoader = {
  loader: 'babel-loader',
  options: {
    presets: [
      [
        '@babel/env',
        {
          targets: {
            browsers: ['last 2 versions', 'ios > 8', 'ie > 10', '> 1%'],
          },
        },
      ],
    ],
  },
};

const jsRules = {
  test: /\.js$/,
  include: source,
  use: [babelLoader],
};

const stylRules = {
  test: /\.styl$/,
  include: [path.resolve(__dirname, '../assets')],
  use: [MiniCssExtractPlugin.loader, 'css-loader', 'stylus-loader'],
};

const tsRules = {
  test: /\.ts$/,
  use: [
    babelLoader,
    {
      loader: 'ts-loader',
      options: {
        compilerOptions: {
          declaration: false,
          module: 'es6',
          target: 'es5',
          sourceMap: true,
        },
        transpileOnly: true,
      },
    },
  ],
};

const sourceMapRules = {
  test: /\.js$/,
  enforce: 'pre',
  use: ['source-map-loader'],
};

const baseConfig = {
  mode: 'development',
  context: path.resolve(__dirname, '..'),
  entry: {
    'quill.js': ['./quill.js'],
    'quill.core.js': ['./core.js'],
    'quill.core': './assets/core.styl',
    'quill.bubble': './assets/bubble.styl',
    'quill.snow': './assets/snow.styl',
    'unit.js': './test/unit.js',
  },
  output: {
    filename: 'dx-[name]',
    library: ['DevExpress', 'Quill'],
    libraryExport: 'default',
    libraryTarget: 'umd',
    globalObject: 'this',
    path: path.resolve(__dirname, '../dist/'),
  },
  resolve: {
    alias: {
      parchment: path.resolve(
        __dirname,
        '../node_modules/parchment/src/parchment',
      ),
    },
    extensions: ['.js', '.styl', '.ts'],
  },
  module: {
    rules: [jsRules, stylRules, tsRules, sourceMapRules],
    noParse: [
      /\/node_modules\/clone\/clone\.js$/,
      /\/node_modules\/eventemitter3\/index\.js$/,
      /\/node_modules\/extend\/index\.js$/,
    ],
  },
  plugins: [
    bannerPack,
    constantPack,
    new MiniCssExtractPlugin({
      filename: 'dx-[name].css',
    }),
  ],
};

module.exports = env => {
  if (env && env.production) {
    const { entry, ...prodConfig } = baseConfig;
    return {
      ...prodConfig,
      mode: 'production',
      entry: {
        ...entry,
        'quill.min.js': './quill.js',
      },
      optimization: {
        minimize: true,
        minimizer: [
          new TerserPlugin({
            test: /\.min\.js$/,
          }),
        ],
      },
      devtool: '',
    };
  }

  if (env && env.coverage) {
    baseConfig.module.rules[0].use[0].options.plugins = ['istanbul'];
    return baseConfig;
  }

  return baseConfig;
};
