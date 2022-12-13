import Scroll from '../../../blots/scroll';
import Editor from '../../../core/editor';

describe('Inline', function () {
  it('format order', function () {
    const scroll = this.initialize(Scroll, '<p>Hello World!</p>');
    scroll.formatAt(0, 1, 'bold', true);
    scroll.formatAt(0, 1, 'italic', true);
    scroll.formatAt(2, 1, 'italic', true);
    scroll.formatAt(2, 1, 'bold', true);
    expect(scroll.domNode).toEqualHTML(
      '<p><strong><em>H</em></strong>e<strong><em>l</em></strong>lo World!</p>',
    );
  });

  it('reorder', function () {
    const scroll = this.initialize(Scroll, '<p>0<strong>12</strong>3</p>');
    const p = scroll.domNode.firstChild;
    const em = document.createElement('em');
    Array.from(p.childNodes).forEach(function (node) {
      em.appendChild(node);
    });
    p.appendChild(em);
    expect(scroll.domNode).toEqualHTML('<p><em>0<strong>12</strong>3</em></p>');
    scroll.update();
    expect(scroll.domNode).toEqualHTML(
      '<p><em>0</em><strong><em>12</em></strong><em>3</em></p>',
    );
  });

  describe('Strikethrough', function () {
    const cleanHtmlRegExp = /(\n|>\s+|\s+<)/g;

    it('renders attributes when the strikethrough tag is first', function () {
      const testHtml = `
      <p>
        <s style="background-color: #00ff00">BBB</s>
        <span style="background-color: #00ff00">CCC</span>
      </p>`.replace(cleanHtmlRegExp, (match) => match.trim());

      const editor = this.initialize(Editor, testHtml);

      expect(editor.scroll.domNode.innerHTML).toEqual(testHtml);
    });

    it('renders attributes when the strikethrough tag is last', function () {
      const testHtml = `
      <p>
        <span style="background-color: #00ff00">AAA</span>
        <s style="background-color: #00ff00">BBB</s>
      </p>`.replace(cleanHtmlRegExp, (match) => match.trim());

      const editor = this.initialize(Editor, testHtml);

      expect(editor.scroll.domNode.innerHTML).toEqual(testHtml);
    });

    it('renders attributes when the strikethrough tag is middle', function () {
      const testHtml = `
      <p>
        <span style="background-color: #00ff00">AAA</span>
        <s style="background-color: #00ff00">BBB</s>
        <span style="background-color: #00ff00">CCC</span>
      </p>`.replace(cleanHtmlRegExp, (match) => match.trim());

      const editor = this.initialize(Editor, testHtml);

      expect(editor.scroll.domNode.innerHTML).toEqual(testHtml);
    });

    it('renders different attributes', function () {
      const testHtml = `
      <p>
        <s style="background-color: #00ff00">AAA</s>
        <s style="background-color: #ff0000">BBB</s>
      </p>`.replace(cleanHtmlRegExp, (match) => match.trim());

      const editor = this.initialize(Editor, testHtml);

      expect(editor.scroll.domNode.innerHTML).toEqual(testHtml);
    });

    it('renders attributes after tag without attributes', function () {
      const testHtml = `
      <p>
        <s style="background-color: #00ff00">AAA</s>
        <span>BBB</span>
        <s style="background-color: #00ff00">CCC</s>
      </p>`.replace(cleanHtmlRegExp, (match) => match.trim());

      const editor = this.initialize(Editor, testHtml);

      expect(editor.scroll.domNode.innerHTML).toEqual(testHtml);
    });
  });
});
