import { EmbedBlot } from 'parchment';

class MultilineBreak extends EmbedBlot {
  static value() {
    return '\n';
  }

  length() {
    return 1;
  }

  value() {
    return '\n';
  }

  optimize() {
    if (!this.prev && !this.next) {
      this.remove();
    }
  }
}

MultilineBreak.blotName = 'multilineBreak';
MultilineBreak.tagName = 'BR';

export default MultilineBreak;
