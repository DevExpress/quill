import Embed from '../blots/embed';
import Emitter from './emitter';

class Composition {
  constructor(scroll, emitter) {
    this.scroll = scroll;
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

  isCompositionInProgress() {
    return this.isComposing;
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
  }

  handleCompositionEnd(event) {
    this.emitter.emit(Emitter.events.COMPOSITION_BEFORE_END, event);
    this.scroll.batchEnd();
    this.emitter.emit(Emitter.events.COMPOSITION_END, event);
    this.isComposing = false;
  }
}

export default Composition;
