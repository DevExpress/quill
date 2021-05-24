import Delta from 'quill-delta';
import Quill from '../core/quill';
import MultilineBreak from '../blots/multilineBreak';
import Module from '../core/module';

function breakMatcher() {
  return new Delta().insert({ multilineBreak: '' });
}

function getInitialContents(html) {
  const contents = this.clipboard.convert({
    html,
    text: '\n',
  });
  const newLine = new Delta('\n');
  return contents.compose(newLine);
}

class Multiline extends Module {
  constructor(quill, options) {
    const path = 'blots/multilineBreak';
    super(quill, options);

    Quill.register({ [path]: MultilineBreak }, true);

    quill.keyboard.addBinding(
      {
        key: 'enter',
        shiftKey: true,
      },
      this.enterHandler.bind(this),
    );
    quill.keyboard.bindings.enter.unshift(quill.keyboard.bindings.enter.pop());
    quill.clipboard.addMatcher('BR', breakMatcher);
    quill.getInitialContents = getInitialContents.bind(quill);
  }

  enterHandler(range) {
    const currentLeaf = this.quill.getLeaf(range.index)[0];
    const nextLeaf = this.quill.getLeaf(range.index + 1)[0];

    this.quill.insertEmbed(range.index, 'multilineBreak', true, 'user');

    if (nextLeaf === null || currentLeaf.parent !== nextLeaf.parent) {
      this.quill.insertEmbed(range.index, 'multilineBreak', true, 'user');
    }

    this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
  }
}

export default Multiline;
