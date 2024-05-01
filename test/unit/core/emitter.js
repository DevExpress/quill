import Quill from '../../../core/quill';

describe('Emitter', function () {
  it('handleDOM is called on event hadling', function () {
    this.quill = this.initialize(Quill, '');
    spyOn(this.quill.emitter, 'handleDOM');

    const event = new Event('click');
    document.dispatchEvent(event);

    expect(this.quill.emitter.handleDOM).toHaveBeenCalledWith(event);
  });

  it('handleDOM is called on event hadling if quill container is in shadowDOM', function () {
    const shadowContainer = document.body.appendChild(document.createElement('div'));
    try {
      shadowContainer.attachShadow({ mode: 'open' });
      shadowContainer.shadowRoot.innerHTML = '<div></div>';
      const quillContainer = shadowContainer.shadowRoot.querySelector('div');

      this.quill = this.initialize(Quill, '', quillContainer);
      spyOn(this.quill.emitter, 'handleDOM');

      const event = new Event('click', { bubbles: true });
      shadowContainer.dispatchEvent(event);

      expect(this.quill.emitter.handleDOM).toHaveBeenCalledWith(event);
    } finally {
      shadowContainer.remove();
    }
  });
});
