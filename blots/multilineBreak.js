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
}

MultilineBreak.blotName = 'multilineBreak';
MultilineBreak.tagName = 'BR';

export default MultilineBreak;
