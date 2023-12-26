import { getEditorSelector, sanitizeTableHtml } from './helpers';
import url from './helpers/getPageUrl';

fixture`HtmlEditor - list`
  .page(url(__dirname, './example/list.html'));

test('multiline break before list should not merge with the 1st list item (T1206652)', async (t) => {
  const editor = getEditorSelector('.ql-editor');
  const tableContent = sanitizeTableHtml(await editor.innerHTML);

  await t.expect(tableContent.replace(/\s/g, ''))
    .eql(`
      <p>Test Headline<br><br></p>
      <ol>
        <li><span class="ql-ui" contenteditable="false"></span>First</li>
        <li><span class="ql-ui" contenteditable="false"></span>Second</li>
        <li><span class="ql-ui" contenteditable="false"></span>Third</li>
      </ol>
    `.replace(/\s/g, ''));
});
