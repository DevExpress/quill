import Keyboard, { SHORTKEY, normalize } from '../../../modules/keyboard';

describe('Keyboard', function() {
  describe('match', function() {
    it('no modifiers', function() {
      const binding = normalize({
        key: 'a',
      });
      expect(
        Keyboard.match(
          {
            key: 'a',
            shiftKey: false,
            metaKey: false,
            ctrlKey: false,
            altKey: false,
          },
          binding,
        ),
      ).toBe(true);
      expect(
        Keyboard.match(
          {
            key: 'A',
            shiftKey: false,
            metaKey: false,
            ctrlKey: false,
            altKey: true,
          },
          binding,
        ),
      ).toBe(false);
    });

    it('simple modifier', function() {
      const binding = normalize({
        key: 'a',
        altKey: true,
      });
      expect(
        Keyboard.match(
          {
            key: 'a',
            shiftKey: false,
            metaKey: false,
            ctrlKey: false,
            altKey: false,
          },
          binding,
        ),
      ).toBe(false);
      expect(
        Keyboard.match(
          {
            key: 'a',
            shiftKey: false,
            metaKey: false,
            ctrlKey: false,
            altKey: true,
          },
          binding,
        ),
      ).toBe(true);
    });

    it('optional modifier', function() {
      const binding = normalize({
        key: 'a',
        altKey: null,
      });
      expect(
        Keyboard.match(
          {
            key: 'a',
            shiftKey: false,
            metaKey: false,
            ctrlKey: false,
            altKey: false,
          },
          binding,
        ),
      ).toBe(true);
      expect(
        Keyboard.match(
          {
            key: 'a',
            shiftKey: false,
            metaKey: false,
            ctrlKey: false,
            altKey: true,
          },
          binding,
        ),
      ).toBe(true);
    });

    it('shortkey modifier', function() {
      const binding = normalize({
        key: 'a',
        shortKey: true,
      });
      expect(
        Keyboard.match(
          {
            key: 'a',
            shiftKey: false,
            metaKey: false,
            ctrlKey: false,
            altKey: false,
          },
          binding,
        ),
      ).toBe(false);
      expect(
        Keyboard.match(
          {
            key: 'a',
            shiftKey: false,
            metaKey: false,
            ctrlKey: false,
            altKey: false,
            [SHORTKEY]: true,
          },
          binding,
        ),
      ).toBe(true);
    });

    it('native shortkey modifier', function() {
      const binding = normalize({
        key: 'a',
        [SHORTKEY]: true,
      });
      expect(
        Keyboard.match(
          {
            key: 'a',
            shiftKey: false,
            metaKey: false,
            ctrlKey: false,
            altKey: false,
          },
          binding,
        ),
      ).toBe(false);
      expect(
        Keyboard.match(
          {
            key: 'a',
            shiftKey: false,
            metaKey: false,
            ctrlKey: false,
            altKey: false,
            [SHORTKEY]: true,
          },
          binding,
        ),
      ).toBe(true);
    });
  });
  describe('onKeydown', function() {
    ['a', 'delete', 'backspace'].forEach(key => {
      it(`handle ${key} keydown event`, function() {
        const quillMock = {
          root: document.createElement('div'),
          once: (eventName, handler) => {
            handler();
          },
        };
        let counter = 0;
        // eslint-disable-next-line no-new
        new Keyboard(quillMock, {
          onKeydown: () => {
            counter += 1;
          },
          bindings: {},
        });
        const keydownEvent = new Event('keydown', {
          key,
          shiftKey: false,
          metaKey: false,
          ctrlKey: false,
          altKey: false,
        });

        quillMock.root.dispatchEvent(keydownEvent);

        expect(counter).toBe(1);
      });
    });
  });
});
