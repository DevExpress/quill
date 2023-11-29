import { getEditorSelector, isMac, sanitizeTableHtml } from './helpers';
import url from './helpers/getPageUrl';

fixture`HtmlEditor - table header`
  .page(url(__dirname, './example/table_header.html'));

test('cell should not be removed on typing if it is selected', async (t) => {
  const editor = getEditorSelector('.ql-editor');

  await t.click('[data-table-cell="3"]')
    .pressKey('shift+left')
    .pressKey('shift+left')
    .pressKey('c');

  const tableContent = sanitizeTableHtml(await editor.innerHTML);

  await t.expect(tableContent)
    .eql(`
      <table>
      <thead>
        <tr>
          <th><p>1</p></th>
          <th><p>2c</p></th>
          <th><p><br></p></th>
        </tr>
      </thead>
      </table>
      <p><br></p>
    `.replace(/\s/g, ''));
});

fixture`HtmlEditor - table`
  .page(url(__dirname, './example/table.html'));

test('cell should not be removed on typing if it is selected', async (t) => {
  const editor = getEditorSelector('.ql-editor');

  await t.click('[data-table-cell="3"]')
    .pressKey('shift+left')
    .pressKey('shift+left')
    .pressKey('c');

  const tableContent = sanitizeTableHtml(await editor.innerHTML);

  await t.expect(tableContent)
    .eql(`
      <table>
      <tbody>
        <tr>
          <td><p>1</p></td>
          <td><p>2c</p></td>
          <td><p><br></p></td>
        </tr>
      </tbody>
      </table>
      <p><br></p>
    `.replace(/\s/g, ''));
});

test('backspace press on the position after table should remove an empty line and not add it to the cell', async (t) => {
  const editor = getEditorSelector('.ql-editor');

  await t.click('[data-table-cell="3"]')
    .pressKey('right')
    .pressKey('backspace');

  const tableContent = sanitizeTableHtml(await editor.innerHTML);

  await t.expect(tableContent)
    .eql(`
      <table>
      <tbody>
        <tr>
          <td><p>1</p></td>
          <td><p>2</p></td>
          <td><p>3</p></td>
        </tr>
      </tbody>
      </table>
    `.replace(/\s/g, ''));
});

test('backspace in multiline cell should work as usual', async (t) => {
  const editor = getEditorSelector('.ql-editor');

  await t.click('[data-table-cell="3"]')
    .pressKey('4')
    .pressKey('enter')
    .pressKey('backspace')
    .pressKey('backspace');

  const tableContent = sanitizeTableHtml(await editor.innerHTML);

  await t.expect(tableContent)
    .eql(`
      <table>
      <tbody>
        <tr>
          <td><p>1</p></td>
          <td><p>2</p></td>
          <td><p>3</p></td>
        </tr>
      </tbody>
      </table>
      <p><br></p>
    `.replace(/\s/g, ''));
});

test('backspace press on the position after table should only move a caret to cell if next line is not empty', async (t) => {
  const editor = getEditorSelector('.ql-editor');

  await t.click('[data-table-cell="3"]')
    .pressKey('right')
    .pressKey('g')
    .pressKey('left')
    .pressKey('backspace')
    .pressKey('w');

  const tableContent = sanitizeTableHtml(await editor.innerHTML);

  await t.expect(tableContent)
    .eql(`
        <table>
        <tbody>
          <tr>
            <td><p>1</p></td>
            <td><p>2</p></td>
            <td><p>3w</p></td>
          </tr>
        </tbody>
        </table>
        <p>g</p>
      `.replace(/\s/g, ''));
});

test('backspace press on the position after table should remove empty line and move caret to a cell if next line is empty', async (t) => {
  const editor = getEditorSelector('.ql-editor');

  await t.click('[data-table-cell="3"]')
    .pressKey('right')
    .pressKey('backspace')
    .pressKey('w');

  const tableContent = sanitizeTableHtml(await editor.innerHTML);

  await t.expect(tableContent)
    .eql(`
      <table>
      <tbody>
        <tr>
          <td><p>1</p></td>
          <td><p>2</p></td>
          <td><p>3w</p></td>
        </tr>
      </tbody>
      </table>
    `.replace(/\s/g, ''));
});

fixture`HtmlEditor - table (T1195607)`
  .page(url(__dirname, './example/table_no_new_line.html'));
test('enter press on the position after table should add empty line and move caret to a next line (T1195607)', async (t) => {
  const editor = getEditorSelector('.ql-editor');

  await t.click('[data-table-cell="3"]')
    .pressKey('right')
    .pressKey('enter')
    .pressKey('w');

  const tableContent = sanitizeTableHtml(await editor.innerHTML);

  await t.expect(tableContent)
    .eql(`
      <table>
      <tbody>
        <tr>
          <td><p>1</p></td>
          <td><p>2</p></td>
          <td><p>3</p></td>
        </tr>
      </tbody>
      </table>
      <p>w</p>
    `.replace(/\s/g, ''));
});

if (!isMac) {
  fixture`HtmlEditor - list copy/pasting into table`
    .page(url(__dirname, './example/table_copy_pasting.html'));

  test('Should be no errors when list is pasted into table cell(T1155500)', async (t) => {
    await t.pressKey('ctrl+c')
      .click('[data-table-cell="2"]')
      .pressKey('ctrl+v');

    const liElementsCount = await t.eval(() => {
      const listNodes = document.querySelectorAll('.ql-editor li');

      return listNodes.length;
    });

    await t.expect(liElementsCount)
      .eql(4);
  });
}

fixture`HtmlEditor - mutation content with table`
  .page(url(__dirname, './example/table_drag_drop.html'));

test('enter press on the position after table should add empty line and move caret to a next line (T1195607)', async (t) => {
  await t.eval(() => {
    const qlEditor = document.querySelector('.ql-editor');
    const table = document.createElement('table');

    table.innerHTML = '<tbody><tr><td><p><br/></p></td><td><p>Custom text</p></td></tr></tbody>';
    qlEditor.appendChild(table);
  });
});
