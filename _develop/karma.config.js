const browsers = require('./browsers');

module.exports = (config) => {
  config.set({
    basePath: '../',
    urlRoot: '/karma/',
    port: process.env.npm_package_config_ports_karma,

    files: [
      {
        pattern:
          'http://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.7.1/katex.min.js',
        served: true,
      },
      { pattern: 'dist/dx-quill.snow.css', nocache: true },
      { pattern: 'dist/dx-unit.js', nocache: true },
      {
        pattern: 'dist/*.map', included: false, served: true, nocache: true,
      },
      { pattern: 'assets/favicon.png', included: false, served: true },
    ],
    proxies: {
      '/assets/': '/karma/base/assets/',
    },

    frameworks: ['jasmine'],
    reporters: ['progress'],
    colors: true,
    autoWatch: false,
    singleRun: true,
    browsers: ['Chrome'],

    client: {
      useIframe: true,
    },

    coverageReporter: {
      dir: '.coverage',
      reporters: [{ type: 'text' }, { type: 'html' }],
    },
    customLaunchers: browsers,
  });
};
