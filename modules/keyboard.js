import cloneDeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';
import Delta, { AttributeMap } from 'quill-delta';
import { EmbedBlot, Scope, TextBlot } from 'parchment';
import Quill from '../core/quill';
import logger from '../core/logger';
import Module from '../core/module';
import hasWindow from '../utils/has_window';
import getScrollConfig from '../utils/get_scroll_into_view_config';

const debug = logger('quill:keyboard');

const KEY_NAMES = {
  backspace: 'backspace',
  tab: 'tab',
  enter: 'enter',
  escape: 'escape',
  pageup: 'pageUp',
  pagedown: 'pageDown',
  end: 'end',
  home: 'home',
  arrowleft: 'leftArrow',
  arrowup: 'upArrow',
  arrowright: 'rightArrow',
  arrowdown: 'downArrow',
  delete: 'del',
  ' ': 'space',
  '*': 'asterisk',
  '-': 'minus',
  alt: 'alt',
  control: 'control',
  shift: 'shift',
  // IE11:
  left: 'leftArrow',
  up: 'upArrow',
  right: 'rightArrow',
  down: 'downArrow',
  multiply: 'asterisk',
  spacebar: 'space',
  del: 'del',
  subtract: 'minus',
  esc: 'escape',
};

const KEY_CODES = {
  // iOS 10.2 and lower didn't supports KeyboardEvent.key
  '8': 'backspace',
  '9': 'tab',
  '13': 'enter',
  '27': 'escape',
  '33': 'pageUp',
  '34': 'pageDown',
  '35': 'end',
  '36': 'home',
  '37': 'leftArrow',
  '38': 'upArrow',
  '39': 'rightArrow',
  '40': 'downArrow',
  '46': 'del',
  '32': 'space',
  '106': 'asterisk',
  '109': 'minus',
  '189': 'minus',
  '173': 'minus',
  '16': 'shift',
  '17': 'control',
  '18': 'alt',
};

const SHORTKEY =
  hasWindow() && /Mac/i.test(navigator.platform) ? 'metaKey' : 'ctrlKey';

class Keyboard extends Module {
  static match(evt, binding) {
    if (
      ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'].some(key => {
        return !!binding[key] !== evt[key] && binding[key] !== null;
      })
    ) {
      return false;
    }
    return (
      binding.key === Keyboard.normalizeKeyName(evt) ||
      binding.key === evt.which
    );
  }

  static normalizeKeyName({ key, which }) {
    const isKeySupported = !!key;

    let normalizedKey = isKeySupported ? key : which;

    if (normalizedKey) {
      if (isKeySupported) {
        normalizedKey = KEY_NAMES[normalizedKey.toLowerCase()] || normalizedKey;
      } else {
        normalizedKey =
          KEY_CODES[normalizedKey] || String.fromCharCode(normalizedKey);
      }
    }

    return normalizedKey;
  }

  constructor(quill, options) {
    super(quill, options);
    this.bindings = {};
    Object.keys(this.options.bindings).forEach(name => {
      if (this.options.bindings[name]) {
        this.addBinding(this.options.bindings[name]);
      }
    });

    this.addInternalBindings();

    this.listen();
  }

  addInternalBindings() {
    this.quill.once(Quill.events.CONTENT_SETTED, () => {
      this.addBinding({ key: 'enter', shiftKey: null }, this.handleEnter);
      this.addBinding(
        { key: 'enter', metaKey: null, ctrlKey: null, altKey: null },
        () => {},
      );
      if (hasWindow() && /Firefox/i.test(navigator.userAgent)) {
        // Need to handle delete and backspace for Firefox in the general case #1171
        this.addBinding(
          { key: 'backspace' },
          { collapsed: true },
          this.handleBackspace,
        );
        this.addBinding({ key: 'del' }, { collapsed: true }, this.handleDelete);
      } else {
        this.addBinding(
          { key: 'backspace' },
          { collapsed: true, prefix: /^.?$/ },
          this.handleBackspace,
        );
        this.addBinding(
          { key: 'del' },
          { collapsed: true, suffix: /^.?$/ },
          this.handleDelete,
        );
      }
      this.addBinding(
        { key: 'backspace' },
        { collapsed: false },
        this.handleDeleteRange,
      );
      this.addBinding(
        { key: 'del' },
        { collapsed: false },
        this.handleDeleteRange,
      );
      this.addBinding(
        {
          key: 'backspace',
          altKey: null,
          ctrlKey: null,
          metaKey: null,
          shiftKey: null,
        },
        { collapsed: true, offset: 0 },
        this.handleBackspace,
      );
    });
  }

  addBinding(keyBinding, context = {}, handler = {}) {
    const binding = normalize(keyBinding);
    if (binding == null) {
      debug.warn('Attempted to add invalid keyboard binding', binding);
      return;
    }
    if (typeof context === 'function') {
      context = { handler: context };
    }
    if (typeof handler === 'function') {
      handler = { handler };
    }

    const keyPropery = binding.which ? 'which' : 'key';
    const keys = Array.isArray(binding[keyPropery])
      ? binding[keyPropery]
      : [binding[keyPropery]];

    keys.forEach(key => {
      const singleBinding = {
        ...binding,
        key,
        ...context,
        ...handler,
      };
      this.bindings[singleBinding.key] = this.bindings[singleBinding.key] || [];
      this.bindings[singleBinding.key].push(singleBinding);
    });
  }

  listen() {
    this.quill.root.addEventListener('keydown', evt => {
      if (evt.defaultPrevented || evt.isComposing) return;
      this.raiseOnKeydownCallback(evt);
      const keyName = Keyboard.normalizeKeyName(evt);
      const bindings = (this.bindings[keyName] || []).concat(
        this.bindings[evt.which] || [],
      );
      const matches = bindings.filter(binding => Keyboard.match(evt, binding));
      if (matches.length === 0) return;
      const range = this.quill.getSelection();
      if (range == null || !this.quill.hasFocus()) return;
      const [line, offset] = this.quill.getLine(range.index);
      const [leafStart, offsetStart] = this.quill.getLeaf(range.index);
      const [leafEnd, offsetEnd] =
        range.length === 0
          ? [leafStart, offsetStart]
          : this.quill.getLeaf(range.index + range.length);
      const prefixText =
        leafStart instanceof TextBlot
          ? leafStart.value().slice(0, offsetStart)
          : '';
      const suffixText =
        leafEnd instanceof TextBlot ? leafEnd.value().slice(offsetEnd) : '';
      const curContext = {
        collapsed: range.length === 0,
        empty: range.length === 0 && line.length() <= 1,
        format: this.quill.getFormat(range),
        line,
        offset,
        prefix: prefixText,
        suffix: suffixText,
        event: evt,
      };

      let prevented = false;

      matches.some(binding => {
        if (
          binding.collapsed != null &&
          binding.collapsed !== curContext.collapsed
        ) {
          return false;
        }
        if (binding.empty != null && binding.empty !== curContext.empty) {
          return false;
        }
        if (binding.offset != null && binding.offset !== curContext.offset) {
          return false;
        }
        if (Array.isArray(binding.format)) {
          // any format is present
          if (binding.format.every(name => curContext.format[name] == null)) {
            return false;
          }
        } else if (typeof binding.format === 'object') {
          // all formats must match
          if (
            !Object.keys(binding.format).every(name => {
              if (binding.format[name] === true)
                return curContext.format[name] != null;
              if (binding.format[name] === false)
                return curContext.format[name] == null;
              return isEqual(binding.format[name], curContext.format[name]);
            })
          ) {
            return false;
          }
        }
        if (binding.prefix != null && !binding.prefix.test(curContext.prefix)) {
          return false;
        }
        if (binding.suffix != null && !binding.suffix.test(curContext.suffix)) {
          return false;
        }

        const handlerResult = binding.handler.call(
          this,
          range,
          curContext,
          binding,
        );
        const preventAfterAllMatches = handlerResult?.preventAfterAllMatches;

        prevented = handlerResult !== true || preventAfterAllMatches;

        return prevented && !preventAfterAllMatches;
      });

      if (prevented) {
        evt.preventDefault();
      }
    });
  }

  raiseOnKeydownCallback(event) {
    const callback = this.options.onKeydown;

    if (callback && typeof callback === 'function') {
      callback(event);
    }
  }

  handleBackspace(range, context) {
    // Check for astral symbols
    const length = /[\uD800-\uDBFF][\uDC00-\uDFFF]$/.test(context.prefix)
      ? 2
      : 1;
    if (range.index === 0 || this.quill.getLength() <= 1) return;
    let formats = {};
    const [line] = this.quill.getLine(range.index);
    let delta = new Delta().retain(range.index - length).delete(length);
    if (context.offset === 0) {
      // Always deleting newline here, length always 1
      const [prev] = this.quill.getLine(range.index - 1);
      if (prev) {
        const isPrevLineEmpty =
          prev.statics.blotName === 'block' && prev.length() <= 1;
        if (!isPrevLineEmpty) {
          const curFormats = line.formats();
          const prevFormats = this.quill.getFormat(range.index - 1, 1);
          formats = AttributeMap.diff(curFormats, prevFormats) || {};
          if (Object.keys(formats).length > 0) {
            // line.length() - 1 targets \n in line, another -1 for newline being deleted
            const formatDelta = new Delta()
              .retain(range.index + line.length() - 2)
              .retain(1, formats);
            delta = delta.compose(formatDelta);
          }
        }
      }
    }
    this.quill.updateContents(delta, Quill.sources.USER);
    this.quill.focus();
  }

  handleDelete(range, context) {
    // Check for astral symbols
    const length = /^[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(context.suffix)
      ? 2
      : 1;
    if (range.index >= this.quill.getLength() - length) return;
    let formats = {};
    const [line] = this.quill.getLine(range.index);
    let delta = new Delta().retain(range.index).delete(length);
    if (context.offset >= line.length() - 1) {
      const [next] = this.quill.getLine(range.index + 1);
      if (next) {
        const curFormats = line.formats();
        const nextFormats = this.quill.getFormat(range.index, 1);
        formats = AttributeMap.diff(curFormats, nextFormats) || {};
        if (Object.keys(formats).length > 0) {
          delta = delta.retain(next.length() - 1).retain(1, formats);
        }
      }
    }
    this.quill.updateContents(delta, Quill.sources.USER);
    this.quill.focus();
  }

  handleDeleteRange(range, context) {
    this.raiseOnKeydownCallback(context.event);
    deleteRange({ range, quill: this.quill });
    this.quill.focus();
  }

  handleEnter(range, context) {
    const lineFormats = Object.keys(context.format).reduce(
      (formats, format) => {
        if (
          this.quill.scroll.query(format, Scope.BLOCK) &&
          !Array.isArray(context.format[format])
        ) {
          formats[format] = context.format[format];
        }
        return formats;
      },
      {},
    );
    const delta = new Delta()
      .retain(range.index)
      .delete(range.length)
      .insert('\n', lineFormats);
    this.quill.updateContents(delta, Quill.sources.USER);
    this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
    this.quill.focus();

    const [line] = this.quill.getLine(range.index + 1);
    const scrollConfig = getScrollConfig(line.domNode);

    if (scrollConfig !== null) {
      line.domNode.scrollIntoView(scrollConfig);
    }

    Object.keys(context.format).forEach(name => {
      if (lineFormats[name] != null) return;
      if (Array.isArray(context.format[name])) return;
      if (name === 'code' || name === 'link') return;
      this.raiseOnKeydownCallback(context.event);
      this.quill.format(name, context.format[name], Quill.sources.USER);
    });
  }
}

Keyboard.DEFAULTS = {
  bindings: {
    bold: makeFormatHandler('bold', 66),
    italic: makeFormatHandler('italic', 73),
    underline: makeFormatHandler('underline', 85),
    indent: {
      // highlight tab or tab at beginning of list, indent or blockquote
      key: 'tab',
      format: ['blockquote', 'indent', 'list'],
      handler(range, context) {
        if (context.collapsed && context.offset !== 0) return true;
        this.quill.format('indent', '+1', Quill.sources.USER);
        return false;
      },
    },
    outdent: {
      key: 'tab',
      shiftKey: true,
      format: ['blockquote', 'indent', 'list'],
      // highlight tab or tab at beginning of list, indent or blockquote
      handler(range, context) {
        if (context.collapsed && context.offset !== 0) return true;
        this.quill.format('indent', '-1', Quill.sources.USER);
        return false;
      },
    },
    'outdent backspace': {
      key: 'backspace',
      collapsed: true,
      shiftKey: null,
      metaKey: null,
      ctrlKey: null,
      altKey: null,
      format: ['indent', 'list'],
      offset: 0,
      handler(range, context) {
        if (context.format.indent != null) {
          this.quill.format('indent', '-1', Quill.sources.USER);
        } else if (context.format.list != null) {
          this.quill.format('list', false, Quill.sources.USER);
        }
      },
    },
    'indent code-block': makeCodeBlockHandler(true),
    'outdent code-block': makeCodeBlockHandler(false),
    'remove tab': {
      key: 'tab',
      shiftKey: true,
      collapsed: true,
      prefix: /\t$/,
      handler(range) {
        this.quill.deleteText(range.index - 1, 1, Quill.sources.USER);
      },
    },
    tab: {
      key: 'tab',
      handler(range, context) {
        if (context.format.table) return true;
        this.quill.history.cutoff();
        const delta = new Delta()
          .retain(range.index)
          .delete(range.length)
          .insert('\t');
        this.quill.updateContents(delta, Quill.sources.USER);
        this.quill.history.cutoff();
        this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
        return false;
      },
    },
    'blockquote empty enter': {
      key: 'enter',
      collapsed: true,
      format: ['blockquote'],
      empty: true,
      handler() {
        this.quill.format('blockquote', false, Quill.sources.USER);
      },
    },
    'list empty enter': {
      key: 'enter',
      collapsed: true,
      format: ['list'],
      empty: true,
      handler(range, context) {
        const formats = { list: false };
        if (context.format.indent) {
          formats.indent = false;
        }
        this.quill.formatLine(
          range.index,
          range.length,
          formats,
          Quill.sources.USER,
        );
      },
    },
    'checklist enter': {
      key: 'enter',
      collapsed: true,
      format: { list: 'checked' },
      handler(range) {
        const [line, offset] = this.quill.getLine(range.index);
        const formats = {
          ...line.formats(),
          list: 'checked',
        };
        const delta = new Delta()
          .retain(range.index)
          .insert('\n', formats)
          .retain(line.length() - offset - 1)
          .retain(1, { list: 'unchecked' });
        this.quill.updateContents(delta, Quill.sources.USER);
        this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
        this.quill.scrollIntoView();
      },
    },
    'header enter': {
      key: 'enter',
      collapsed: true,
      format: ['header'],
      suffix: /^$/,
      handler(range, context) {
        const [line, offset] = this.quill.getLine(range.index);
        const delta = new Delta()
          .retain(range.index)
          .insert('\n', context.format)
          .retain(line.length() - offset - 1)
          .retain(1, { header: null });
        this.quill.updateContents(delta, Quill.sources.USER);
        this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
        this.quill.scrollIntoView();
      },
    },
    'list autofill': {
      key: 'space',
      shiftKey: null,
      collapsed: true,
      format: {
        'code-block': false,
        blockquote: false,
        table: false,
      },
      prefix: /^\s*?(\d+\.|-|\*|\[ ?\]|\[x\])$/,
      handler(range, context) {
        if (this.quill.scroll.query('list') == null) return true;
        const { length } = context.prefix;
        const [line, offset] = this.quill.getLine(range.index);
        if (offset > length) return true;
        let value;
        switch (context.prefix.trim()) {
          case '[]':
          case '[ ]':
            value = 'unchecked';
            break;
          case '[x]':
            value = 'checked';
            break;
          case '-':
          case '*':
            value = 'bullet';
            break;
          default:
            value = 'ordered';
        }
        this.quill.insertText(range.index, ' ', Quill.sources.USER);
        this.quill.history.cutoff();
        const delta = new Delta()
          .retain(range.index - offset)
          .delete(length + 1)
          .retain(line.length() - 2 - offset)
          .retain(1, { list: value });
        this.raiseOnKeydownCallback(context.event);
        this.quill.updateContents(delta, Quill.sources.USER);
        this.quill.history.cutoff();
        this.quill.setSelection(range.index - length, Quill.sources.SILENT);
        return false;
      },
    },
    'code exit': {
      key: 'enter',
      collapsed: true,
      format: ['code-block'],
      prefix: /^$/,
      suffix: /^\s*$/,
      handler(range) {
        const [line, offset] = this.quill.getLine(range.index);
        let numLines = 2;
        let cur = line;
        while (
          cur != null &&
          cur.length() <= 1 &&
          cur.formats()['code-block']
        ) {
          cur = cur.prev;
          numLines -= 1;
          // Requisite prev lines are empty
          if (numLines <= 0) {
            const delta = new Delta()
              .retain(range.index + line.length() - offset - 2)
              .retain(1, { 'code-block': null })
              .delete(1);
            this.quill.updateContents(delta, Quill.sources.USER);
            this.quill.setSelection(range.index - 1, Quill.sources.SILENT);
            return false;
          }
        }
        return true;
      },
    },
    'embed left': makeEmbedArrowHandler('leftArrow', false),
    'embed left shift': makeEmbedArrowHandler('leftArrow', true),
    'embed right': makeEmbedArrowHandler('rightArrow', false),
    'embed right shift': makeEmbedArrowHandler('rightArrow', true),
  },
};

function makeCodeBlockHandler(indent) {
  return {
    key: 'tab',
    shiftKey: !indent,
    format: { 'code-block': true },
    handler(range) {
      const CodeBlock = this.quill.scroll.query('code-block');
      const lines =
        range.length === 0
          ? this.quill.getLines(range.index, 1)
          : this.quill.getLines(range);
      let { index, length } = range;
      lines.forEach((line, i) => {
        if (indent) {
          line.insertAt(0, CodeBlock.TAB);
          if (i === 0) {
            index += CodeBlock.TAB.length;
          } else {
            length += CodeBlock.TAB.length;
          }
        } else if (line.domNode.textContent.indexOf(CodeBlock.TAB) === 0) {
          line.deleteAt(0, CodeBlock.TAB.length);
          if (i === 0) {
            index -= CodeBlock.TAB.length;
          } else {
            length -= CodeBlock.TAB.length;
          }
        }
      });
      this.quill.update(Quill.sources.USER);
      this.quill.setSelection(index, length, Quill.sources.SILENT);
    },
  };
}

function makeEmbedArrowHandler(key, shiftKey) {
  const where = key === 'leftArrow' ? 'prefix' : 'suffix';
  return {
    key,
    shiftKey,
    altKey: null,
    [where]: /^$/,
    handler(range) {
      let { index } = range;
      if (key === 'rightArrow') {
        index += range.length + 1;
      }
      const [leaf] = this.quill.getLeaf(index);
      if (!(leaf instanceof EmbedBlot)) return true;
      if (key === 'leftArrow') {
        if (shiftKey) {
          this.quill.setSelection(
            range.index - 1,
            range.length + 1,
            Quill.sources.USER,
          );
        } else {
          this.quill.setSelection(range.index - 1, Quill.sources.USER);
        }
      } else if (shiftKey) {
        this.quill.setSelection(
          range.index,
          range.length + 1,
          Quill.sources.USER,
        );
      } else {
        this.quill.setSelection(
          range.index + range.length + 1,
          Quill.sources.USER,
        );
      }
      return false;
    },
  };
}

function makeFormatHandler(format, which) {
  return {
    key: format[0],
    which,
    shortKey: true,
    handler(range, context) {
      this.quill.format(format, !context.format[format], Quill.sources.USER);
      return { preventAfterAllMatches: true };
    },
  };
}

function normalize(binding) {
  if (typeof binding === 'string' || typeof binding === 'number') {
    binding = { key: binding };
  } else if (typeof binding === 'object') {
    binding = cloneDeep(binding);
  } else {
    return null;
  }
  if (binding.shortKey) {
    binding[SHORTKEY] = binding.shortKey;
    delete binding.shortKey;
  }
  return binding;
}

function deleteRange({ quill, range }) {
  const lines = quill.getLines(range);
  let formats = {};
  if (lines.length > 1) {
    const firstFormats = lines[0].formats();
    const lastFormats = lines[lines.length - 1].formats();
    formats = AttributeMap.diff(lastFormats, firstFormats) || {};
  }
  quill.deleteText(range, Quill.sources.USER);
  if (Object.keys(formats).length > 0) {
    quill.formatLine(range.index, 1, formats, Quill.sources.USER);
  }
  quill.setSelection(range.index, Quill.sources.SILENT);
}

export { Keyboard as default, SHORTKEY, normalize, deleteRange };
