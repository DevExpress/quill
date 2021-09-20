import Delta from 'quill-delta';
import { Scope } from 'parchment';
import Quill from '../core/quill';
import Module from '../core/module';
import {
  CellLine,
  TableCell,
  TableRow,
  TableBody,
  TableContainer,
  tableId,
  TableHeaderCell,
  TableHeaderRow,
  TableHeader,
  HeaderCellLine,
  TABLE_TAGS,
} from '../formats/table';
import isDefined from '../utils/is_defined';
import { deltaEndsWith, applyFormat } from './clipboard';

const ELEMENT_NODE = 1;

class Table extends Module {
  static register() {
    Quill.register(CellLine, true);
    Quill.register(HeaderCellLine, true);
    Quill.register(TableHeaderCell, true);
    Quill.register(TableCell, true);
    Quill.register(TableHeaderRow, true);
    Quill.register(TableRow, true);
    Quill.register(TableBody, true);
    Quill.register(TableHeader, true);
    Quill.register(TableContainer, true);
  }

  constructor(...args) {
    super(...args);

    this.integrateClipboard();
    this.addKeyboardHandlers();

    this.listenBalanceCells();
  }

  integrateClipboard() {
    this.quill.clipboard.addTableBlot(CellLine.blotName);
    this.quill.clipboard.addTableBlot(TableHeaderCell.blotName);
    this.quill.clipboard.addMatcher('td, th', matchCell);
    this.quill.clipboard.addMatcher(ELEMENT_NODE, matchDimensions);
  }

  addKeyboardHandlers() {
    const bindings = Table.keyboardBindings;
    Object.keys(bindings).forEach(name => {
      if (bindings[name]) {
        this.quill.keyboard.addBinding(bindings[name]);
      }
    });
  }

  balanceTables() {
    this.quill.scroll.descendants(TableContainer).forEach(table => {
      table.balanceCells();
    });
  }

  deleteColumn() {
    const [table, , cell] = this.getTable();
    if (!isDefined(cell)) {
      return;
    }

    table.deleteColumn(cell.cellOffset());
    this.quill.update(Quill.sources.USER);
  }

  deleteRow() {
    const [, row] = this.getTable();
    if (!isDefined(row)) {
      return;
    }

    row.remove();
    this.quill.update(Quill.sources.USER);
  }

  deleteTable() {
    const [table] = this.getTable();
    if (!isDefined(table)) {
      return;
    }

    const offset = table.offset();
    table.remove();
    this.quill.update(Quill.sources.USER);
    this.quill.setSelection(offset, Quill.sources.SILENT);
  }

  getTable(range = this.quill.getSelection()) {
    if (!isDefined(range)) {
      return [null, null, null, -1];
    }

    const [cellLine, offset] = this.quill.getLine(range.index);
    const allowedBlots = [CellLine.blotName, HeaderCellLine.blotName];
    if (
      !isDefined(cellLine) ||
      allowedBlots.indexOf(cellLine.statics.blotName) === -1
    ) {
      return [null, null, null, -1];
    }

    const cell = cellLine.parent;
    const row = cell.parent;
    const table = row.parent.parent;
    return [table, row, cell, offset];
  }

  insertColumn(offset) {
    const range = this.quill.getSelection();
    const [table, row, cell] = this.getTable(range);
    if (!isDefined(cell)) {
      return;
    }

    const column = cell.cellOffset();
    table.insertColumn(column + offset);
    this.quill.update(Quill.sources.USER);
    let shift = row.rowOffset();
    if (offset === 0) {
      shift += 1;
    }
    this.quill.setSelection(
      range.index + shift,
      range.length,
      Quill.sources.SILENT,
    );
  }

  insertColumnLeft() {
    this.insertColumn(0);
  }

  insertColumnRight() {
    this.insertColumn(1);
  }

  insertRow(offset) {
    const range = this.quill.getSelection();
    const [table, row, cell] = this.getTable(range);
    if (!isDefined(cell)) {
      return;
    }

    const index = row.rowOffset();
    table.insertRow(index + offset);
    this.quill.update(Quill.sources.USER);
    if (offset > 0) {
      this.quill.setSelection(range, Quill.sources.SILENT);
    } else {
      this.quill.setSelection(
        range.index + row.children.length,
        range.length,
        Quill.sources.SILENT,
      );
    }
  }

  insertRowAbove() {
    this.insertRow(0);
  }

  insertRowBelow() {
    this.insertRow(1);
  }

  insertHeaderRow() {
    const range = this.quill.getSelection();
    const [table, , cell] = this.getTable(range);
    if (!isDefined(cell)) {
      return;
    }

    table.insertHeaderRow();
    this.quill.update(Quill.sources.USER);
  }

  insertTable(rows, columns) {
    const range = this.quill.getSelection();
    if (!isDefined(range)) {
      return;
    }

    const delta = new Array(rows).fill(0).reduce(memo => {
      const rowId = tableId();
      const text = new Array(columns).fill('\n').join('');
      return memo.insert(text, {
        tableCellLine: { row: rowId, cell: tableId() },
      });
    }, new Delta().retain(range.index));
    this.quill.updateContents(delta, Quill.sources.USER);
    this.quill.setSelection(range.index, Quill.sources.SILENT);
    this.balanceTables();
  }

  listenBalanceCells() {
    this.quill.on(Quill.events.SCROLL_OPTIMIZE, mutations => {
      mutations.some(mutation => {
        if (
          ['TD', 'TH', 'TR', 'TBODY', 'THEAD', 'TABLE'].indexOf(
            mutation.target.tagName,
          ) !== -1
        ) {
          this.quill.once(Quill.events.TEXT_CHANGE, (delta, old, source) => {
            if (source !== Quill.sources.USER) return;
            this.balanceTables();
          });
          return true;
        }
        return false;
      });
    });

    this.quill.on(Quill.events.CONTENT_SETTED, () => {
      this.quill.once(Quill.events.TEXT_CHANGE, () => {
        this.balanceTables();
      });
    });
  }
}

Table.keyboardBindings = {
  'table backspace': {
    key: 'backspace',
    format: ['tableCellLine', 'tableHeaderCellLine'],
    collapsed: true,
    offset: 0,
    handler() {},
  },
  'table delete': {
    key: 'del',
    format: ['tableCellLine', 'tableHeaderCellLine'],
    collapsed: true,
    suffix: /^$/,
    handler() {},
  },
  'table-cell-line enter': {
    key: 'enter',
    shiftKey: null,
    format: ['tableCellLine'],
    handler(range, context) {
      // bugfix: a unexpected new line inserted when user compositionend with hitting Enter
      if (this.quill.selection && this.quill.selection.composing) return;
      if (range.length > 0) {
        this.quill.scroll.deleteAt(range.index, range.length); // So we do not trigger text-change
      }
      const lineFormats = Object.keys(context.format).reduce(
        (formats, format) => {
          if (
            this.quill.scroll.query(format, Scope.BLOCK) &&
            !Array.isArray(context.format[format])
          ) {
            formats[format] = context.format[format];
          }
          return formats;
        },
        {},
      );
      // insert new cellLine with lineFormats
      this.quill.insertText(
        range.index,
        '\n',
        lineFormats.tableCellLine,
        Quill.sources.USER,
      );
      // Earlier scroll.deleteAt might have messed up our selection,
      // so insertText's built in selection preservation is not reliable
      this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
      this.quill.focus();
      Object.keys(context.format).forEach(name => {
        if (lineFormats[name] != null) return;
        if (Array.isArray(context.format[name])) return;
        if (name === 'link') return;
        this.quill.format(name, context.format[name], Quill.sources.USER);
      });
    },
  },
  'table header enter': {
    key: 'enter',
    shiftKey: null,
    format: ['tableHeaderCellLine'],
    handler(range) {
      const module = this.quill.getModule('table');
      if (module) {
        const { quill } = this;
        const [table, row, cell, offset] = module.getTable(range);
        const shift = tableSide(row, cell, offset);

        if (shift == null) {
          return;
        }

        const index = table.offset();
        const hasBody = table.children.length > 1 && table.children.tail;
        if (shift < 0 || (shift > 0 && hasBody)) {
          insertParagraphAbove({ quill, index, range });
        } else {
          insertParagraphBelow({ quill, index, table });
        }
      }
    },
  },
  'table tab': {
    key: 'tab',
    shiftKey: null,
    format: ['tableCellLine', 'tableHeaderCellLine'],
    handler(range, context) {
      const { event, line: cell } = context;
      const offset = cell.offset(this.quill.scroll);
      if (event.shiftKey) {
        this.quill.setSelection(offset - 1, Quill.sources.USER);
      } else {
        this.quill.setSelection(offset + cell.length(), Quill.sources.USER);
      }
    },
  },
  'table down': makeTableArrowHandler(false),
  'table up': makeTableArrowHandler(true),
};

function matchCell(node, delta) {
  const row = node.parentNode;
  const table =
    row.parentNode.tagName === 'TABLE'
      ? row.parentNode
      : row.parentNode.parentNode;
  const isHeaderRow = row.parentNode.tagName === 'THEAD' ? true : null;
  const rows = Array.from(table.querySelectorAll('tr'));
  const cells = Array.from(row.querySelectorAll('th,td'));
  const rowId = rows.indexOf(row) + 1;
  const cellId = cells.indexOf(node) + 1;
  const cellLineBlotName = isHeaderRow
    ? 'tableHeaderCellLine'
    : 'tableCellLine';

  if (delta.length() === 0) {
    delta = new Delta().insert('\n', {
      [cellLineBlotName]: { row: rowId, cell: cellId },
    });
    return delta;
  }
  if (!deltaEndsWith(delta, '\n')) {
    delta.insert('\n');
  }

  return applyFormat(delta, cellLineBlotName, { row: rowId, cell: cellId });
}

function matchDimensions(node, delta) {
  const isTableNode = TABLE_TAGS.indexOf(node.tagName) !== -1;
  return delta.reduce((newDelta, op) => {
    const isEmbed = typeof op.insert === 'object';
    const attributes = op.attributes || {};
    const { width, height, ...rest } = attributes;
    const formats =
      attributes.tableCellLine ||
      attributes.tableHeaderCellLine ||
      attributes.tableCell ||
      attributes.tableHeaderCell ||
      isTableNode ||
      isEmbed
        ? attributes
        : { ...rest };
    return newDelta.insert(op.insert, formats);
  }, new Delta());
}

function makeTableArrowHandler(up) {
  return {
    key: up ? 'upArrow' : 'downArrow',
    collapsed: true,
    format: ['table', 'tableHeaderCell'],
    handler(range, context) {
      const key = up ? 'prev' : 'next';
      const cell = context.line;
      const targetRow = cell.parent[key];
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

function tableSide(row, cell, offset) {
  if (row.prev == null && row.next == null) {
    if (cell.prev == null && cell.next == null) {
      return offset === 0 ? -1 : 1;
    }
    return cell.prev == null ? -1 : 1;
  }
  if (row.prev == null) {
    return -1;
  }
  if (row.next == null) {
    return 1;
  }
  return null;
}

function insertParagraphAbove({ quill, index, range }) {
  const insertIndex = index - 1;
  const delta = new Delta().retain(insertIndex).insert('\n');
  quill.updateContents(delta, Quill.sources.USER);
  quill.setSelection(range.index + 1, range.length, Quill.sources.SILENT);
}

function insertParagraphBelow({ quill, index, table }) {
  const insertIndex = index + table.length();
  const delta = new Delta().retain(insertIndex).insert('\n');
  quill.updateContents(delta, Quill.sources.USER);
  quill.setSelection(insertIndex, Quill.sources.USER);
}

export default Table;
