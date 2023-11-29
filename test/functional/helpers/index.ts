import { Selector } from 'testcafe';

export const isMac = process.platform === 'darwin';

export interface CustomSelector extends Selector {
  innerHTML: Promise<string>;
}

export function getEditorSelector(selector: string) {
  return <CustomSelector>Selector(selector).addCustomDOMProperties({
    innerHTML: (el) => el.innerHTML.replace(/&nbsp;/g, ' '),
  });
}

export function sanitizeHtml(html: string | string[]): string {
  const input = typeof html === 'string' ? html : html.join('');

  return input.replace(/&nbsp;/g, ' ');
}

export function sanitizeTableHtml(html: string) {
  return html.replace(/(<\w+)((\s+class\s*=\s*"[^"]*")|(\s+data-[\w-]+\s*=\s*"[^"]*"))*(\s*>)/gi, '$1$5');
}

export function pressKeyCombination(
  t: TestController, key: string, count: number, modifier?: string,
) {
  return Promise.all(
    Array(count)
      .fill(0)
      // without async we get a testcafe error
      .map(async () => t.pressKey(modifier ? `${modifier}+${key}` : key)),
  );
}

export async function moveCaretToStart(t: TestController) {
  await pressKeyCombination(t, 'up', 20);
}

type DataNode = Node & { data: string };
export function getSelectionInTextNode() {
  const {
    anchorNode, anchorOffset, focusNode, focusOffset,
  } = document.getSelection();
  return JSON.stringify([
    (anchorNode as DataNode).data,
    anchorOffset,
    (focusNode as DataNode).data,
    focusOffset,
  ]);
}
