import {
  Scope, ScrollBlot, ParentBlot, ContainerBlot,
} from 'parchment';
import Emitter from '../core/emitter';
import Block, { BlockEmbed } from './block';
import Break from './break';
import Container from './container';
import { CellLine } from '../formats/table';

const TABLE_TAGS = ['TD', 'TH', 'TR', 'TBODY', 'THEAD', 'TABLE'];
const MAX_OPTIMIZE_ITERATIONS = 100;

function isLine(blot) {
  return blot instanceof Block || blot instanceof BlockEmbed;
}

function shouldRemoveMutation(mutation) {
  const isTableTag = TABLE_TAGS.includes(mutation.target.tagName);
  const isChildOfTableTag = TABLE_TAGS.includes(mutation.target.offsetParent?.tagName);

  return isTableTag || isChildOfTableTag;
}

class Scroll extends ScrollBlot {
  constructor(registry, domNode, { emitter, toggleBlankClass }) {
    super(registry, domNode);
    this.emitter = emitter;
    this.toggleBlankClass = toggleBlankClass;
    this.batch = false;
    this.optimize();
    this.enable();
    this.domNode.addEventListener('dragstart', (e) => this.handleDragStart(e));
  }

  batchStart() {
    if (!Array.isArray(this.batch)) {
      this.batch = [];
    }
  }

  batchEnd() {
    const mutations = this.batch;
    this.batch = false;
    this.update(mutations);
  }

  emitMount(blot) {
    this.emitter.emit(Emitter.events.SCROLL_BLOT_MOUNT, blot);
  }

  emitUnmount(blot) {
    this.emitter.emit(Emitter.events.SCROLL_BLOT_UNMOUNT, blot);
  }

  deleteAt(index, length) {
    const [first, offset] = this.line(index);
    const [last] = this.line(index + length);
    super.deleteAt(index, length);
    if (last != null && first !== last && offset > 0) {
      const isCrossCellDelete = (first instanceof CellLine || last instanceof CellLine)
        && first.parent !== last.parent;
      const includesEmbedBlock = first instanceof BlockEmbed || last instanceof BlockEmbed;

      if (!includesEmbedBlock && !isCrossCellDelete) {
        const ref = last.children.head instanceof Break ? null : last.children.head;
        first.moveChildren(last, ref);
        first.remove();
      }
    }
    this.optimize();
  }

  enable(enabled = true) {
    this.domNode.setAttribute('contenteditable', enabled);
  }

  formatAt(index, length, format, value) {
    super.formatAt(index, length, format, value);
    this.optimize();
  }

  handleDragStart(event) {
    event.preventDefault();
  }

  insertAt(index, value, def) {
    if (index >= this.length()) {
      if (def == null || this.scroll.query(value, Scope.BLOCK) == null) {
        const blot = this.scroll.create(this.statics.defaultChild.blotName);
        this.appendChild(blot);
        if (def == null && value.endsWith('\n')) {
          blot.insertAt(0, value.slice(0, -1), def);
        } else {
          blot.insertAt(0, value, def);
        }
      } else {
        const embed = this.scroll.create(value, def);
        this.appendChild(embed);
      }
    } else {
      super.insertAt(index, value, def);
    }
    this.optimize();
  }

  insertBefore(blot, ref) {
    if (blot.statics.scope === Scope.INLINE_BLOT) {
      const wrapper = this.scroll.create(this.statics.defaultChild.blotName);
      wrapper.appendChild(blot);
      super.insertBefore(wrapper, ref);
    } else {
      super.insertBefore(blot, ref);
    }
  }

  isEnabled() {
    return this.domNode.getAttribute('contenteditable') === 'true';
  }

  leaf(index) {
    return this.path(index).pop() || [null, -1];
  }

  line(index) {
    if (index === this.length()) {
      return this.line(index - 1);
    }
    return this.descendant(isLine, index);
  }

  lines(index = 0, length = Number.MAX_VALUE) {
    const getLines = (blot, blotIndex, blotLength) => {
      let lines = [];
      let lengthLeft = blotLength;
      blot.children.forEachAt(
        blotIndex,
        blotLength,
        (child, childIndex, childLength) => {
          if (isLine(child)) {
            lines.push(child);
          } else if (child instanceof ContainerBlot) {
            lines = lines.concat(getLines(child, childIndex, lengthLeft));
          }
          lengthLeft -= childLength;
        },
      );
      return lines;
    };
    return getLines(this, index, length);
  }

  scrollBlotOptimize(mutations, context) {
    ParentBlot.prototype.optimize.call(this, context);

    const mutationsMap = context.mutationsMap || new WeakMap();
    // We must modify mutations directly, cannot make copy and then modify
    let records = Array.from(this.observer.takeRecords());
    // Array.push currently seems to be implemented by a non-tail recursive function
    // so we cannot just mutations.push.apply(mutations, this.observer.takeRecords());
    while (records.length > 0) {
      const record = records.pop();

      if (!shouldRemoveMutation(record)) {
        mutations.push(record);
      }
    }

    const mark = (blot, markParent = true) => {
      if (blot == null || blot === this) {
        return;
      }
      if (blot.domNode.parentNode == null) {
        return;
      }
      if (!mutationsMap.has(blot.domNode)) {
        mutationsMap.set(blot.domNode, []);
      }
      if (markParent) {
        mark(blot.parent);
      }
    };

    const optimize = (blot) => {
      // Post-order traversal
      if (!mutationsMap.has(blot.domNode)) {
        return;
      }
      if (blot instanceof ParentBlot) {
        blot.children.forEach(optimize);
      }
      mutationsMap.delete(blot.domNode);
      blot.optimize(context);
    };

    let remaining = mutations;

    for (let i = 0; remaining.length > 0; i += 1) {
      if (i >= MAX_OPTIMIZE_ITERATIONS) {
        throw new Error('[Parchment] Maximum optimize iterations reached');
      }

      remaining.forEach((mutation) => {
        const blot = this.find(mutation.target, true);

        if (blot == null) {
          return;
        }

        if (blot.domNode === mutation.target) {
          if (mutation.type === 'childList') {
            mark(this.find(mutation.previousSibling, false));

            Array.from(mutation.addedNodes).forEach((node) => {
              const child = this.find(node, false);

              mark(child, false);

              if (child instanceof ParentBlot) {
                child.children.forEach((grandChild) => {
                  mark(grandChild, false);
                });
              }
            });
          } else if (mutation.type === 'attributes') {
            mark(blot.prev);
          }
        }

        mark(blot);
      });

      this.children.forEach(optimize);

      remaining = Array.from(this.observer.takeRecords());
      records = remaining.slice();

      while (records.length > 0) {
        mutations.push(records.pop());
      }
    }
  }

  optimize(mutations = [], context = {}) {
    if (this.batch) return;

    this.scrollBlotOptimize(mutations, context);

    if (mutations.length > 0) {
      this.emitter.emit(Emitter.events.SCROLL_OPTIMIZE, mutations, context);
    }
  }

  path(index) {
    return super.path(index).slice(1); // Exclude self
  }

  remove() {
    // Never remove self
  }

  update(mutations) {
    if (this.batch) {
      if (Array.isArray(mutations)) {
        this.batch = this.batch.concat(mutations);
        this.toggleBlankClass();
      }

      return;
    }

    let source = Emitter.sources.USER;

    if (typeof mutations === 'string') {
      source = mutations;
    }

    if (!Array.isArray(mutations)) {
      mutations = this.observer.takeRecords();
    }

    mutations = mutations.filter((mutation) => {
      if (shouldRemoveMutation(mutation)) {
        return false;
      }

      const blot = this.find(mutation.target, true);

      return blot && blot.scroll === this;
    });

    if (mutations.length > 0) {
      this.emitter.emit(Emitter.events.SCROLL_BEFORE_UPDATE, source, mutations);
    }

    super.update(mutations.concat([])); // pass copy

    if (mutations.length > 0) {
      this.emitter.emit(Emitter.events.SCROLL_UPDATE, source, mutations);
    }
  }
}
Scroll.blotName = 'scroll';
Scroll.className = 'ql-editor';
Scroll.tagName = 'DIV';
Scroll.defaultChild = Block;
Scroll.allowedChildren = [Block, BlockEmbed, Container];

export default Scroll;
