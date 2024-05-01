import EventEmitter from 'eventemitter3';
import hasWindow from '../utils/has_window';
import instances from './instances';
import logger from './logger';

const debug = logger('quill:events');
const EVENTS = ['selectionchange', 'mousedown', 'mouseup', 'click'];
if (hasWindow()) {
  EVENTS.forEach((eventName) => {
    document.addEventListener(eventName, (...args) => {
      const event = args[0];
      const shadowRoot = event?.target?.shadowRoot;
      const root = shadowRoot ?? document;
      const quillContainers = root.querySelectorAll('.ql-container');

      Array.from(quillContainers).forEach((node) => {
        const quill = instances.get(node);
        if (quill && quill.emitter) {
          quill.emitter.handleDOM(...args);
        }
      });
    });
  });
}

class Emitter extends EventEmitter {
  constructor() {
    super();
    this.listeners = {};
    this.on('error', debug.error);
  }

  emit(...args) {
    debug.log.call(debug, ...args);
    super.emit(...args);
  }

  handleDOM(event, ...args) {
    (this.listeners[event.type] || []).forEach(({ node, handler }) => {
      if (event.target === node || node.contains(event.target)) {
        handler(event, ...args);
      }
    });
  }

  listenDOM(eventName, node, handler) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push({ node, handler });
  }
}

Emitter.events = {
  EDITOR_CHANGE: 'editor-change',
  SCROLL_BEFORE_UPDATE: 'scroll-before-update',
  SCROLL_BLOT_MOUNT: 'scroll-blot-mount',
  SCROLL_BLOT_UNMOUNT: 'scroll-blot-unmount',
  SCROLL_OPTIMIZE: 'scroll-optimize',
  SCROLL_UPDATE: 'scroll-update',
  SELECTION_CHANGE: 'selection-change',
  TEXT_CHANGE: 'text-change',
  CONTENT_SETTED: 'content-setted',
  COMPOSITION_BEFORE_START: 'composition-before-start',
  COMPOSITION_START: 'composition-start',
  COMPOSITION_BEFORE_END: 'composition-before-end',
  COMPOSITION_END: 'composition-end',
};
Emitter.sources = {
  API: 'api',
  SILENT: 'silent',
  USER: 'user',
};

export default Emitter;
