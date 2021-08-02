import { Selector } from 'testcafe';

// eslint-disable-next-line no-undef
fixture`Embed`.page('./index.html');

// eslint-disable-next-line no-undef
test('left arrow key should pass through embed', async t => {
  const target = Selector('.ql-editor');
  const button = Selector('#btn');

  await t
    .click(button)
    .pressKey('left')
    .pressKey('enter')
    .expect(target.innerText)
    .eql('12 \n\n\uFEFF#test\uFEFF 34');
});
