/* eslint-disable no-undef */
/* eslint-env node */

const createTestCafe = require('testcafe');
const process = require('process');
const parseArgs = require('minimist');
require('nconf').argv();

let testCafe;
createTestCafe({
  hostname: 'localhost',
  port1: 1437,
  port2: 1438,
})
  .then((tc) => {
    testCafe = tc;

    const args = getArgs();
    const testName = args.test.trim();
    const reporter = typeof args.reporter === 'string' ? args.reporter.trim() : args.reporter;
    const indices = args.indices.trim();
    const file = args.file.trim();

    setTestingPlatform(args);

    const browsers = args.browsers.split(' ').map(expandBrowserAlias);
    // eslint-disable-next-line no-console
    console.log('Browsers:', browsers);

    const runner = testCafe.createRunner()
      .browsers(browsers)
      .reporter(reporter)
      .src([`./test/functional/${file}.ts`]);

    runner.compilerOptions({
      typescript: {
        customCompilerModulePath: './node_modules/typescript',
      },
    });

    runner.concurrency(args.concurrency || 3);

    const filters = [];
    if (indices) {
      const [current, total] = indices.split(/_|of|\\|\//ig).map((x) => +x);
      let testIndex = 0;
      filters.push(() => {
        const result = (testIndex % total) === (current - 1);
        testIndex += 1;
        return result;
      });
    }
    if (testName) {
      filters.push((name) => name === testName);
    }
    if (filters.length) {
      runner.filter((...params) => {
        for (let i = 0; i < filters.length; i + 1) {
          if (!filters[i](...params)) {
            return false;
          }
        }
        return true;
      });
    }
    if (args.cache) {
      runner.cache = args.cache;
    }

    return runner.run();
  })
  .then((failedCount) => {
    testCafe.close();
    process.exit(failedCount);
  });

function setTestingPlatform(args) {
  process.env.platform = args.platform;
}

function expandBrowserAlias(browser) {
  switch (browser) {
    case 'chrome:devextreme-shr2':
      return 'chrome:headless --disable-gpu --window-size=1200,800';
    case 'chrome:docker':
      return 'chromium:headless --no-sandbox --disable-gpu --window-size=1200,800';
    default:
      return browser;
  }
}

function getArgs() {
  return parseArgs(process.argv.slice(1), {
    default: {
      concurrency: 0,
      browsers: 'chrome',
      test: '',
      reporter: [process.env.CI === 'true' ? 'list' : 'minimal'],
      file: '*',
      cache: true,
      quarantineMode: false,
      indices: '',
      platform: '',
    },
  });
}
