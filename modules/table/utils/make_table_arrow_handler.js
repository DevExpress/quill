import Quill from '../../../core/quill';

export default function makeTableArrowHandler(up, formats) {
  return {
    key: up ? 'upArrow' : 'downArrow',
    collapsed: true,
    format: formats,
    handler(range, context) {
      const key = up ? 'prev' : 'next';
      const { line } = context;
      const cell =
        line.statics.blotName.indexOf('Line') > -1 ? line.parent : line;
      const targetTablePart = cell.parent.parent[key];
      const targetRow = cell.parent[key] || targetTablePart?.children.head;
      if (targetRow != null) {
        if (
          targetRow.statics.blotName === 'tableRow' ||
          targetRow.statics.blotName === 'tableHeaderRow'
        ) {
          let targetCell = targetRow.children.head;
          let cur = cell;
          while (cur.prev != null) {
            cur = cur.prev;
            targetCell = targetCell.next;
          }
          const index =
            targetCell.offset(this.quill.scroll) +
            Math.min(context.offset, targetCell.length() - 1);
          this.quill.setSelection(index, 0, Quill.sources.USER);
        }
      } else {
        const targetLine = cell.table()[key];
        if (targetLine != null) {
          if (up) {
            this.quill.setSelection(
              targetLine.offset(this.quill.scroll) + targetLine.length() - 1,
              0,
              Quill.sources.USER,
            );
          } else {
            this.quill.setSelection(
              targetLine.offset(this.quill.scroll),
              0,
              Quill.sources.USER,
            );
          }
        }
      }
      return false;
    },
  };
}
