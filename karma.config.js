/* eslint-disable */
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
process.env.CHROME_BIN = require('puppeteer').executablePath();

const NODE_ENV = process.env.NODE_ENV;
const mode = (NODE_ENV && NODE_ENV.trim() === 'production') ? 'production' : 'development';

let coverageReporter = {
  type: 'html',
};

/**
 * SCSS configs
 */
const sass = {
  loader: 'sass-loader',
};

const css = {
  loader: 'css-loader',
};

const style = {
  loader: 'style-loader',
};

const postcss = {
  loader: 'postcss-loader',
  options: {
    plugins: () => [
      autoprefixer('last 3 versions', 'ie 10'),
      cssnano(),
    ],
  },
};

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['mocha'],
    files: [
      { pattern: 'test-context.js', watched: false },
    ],
    exclude: [
    ],
    preprocessors: {
      'test-context.js': ['webpack', 'sourcemap'],
      'src/**/*.js': ['coverage'],
    },
    webpack: {
      mode,
      devtool: 'inline-source-map',
      module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'babel-loader',
                options: {
                  presets: [
                    ['@babel/preset-env', {
                      targets: {
                        browsers: ['last 2 versions', 'safari >= 7'],
                      },
                    }],
                  ],
                  plugins: [
                    ['@babel/plugin-transform-async-to-generator'],
                    ['@babel/plugin-proposal-class-properties', { loose: false }],
                    ['@babel/plugin-transform-react-jsx', {
                      pragma: 'h',
                    }],
                    ['@babel/plugin-transform-runtime', {
                      corejs: false,
                      helpers: true,
                      regenerator: true,
                      useESModules: false,
                    }],
                    ['istanbul'],
                  ],
                },
              },
            ],
          },

          {
            test: /\.scss/,
            use: [style, css, postcss, sass],
          },

          {
            test: /\.(jpe?g|png|gif|svg)/,
            use: [
              {
                loader: 'file-loader',
                options: {
                  name: 'widget-assets/[name].[hash].[ext]',
                },
              },
              {
                loader: 'image-webpack-loader',
                options: {
                  disable: mode !== 'production',
                },
              },
            ],
          },

          {
            test: /\.(html)$/,
            use: {
              loader: 'html-loader',
              options: {
                minimize: mode === 'production',
              },
            },
          },
        ],
      },
      plugins: [],
      watch: true,
      resolve: {
        extensions: ['.js', '.jsx'],
        modules: [
          'node_modules',
        ],
        alias: {
          react: 'preact-compat',
          'react-dom': 'preact-compat',
          // Not necessary unless you consume a module using `createClass`
          'create-react-class': 'preact-compat/lib/create-react-class',
          // Not necessary unless you consume a module requiring `react-dom-factories`
          'react-dom-factories': 'preact-compat/lib/react-dom-factories',
        },
      },
    },
    webpackServer: {
      noInfo: true
    },
    reporters: ['spec', 'coverage'],
    coverageReporter,
    port: 9876,
    colors: true,
    logLevel: config.LOG_DEBUG,
    client: {
      captureConsole: true,
      jasmine: {
        random: false,
        DEFAULT_TIMEOUT_INTERVAL: 60000,
      },
    },
    autoWatch: true,
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
        ],
      }
    },
    browserNoActivityTimeout: 60000,
    singleRun: false,
    concurrency: Infinity
  })
}
