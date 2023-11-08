// eslint-disable-next-line import/no-extraneous-dependencies
const puppeteer = require('puppeteer');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

const isMac = process.platform === 'darwin';
const SHORTKEY = isMac ? 'Meta' : 'Control';

const CHAPTER = 'Chapter 1. Loomings.';
const GUARD_CHAR = '\uFEFF';
const EMBED = `<span>${GUARD_CHAR}<span contenteditable="false"><span contenteditable="false">#test</span></span>${GUARD_CHAR}</span>`;
const P1 = 'Call me Ishmael. Some years ago—never mind how long precisely-having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to sea as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the ship. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the ocean with me.';
const P2 = 'There now is your insular city of the Manhattoes, belted round by wharves as Indian isles by coral reefs—commerce surrounds it with her surf. Right and left, the streets take you waterward. Its extreme downtown is the battery, where that noble mole is washed by waves, and cooled by breezes, which a few hours previous were out of sight of land. Look at the crowds of water-gazers there.';
const HOST = 'http://127.0.0.1:8080';

function sanitizeTableHtml(html) {
  return html.replace(/(<\w+)((\s+class\s*=\s*"[^"]*")|(\s+data-[\w-]+\s*=\s*"[^"]*"))*(\s*>)/gi, '$1$5');
}

describe('quill', function () {
  it('compose an epic', async function () {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();

    await page.goto(`${HOST}/index.html`);
    await page.waitForSelector('.ql-editor', { timeout: 10000 });
    const title = await page.title();
    expect(title).toEqual('DevExtreme-Quill Base Editing');

    await page.type('.ql-editor', 'The Whale');
    let html = await page.$eval('.ql-editor', (e) => e.innerHTML);
    expect(html).toEqual('<p>The Whale</p>');

    await page.keyboard.press('Enter');
    html = await page.$eval('.ql-editor', (e) => e.innerHTML);
    expect(html).toEqual('<p>The Whale</p><p><br></p>');

    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.type('.ql-editor', P1);
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.type('.ql-editor', P2);
    html = await page.$eval('.ql-editor', (e) => e.innerHTML);
    expect(html).toEqual(
      [
        '<p>The Whale</p>',
        '<p><br></p>',
        `<p>\t${P1}</p>`,
        '<p><br></p>',
        `<p>${P2}</p>`,
      ].join(''),
    );

    // More than enough to get to top
    await Promise.all(
      Array(20)
        .fill(0)
        .map(() => page.keyboard.press('ArrowUp')),
    );
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.type('.ql-editor', CHAPTER);
    await page.keyboard.press('Enter');
    html = await page.$eval('.ql-editor', (e) => e.innerHTML);
    expect(html).toEqual(
      [
        '<p>The Whale</p>',
        '<p><br></p>',
        `<p>${CHAPTER}</p>`,
        '<p><br></p>',
        `<p>\t${P1}</p>`,
        '<p><br></p>',
        `<p>${P2}</p>`,
      ].join(''),
    );

    // More than enough to get to top
    await Promise.all(
      Array(20)
        .fill(0)
        .map(() => page.keyboard.press('ArrowUp')),
    );
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    html = await page.$eval('.ql-editor', (e) => e.innerHTML);
    expect(html).toEqual(
      [
        '<p>Whale</p>',
        '<p><br></p>',
        `<p>${CHAPTER}</p>`,
        '<p><br></p>',
        `<p>\t${P1}</p>`,
        '<p><br></p>',
        `<p>${P2}</p>`,
      ].join(''),
    );

    await page.keyboard.press('Delete');
    await page.keyboard.press('Delete');
    await page.keyboard.press('Delete');
    await page.keyboard.press('Delete');
    await page.keyboard.press('Delete');
    html = await page.$eval('.ql-editor', (e) => e.innerHTML);
    expect(html).toEqual(
      [
        '<p><br></p>',
        '<p><br></p>',
        `<p>${CHAPTER}</p>`,
        '<p><br></p>',
        `<p>\t${P1}</p>`,
        '<p><br></p>',
        `<p>${P2}</p>`,
      ].join(''),
    );

    await page.keyboard.press('Delete');
    html = await page.$eval('.ql-editor', (e) => e.innerHTML);
    expect(html).toEqual(
      [
        '<p><br></p>',
        `<p>${CHAPTER}</p>`,
        '<p><br></p>',
        `<p>\t${P1}</p>`,
        '<p><br></p>',
        `<p>${P2}</p>`,
      ].join(''),
    );

    await page.click('#bold');
    await page.click('#italic');
    html = await page.$eval('.ql-editor', (e) => e.innerHTML);
    expect(html).toEqual(
      [
        '<p><strong><em><span class="ql-cursor">\uFEFF</span></em></strong></p>',
        `<p>${CHAPTER}</p>`,
        '<p><br></p>',
        `<p>\t${P1}</p>`,
        '<p><br></p>',
        `<p>${P2}</p>`,
      ].join(''),
    );

    await page.type('.ql-editor', 'Moby Dick');
    html = await page.$eval('.ql-editor', (e) => e.innerHTML);
    expect(html).toEqual(
      [
        '<p><strong><em>Moby Dick</em></strong></p>',
        `<p>${CHAPTER}</p>`,
        '<p><br></p>',
        `<p>\t${P1}</p>`,
        '<p><br></p>',
        `<p>${P2}</p>`,
      ].join(''),
    );

    await page.keyboard.press('ArrowRight');
    await page.keyboard.down('Shift');
    await Promise.all(
      Array(CHAPTER.length)
        .fill(0)
        .map(() => page.keyboard.press('ArrowRight')),
    );
    await page.keyboard.up('Shift');

    await page.keyboard.down(SHORTKEY);
    await page.keyboard.press('b');
    await page.keyboard.up(SHORTKEY);
    html = await page.$eval('.ql-editor', (e) => e.innerHTML);
    expect(html).toEqual(
      [
        '<p><strong><em>Moby Dick</em></strong></p>',
        `<p><strong>${CHAPTER}</strong></p>`,
        '<p><br></p>',
        `<p>\t${P1}</p>`,
        '<p><br></p>',
        `<p>${P2}</p>`,
      ].join(''),
    );

    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowUp');
    await page.click('#header');
    html = await page.$eval('.ql-editor', (e) => e.innerHTML);
    expect(html).toEqual(
      [
        '<h1><strong><em>Moby Dick</em></strong></h1>',
        `<p><strong>${CHAPTER}</strong></p>`,
        '<p><br></p>',
        `<p>\t${P1}</p>`,
        '<p><br></p>',
        `<p>${P2}</p>`,
      ].join(''),
    );

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowUp');
    await page.type('.ql-editor', 'AA');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.down(SHORTKEY);
    await page.keyboard.press('b');
    await page.keyboard.press('b');
    await page.keyboard.up(SHORTKEY);
    await page.type('.ql-editor', 'B');
    html = await page.$$eval('.ql-editor p', (paras) => paras[2].innerHTML);
    expect(html).toBe('ABA');
    await page.keyboard.down(SHORTKEY);
    await page.keyboard.press('b');
    await page.keyboard.up(SHORTKEY);
    await page.type('.ql-editor', 'C');
    await page.keyboard.down(SHORTKEY);
    await page.keyboard.press('b');
    await page.keyboard.up(SHORTKEY);
    await page.type('.ql-editor', 'D');
    html = await page.$$eval('.ql-editor p', (paras) => paras[2].innerHTML);
    expect(html).toBe('AB<strong>C</strong>DA');
    const selection = await page.evaluate(getSelectionInTextNode);
    expect(selection).toBe('["DA",1,"DA",1]');

    await page.click('#embed');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Enter');
    html = await page.$eval('.ql-editor', (e) => e.innerHTML);
    expect(html).toEqual(`<p>12 </p><p>${EMBED} 34</p>`);

    const windowScrollY = await page.$eval('html', (e) => e.scrollTop);
    await page.click('#content');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    const actualWindowScrollY = await page.$eval('html', (e) => e.scrollTop);

    expect(actualWindowScrollY).toBeGreaterThan(windowScrollY);

    await page.click('#updatSelection');
    await page.keyboard.press('Enter');
    const updatedWindowScrollY = await page.$eval('html', (e) => e.scrollTop);

    expect(updatedWindowScrollY).toBeLessThan(actualWindowScrollY);

    await browser.close();
  });
});

describe('table header: ', function () {
  it('cell should not be removed on typing if it is selected', async function () {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();

    await page.goto(`${HOST}/table_header.html`);
    await page.waitForSelector('.ql-editor', { timeout: 10000 });

    await page.click('[data-table-cell="3"]');

    await page.keyboard.down('Shift');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.up('Shift');

    await page.keyboard.press('c');

    const html = await page.$eval('.ql-editor', (e) => e.innerHTML);
    const sanitizeHtml = sanitizeTableHtml(html);
    expect(sanitizeHtml).toEqual(
      `
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
      `.replace(/\s/g, ''),
    );
  });
});

describe('table:', function () {
  it('cell should not be removed on typing if it is selected', async function () {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();

    await page.goto(`${HOST}/table.html`);
    await page.waitForSelector('.ql-editor', { timeout: 10000 });

    await page.click('[data-table-cell="3"]');

    await page.keyboard.down('Shift');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.up('Shift');

    await page.keyboard.press('c');

    const html = await page.$eval('.ql-editor', (e) => e.innerHTML);
    const sanitizeHtml = sanitizeTableHtml(html);
    expect(sanitizeHtml).toEqual(
      `
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
      `.replace(/\s/g, ''),
    );
  });

  it('backspace press on the position after table should remove an empty line and not add it to the cell', async function () {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();

    await page.goto(`${HOST}/table.html`);
    await page.waitForSelector('.ql-editor', { timeout: 10000 });

    await page.click('[data-table-cell="3"]');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Backspace');

    const html = await page.$eval('.ql-editor', (e) => e.innerHTML);
    const sanitizeHtml = sanitizeTableHtml(html);
    expect(sanitizeHtml).toEqual(
      `
        <table>
        <tbody>
          <tr>
            <td><p>1</p></td>
            <td><p>2</p></td>
            <td><p>3</p></td>
          </tr>
        </tbody>
        </table>
      `.replace(/\s/g, ''),
    );
  });

  it('backspace in multiline cell should work as usual', async function () {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();

    await page.goto(`${HOST}/table.html`);
    await page.waitForSelector('.ql-editor', { timeout: 10000 });

    await page.click('[data-table-cell="3"]');
    await page.keyboard.press('4');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');

    const html = await page.$eval('.ql-editor', (e) => e.innerHTML);
    const sanitizeHtml = sanitizeTableHtml(html);
    expect(sanitizeHtml).toEqual(
      `
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
      `.replace(/\s/g, ''),
    );
  });

  it('backspace press on the position after table should only move a caret to cell if next line is not empty', async function () {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();

    await page.goto(`${HOST}/table.html`);
    await page.waitForSelector('.ql-editor', { timeout: 10000 });

    await page.click('[data-table-cell="3"]');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('g');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('w');

    const html = await page.$eval('.ql-editor', (e) => e.innerHTML);
    const sanitizeHtml = sanitizeTableHtml(html);
    expect(sanitizeHtml).toEqual(
      `
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
      `.replace(/\s/g, ''),
    );
  });

  it('backspace press on the position after table should remove empty line and move caret to a cell if next line is empty', async function () {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();

    await page.goto(`${HOST}/table.html`);
    await page.waitForSelector('.ql-editor', { timeout: 10000 });

    await page.click('[data-table-cell="3"]');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('w');

    const html = await page.$eval('.ql-editor', (e) => e.innerHTML);
    const sanitizeHtml = sanitizeTableHtml(html);
    expect(sanitizeHtml).toEqual(
      `
        <table>
        <tbody>
          <tr>
            <td><p>1</p></td>
            <td><p>2</p></td>
            <td><p>3w</p></td>
          </tr>
        </tbody>
        </table>
      `.replace(/\s/g, ''),
    );
  });
});

// Copy/paste emulation des not working on Mac. See https://github.com/puppeteer/puppeteer/issues/1313
if (!isMac) {
  describe('List copy/pasting into table', function () {
    it('Should be no errors when list is pasted into table cell(T1155500)', async function () {
      const tableCellSelector = '[data-table-cell="2"]';
      const browser = await puppeteer.launch({
        headless: false,
      });
      const page = await browser.newPage();
      const pressKeyWithShortkey = async (keyName) => {
        await page.keyboard.down(SHORTKEY);
        await page.keyboard.press(keyName);
        await page.keyboard.up(SHORTKEY);
      };

      await page.goto(`${HOST}/table_copy_pasting.html`);
      await page.waitForSelector('.ql-editor', { timeout: 10000 });

      page.on('pageerror', () => {
        expect(true).toEqual(false);
      });

      pressKeyWithShortkey('c');
      await page.click(tableCellSelector);
      pressKeyWithShortkey('v');

      const liElementsCount = await page.$$eval('li', (e) => e.length);

      expect(liElementsCount).toEqual(4);
    });
  });
}

describe('Mutation content with table', function () {
  it('Should be no errors when table is inserted to editor (T1180959)', async function () {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();

    await page.goto(`${HOST}/table_drag_drop.html`);
    await page.waitForSelector('.ql-editor', { timeout: 10000 });

    page.on('pageerror', () => {
      expect(true).toEqual(false);
    });

    await page.evaluate(() => {
      const editor = document.querySelector('.ql-editor');

      const table = document.createElement('table');

      table.innerHTML = '<tbody><tr><td><p><br/></p></td><td><p>Custom text</p></td></tr></tbody>';

      editor.appendChild(table);
    });

    expect(true).toEqual(true);
  });
});

function getSelectionInTextNode() {
  const {
    anchorNode, anchorOffset, focusNode, focusOffset,
  } = document.getSelection();
  return JSON.stringify([
    anchorNode.data,
    anchorOffset,
    focusNode.data,
    focusOffset,
  ]);
}
