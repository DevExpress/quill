import Delta from 'quill-delta';
import Quill from '../../../core/quill';

export default function insertParagraphAbove({ quill, index, range }) {
  const insertIndex = index - 1;
  const delta = new Delta().retain(insertIndex).insert('\n');
  quill.updateContents(delta, Quill.sources.USER);
  quill.setSelection(range.index + 1, range.length, Quill.sources.SILENT);
}
