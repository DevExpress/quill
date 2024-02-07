import Embed from '../blots/embed';
import Emitter from './emitter';

class Composition {
  constructor(scroll, emitter, quill) {
    this.scroll = scroll;
    this.quill = quill;
    this.emitter = emitter;
    this.isComposing = false;
    scroll.domNode.addEventListener('compositionstart', (event) => {
      if (!this.isComposing) {
        this.handleCompositionStart(event);
      }
    });

    scroll.domNode.addEventListener('compositionend', (event) => {
      if (this.isComposing) {
        this.handleCompositionEnd(event);
      }
    });
  }

  handleCompositionStart(event) {
    const blot = event.target instanceof Node
      ? this.scroll.find(event.target, true)
      : null;

    if (blot && !(blot instanceof Embed)) {
      this.emitter.emit(Emitter.events.COMPOSITION_BEFORE_START, event);
      this.scroll.batchStart();
      this.emitter.emit(Emitter.events.COMPOSITION_START, event);
      this.isComposing = true;
    }

    this.quill.endFormat();
  }

  handleCompositionEnd(event) {
    if (this.quill.isFormattingStarted()) {
      this.isComposing = false;
      return;
    }

    this.emitter.emit(Emitter.events.COMPOSITION_BEFORE_END, event);
    this.scroll.batchEnd();
    this.emitter.emit(Emitter.events.COMPOSITION_END, event);
    this.isComposing = false;
    this.quill.endFormat();
  }
}

export default Composition;
