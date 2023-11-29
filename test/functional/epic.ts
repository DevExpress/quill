import {
  getEditorSelector,
  sanitizeHtml,
  pressKeyCombination,
  moveCaretToStart,
  getSelectionInTextNode,
  isMac,
} from './helpers';
import url from './helpers/getPageUrl';

fixture`HtmlEditor - epic`
  .page(url(__dirname, './example/index.html'));

const SHORTKEY = isMac ? 'meta' : 'ctrl';
const P1 = 'Call me Ishmael. Some years ago—never mind how long precisely-having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to sea as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the ship. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the ocean with me.';
const P2 = 'There now is your insular city of the Manhattoes, belted round by wharves as Indian isles by coral reefs—commerce surrounds it with her surf. Right and left, the streets take you waterward. Its extreme downtown is the battery, where that noble mole is washed by waves, and cooled by breezes, which a few hours previous were out of sight of land. Look at the crowds of water-gazers there.';
const CHAPTER = 'Chapter 1. Loomings.';
const GUARD_CHAR = '\uFEFF';
const EMBED = `<span>${GUARD_CHAR}<span contenteditable="false"><span contenteditable="false">#test</span></span>${GUARD_CHAR}</span>`;

test('compose an epic', async (t) => {
  const editor = getEditorSelector('.ql-editor');

  await t.typeText(editor, 'The Whale')
    .expect(editor.innerHTML)
    .eql('<p>The Whale</p>')
    .pressKey('enter')
    .expect(editor.innerHTML)
    .eql('<p>The Whale</p><p><br></p>')
    .pressKey('enter')
    .pressKey('tab')
    .typeText('.ql-editor', P1)
    .pressKey('enter')
    .pressKey('enter')
    .typeText('.ql-editor', P2)
    .expect(editor.innerHTML)
    .eql(sanitizeHtml(
      [
        '<p>The Whale</p>',
        '<p><br></p>',
        `<p>\t${P1}</p>`,
        '<p><br></p>',
        `<p>${P2}</p>`,
      ],
    ));

  await moveCaretToStart(t);

  await t.pressKey('down')
    .pressKey('enter')
    .typeText('.ql-editor', CHAPTER)
    .pressKey('enter')
    .expect(editor.innerHTML)
    .eql(sanitizeHtml(
      [
        '<p>The Whale</p>',
        '<p><br></p>',
        `<p>${CHAPTER}</p>`,
        '<p><br></p>',
        `<p>\t${P1}</p>`,
        '<p><br></p>',
        `<p>${P2}</p>`,
      ],
    ));

  await moveCaretToStart(t);

  await t.pressKey('right')
    .pressKey('right')
    .pressKey('right')
    .pressKey('right')
    .pressKey('backspace')
    .pressKey('backspace')
    .pressKey('backspace')
    .pressKey('backspace')
    .expect(editor.innerHTML)
    .eql(sanitizeHtml(
      [
        '<p>Whale</p>',
        '<p><br></p>',
        `<p>${CHAPTER}</p>`,
        '<p><br></p>',
        `<p>\t${P1}</p>`,
        '<p><br></p>',
        `<p>${P2}</p>`,
      ],
    ));

  await t.pressKey('delete')
    .pressKey('delete')
    .pressKey('delete')
    .pressKey('delete')
    .pressKey('delete')
    .expect(editor.innerHTML)
    .eql(sanitizeHtml(
      [
        '<p><br></p>',
        '<p><br></p>',
        `<p>${CHAPTER}</p>`,
        '<p><br></p>',
        `<p>\t${P1}</p>`,
        '<p><br></p>',
        `<p>${P2}</p>`,
      ],
    ));

  await t.pressKey('delete')
    .expect(editor.innerHTML)
    .eql(sanitizeHtml(
      [
        '<p><br></p>',
        `<p>${CHAPTER}</p>`,
        '<p><br></p>',
        `<p>\t${P1}</p>`,
        '<p><br></p>',
        `<p>${P2}</p>`,
      ],
    ));

  await t.click('#bold')
    .click('#italic')
    .expect(editor.innerHTML)
    .eql(sanitizeHtml(
      [
        '<p><strong><em><span class="ql-cursor">\uFEFF</span></em></strong></p>',
        `<p>${CHAPTER}</p>`,
        '<p><br></p>',
        `<p>\t${P1}</p>`,
        '<p><br></p>',
        `<p>${P2}</p>`,
      ],
    ));

  await t.typeText('.ql-editor', 'Moby Dick')
    .expect(editor.innerHTML)
    .eql(sanitizeHtml(
      [
        '<p><strong><em>Moby Dick</em></strong></p>',
        `<p>${CHAPTER}</p>`,
        '<p><br></p>',
        `<p>\t${P1}</p>`,
        '<p><br></p>',
        `<p>${P2}</p>`,
      ],
    ));

  await t.pressKey('right');
  await pressKeyCombination(t, 'right', CHAPTER.length, 'shift');
  await t.pressKey(`${SHORTKEY}+b`)
    .expect(editor.innerHTML)
    .eql(sanitizeHtml(
      [
        '<p><strong><em>Moby Dick</em></strong></p>',
        `<p><strong>${CHAPTER}</strong></p>`,
        '<p><br></p>',
        `<p>\t${P1}</p>`,
        '<p><br></p>',
        `<p>${P2}</p>`,
      ],
    ));

  await t.pressKey('up')
    .click('#header')
    .expect(editor.innerHTML)
    .eql(sanitizeHtml(
      [
        '<h1><strong><em>Moby Dick</em></strong></h1>',
        `<p><strong>${CHAPTER}</strong></p>`,
        '<p><br></p>',
        `<p>\t${P1}</p>`,
        '<p><br></p>',
        `<p>${P2}</p>`,
      ],
    ));

  await t.pressKey('down')
    .pressKey('down')
    .pressKey('enter')
    .pressKey('enter')
    .pressKey('up')
    .typeText('.ql-editor', 'AA')
    .pressKey('left')
    .pressKey(`${SHORTKEY}+b`)
    .pressKey(`${SHORTKEY}+b`)
    .typeText('.ql-editor', 'B')
    .expect(editor.innerHTML)
    .eql(sanitizeHtml(
      [
        '<h1><strong><em>Moby Dick</em></strong></h1>',
        `<p><strong>${CHAPTER}</strong></p>`,
        '<p><br></p>',
        '<p>ABA</p>',
        '<p><br></p>',
        `<p>\t${P1}</p>`,
        '<p><br></p>',
        `<p>${P2}</p>`,
      ],
    ));

  await t.pressKey(`${SHORTKEY}+b`)
    .typeText('.ql-editor', 'C')
    .pressKey(`${SHORTKEY}+b`)
    .typeText('.ql-editor', 'D')
    .expect(editor.innerHTML)
    .eql(sanitizeHtml(
      [
        '<h1><strong><em>Moby Dick</em></strong></h1>',
        `<p><strong>${CHAPTER}</strong></p>`,
        '<p><br></p>',
        '<p>AB<strong>C</strong>DA</p>',
        '<p><br></p>',
        `<p>\t${P1}</p>`,
        '<p><br></p>',
        `<p>${P2}</p>`,
      ],
    ));

  const selection = await t.eval(getSelectionInTextNode);
  await t.expect(selection)
    .eql('["DA",1,"DA",1]');

  await t.click('#embed')
    .pressKey('left')
    .pressKey('enter')
    .expect(editor.innerHTML)
    .eql(sanitizeHtml(`<p>12 </p><p>${EMBED} 34</p>`));

  const windowScrollY = await editor.scrollTop;

  await t.click('#content')
    .pressKey('enter')
    .pressKey('enter')
    .pressKey('enter');

  const actualWindowScrollY = await editor.scrollTop;

  await t.expect(actualWindowScrollY)
    .gte(windowScrollY);

  await t.click('#updatSelection')
    .pressKey('enter');

  const updatedWindowScrollY = await editor.scrollTop;

  await t.expect(updatedWindowScrollY)
    .gte(actualWindowScrollY);
});
