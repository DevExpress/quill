import { existsSync, mkdirSync, cpSync } from 'fs';
import { join } from 'path';

const DEVEXTREME_PATH = '../DevExtreme';
const PLAYGROUND_PATH = './playground';
const DEVEXTREME_ARTIFACTS_PATH = '../DevExtreme/packages/devextreme/artifacts';

const ARTIFACTS_JS_PATH = join(DEVEXTREME_ARTIFACTS_PATH, 'js');
const ARTIFACTS_CSS_PATH = join(DEVEXTREME_ARTIFACTS_PATH, 'css');
const PLAYGROUND_JS_PATH = join(PLAYGROUND_PATH, 'js');
const PLAYGROUND_CSS_PATH = join(PLAYGROUND_PATH, 'css');

function prepareFolders() {
  [PLAYGROUND_CSS_PATH, PLAYGROUND_JS_PATH].forEach((folder) => {
    if (!existsSync(folder)) {
      mkdirSync(folder);
    }
  });
}

function copyJsFiles() {
  cpSync(ARTIFACTS_JS_PATH, PLAYGROUND_JS_PATH, { recursive: true });
}

function copyCssFiles() {
  cpSync(ARTIFACTS_CSS_PATH, PLAYGROUND_CSS_PATH, { recursive: true });
}

(() => {
  if (existsSync(DEVEXTREME_PATH)) {
    prepareFolders();
    copyJsFiles();
    copyCssFiles();
    console.log('Playground is ready');
  } else {
    console.log('DevExtreme folder was not found');
  }
})();
