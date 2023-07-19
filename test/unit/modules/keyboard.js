import Keyboard, { SHORTKEY, normalize } from '../../../modules/keyboard';
import { Range } from '../../../core/selection';
import Quill from '../../../core/quill';
import TableLite from '../../../modules/table/lite';
import TableMain from '../../../modules/table';

describe('Keyboard', function () {
  describe('match', function () {
    it('no modifiers', function () {
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

    it('simple modifier', function () {
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

    it('optional modifier', function () {
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

    it('shortkey modifier', function () {
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

    it('native shortkey modifier', function () {
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
  describe('onKeydown', function () {
    ['a', 'delete', 'backspace'].forEach((key) => {
      it(`handle ${key} keydown event`, function () {
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

  describe('bindings', function () {
    it('which modifier', function () {
      const quillMock = {
        root: document.createElement('div'),
        once: (eventName, handler) => {
          handler();
        },
        hasFocus: () => true,
        getSelection: () => {
          return { index: 0, length: 0 };
        },
        getFormat: () => {
          return {};
        },
        getLine: () => {
          return [{ length: () => 0 }, 0];
        },
        getLeaf: () => {
          return [0, 0];
        },
      };
      const fakeEvent = {
        key: 'b',
        which: 66,
        code: 'KeyB',
        shiftKey: false,
        metaKey: false,
        ctrlKey: true,
        altKey: false,
      };
      let counter = 0;

      const nativeAddEventListener = quillMock.root.addEventListener;

      quillMock.root.addEventListener = function (type, handler) {
        const modifiedHandler = () => {
          handler(fakeEvent);
        };

        nativeAddEventListener.call(this, type, modifiedHandler);
      };

      // eslint-disable-next-line no-new
      new Keyboard(quillMock, {
        bindings: {
          66: {
            key: 'b',
            which: 66,
            ctrlKey: true,
            handler() {
              counter += 1;
            },
          },
        },
      });

      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'n',
      });

      quillMock.root.dispatchEvent(keydownEvent);

      expect(counter).toBe(1);

      quillMock.root.addEventListener = nativeAddEventListener;
    });
  });

  describe('tab navigation on main table', function () {
    const markup = `
        <table>
          <thead>
            <tr>
              <th><p>head1</p></th>
              <th><p>head2</p></th>
              <th><p>head3</p></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><p>data1</p></td>
              <td><p>data2</p></td>
              <td><p>data3</p></td>
            </tr>
            <tr>
              <td><p>data1</p></td>
              <td><p>data2</p></td>
              <td><p>data3</p></td>
            </tr>
          </tbody>
        </table>
      `;

    it('should select next cell on tab click', function () {
      const quill = this.initialize(Quill, markup, this.container, {
        modules: {
          table: true,
        },
      });
      quill.setSelection(18);
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'tab',
      });

      quill.root.dispatchEvent(keydownEvent);
      expect(quill.getSelection()).toEqual(new Range(24));
    });

    it('should select the first cell in the by tab press if cursor is in the last cell of the first row', function () {
      const quill = this.initialize(Quill, markup, this.container, {
        modules: {
          table: true,
        },
      });
      quill.setSelection(30);
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'tab',
      });

      quill.root.dispatchEvent(keydownEvent);
      expect(quill.getSelection()).toEqual(new Range(36));
    });

    it('should select previous cell on tab + shift click', function () {
      const quill = this.initialize(Quill, markup, this.container, {
        modules: {
          table: true,
        },
      });
      quill.setSelection(31);
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'tab',
        shiftKey: true,
      });

      quill.root.dispatchEvent(keydownEvent);
      expect(quill.getSelection()).toEqual(new Range(29));
    });

    it('should select last cell of the first row by tab+shift if cursor is in the first cell of the second row', function () {
      const quill = this.initialize(Quill, markup, this.container, {
        modules: {
          table: true,
        },
      });
      quill.setSelection(38);
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'tab',
        shiftKey: true,
      });

      quill.root.dispatchEvent(keydownEvent);
      expect(quill.getSelection()).toEqual(new Range(35));
    });

    it('should select next cell in header on tab click', function () {
      const quill = this.initialize(Quill, markup, this.container, {
        modules: {
          table: true,
        },
      });
      quill.setSelection(0);
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'tab',
      });

      quill.root.dispatchEvent(keydownEvent);
      expect(quill.getSelection()).toEqual(new Range(6));
    });

    it('should select previous cell in header on tab + shift click', function () {
      const quill = this.initialize(Quill, markup, this.container, {
        modules: {
          table: true,
        },
      });
      quill.setSelection(8);
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'tab',
        shiftKey: true,
      });

      quill.root.dispatchEvent(keydownEvent);
      expect(quill.getSelection()).toEqual(new Range(5));
    });
  });

  describe('tab navigation on lite table', function () {
    beforeAll(function () {
      Quill.register({ 'modules/table': TableLite }, true);
    });
    afterAll(function () {
      Quill.register({ 'modules/table': TableMain }, true);
    });
    const markup = `
        <table>
          <thead>
            <tr>
              <th><p>head1</p></th>
              <th><p>head2</p></th>
              <th><p>head3</p></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><p>data1</p></td>
              <td><p>data2</p></td>
              <td><p>data3</p></td>
            </tr>
            <tr>
              <td><p>data1</p></td>
              <td><p>data2</p></td>
              <td><p>data3</p></td>
            </tr>
          </tbody>
        </table>
      `;

    it('should select next cell on tab click', function () {
      const quill = this.initialize(Quill, markup, this.container, {
        modules: {
          table: true,
        },
      });
      quill.setSelection(18);
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'tab',
      });

      quill.root.dispatchEvent(keydownEvent);
      expect(quill.getSelection()).toEqual(new Range(24));
    });

    it('should select the first cell in the by tab press if cursor is in the last cell of the first row', function () {
      const quill = this.initialize(Quill, markup, this.container, {
        modules: {
          table: true,
        },
      });
      quill.setSelection(30);
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'tab',
      });

      quill.root.dispatchEvent(keydownEvent);
      expect(quill.getSelection()).toEqual(new Range(36));
    });

    it('should select previous cell on tab + shift click', function () {
      const quill = this.initialize(Quill, markup, this.container, {
        modules: {
          table: true,
        },
      });
      quill.setSelection(31);
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'tab',
        shiftKey: true,
      });

      quill.root.dispatchEvent(keydownEvent);
      expect(quill.getSelection()).toEqual(new Range(29));
    });

    it('should select last cell of the first row by tab+shift if cursor is in the first cell of the second row', function () {
      const quill = this.initialize(Quill, markup, this.container, {
        modules: {
          table: true,
        },
      });
      quill.setSelection(38);
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'tab',
        shiftKey: true,
      });

      quill.root.dispatchEvent(keydownEvent);
      expect(quill.getSelection()).toEqual(new Range(35));
    });

    it('should select next cell in header on tab click', function () {
      const quill = this.initialize(Quill, markup, this.container, {
        modules: {
          table: true,
        },
      });
      quill.setSelection(0);
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'tab',
      });

      quill.root.dispatchEvent(keydownEvent);
      expect(quill.getSelection()).toEqual(new Range(6));
    });

    it('should select previous cell in header on tab + shift click', function () {
      const quill = this.initialize(Quill, markup, this.container, {
        modules: {
          table: true,
        },
      });
      quill.setSelection(8);
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'tab',
        shiftKey: true,
      });

      quill.root.dispatchEvent(keydownEvent);
      expect(quill.getSelection()).toEqual(new Range(5));
    });
  });
});
