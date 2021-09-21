import Delta from 'quill-delta';
import Quill from '../../../core/quill';

export default function insertParagraphBelow({ quill, index, table }) {
  const insertIndex = index + table.length();
  const delta = new Delta().retain(insertIndex).insert('\n');
  quill.updateContents(delta, Quill.sources.USER);
  quill.setSelection(insertIndex, Quill.sources.USER);
}
