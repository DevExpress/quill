import { Selector } from 'testcafe';

export const isMac = process.platform === 'darwin';

export interface CustomSelector extends Selector {
  innerHTML: Promise<string>;
}

export function getEditorSelector(selector: string) {
  return <CustomSelector>Selector(selector).addCustomDOMProperties({
    innerHTML: el => el.innerHTML.replace(/&nbsp;/g, ' ')
  });
}

export function sanitizeHtml(html: string | string[]): string {
  const input = typeof html === 'string' ? html : html.join('');

  return input.replace(/&nbsp;/g, ' ');
}

export function sanitizeTableHtml(html: string) {
  return html.replace(/(<\w+)((\s+class\s*=\s*"[^"]*")|(\s+data-[\w-]+\s*=\s*"[^"]*"))*(\s*>)/gi, '$1$5');
}

export async function pressKeyCombination(t: TestController, key: string, count: number, modifier?: string) {
  for (let k = 0; k < count; k++) {
    await t.pressKey(modifier ? `${modifier}+${key}` : key);
  }
}

export async function moveCaretToStart(t: TestController) {
  await pressKeyCombination(t, 'up', 20);
}

export function getSelectionInTextNode() {
  const {
    anchorNode, anchorOffset, focusNode, focusOffset,
  } = document.getSelection();
  return JSON.stringify([
    // @ts-ignore
    anchorNode.data,
    anchorOffset,
    // @ts-ignore
    focusNode.data,
    focusOffset,
  ]);
}
