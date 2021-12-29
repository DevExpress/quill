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

  describe('addBinding', function() {
    it('which modifier', function() {
      const quillMock = {
        root: document.createElement('div'),
        once: (eventName, handler) => {
          handler();
        },
      };
      let counter = 0;
      console.log('which modifier');

      const nativeAddEventListener = quillMock.root.addEventListener;

      quillMock.root.addEventListener = function(type, handler) {
        const fakeEvent = {
          key: 'n',
          which: 66,
          shiftKey: false,
          metaKey: true,
          ctrlKey: true,
          altKey: false,
        };
        const modifiedHandler = event => {
          if (event.key === 'n') {
            event = fakeEvent;
          }

          handler(event);
        };

        nativeAddEventListener.call(this, type, modifiedHandler);
      };

      // eslint-disable-next-line no-new
      new Keyboard(quillMock, {
        bindings: {
          66: {
            key: 'n',
            which: 66,
            ctrlKey: true,
            handler() {
              console.log('handler!!!');
              counter += 1;
            },
          },
        },
      });

      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'n',
      });

      // quillMock.root.dispatchEvent(keydownEvent);

      // quillMock.root.addEventListener('keydown', function(e) {
      //   console.log('native addEventListener keydown');
      //   console.log(e.key);
      //   console.log(e.ctrlKey);
      //   console.log(e.which);
      // });

      quillMock.root.dispatchEvent(keydownEvent);

      expect(counter).toBe(1);

      window.addEventListener = nativeAddEventListener;
    });
  });
});
