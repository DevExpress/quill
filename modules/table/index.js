import Delta from 'quill-delta';
import { Scope } from 'parchment';
import Quill from '../../core/quill';
import Module from '../../core/module';
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
} from '../../formats/table';
import isDefined from '../../utils/is_defined';
import { deltaEndsWith, applyFormat } from '../clipboard';
import makeTableArrowHandler from './utils/make_table_arrow_handler';
import prepareAttributeMatcher from './utils/prepare_attr_matcher';
import { TABLE_FORMATS } from '../../formats/table/attributors/table';
import { CELL_FORMATS } from '../../formats/table/attributors/cell';

const EMPTY_RESULT = [null, null, null, -1];

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

    [TABLE_FORMATS, CELL_FORMATS].forEach(formats => {
      Object.keys(formats).forEach(name => {
        Quill.register({ [`formats/${name}`]: formats[name] }, true);
      });
    });
  }

  constructor(...args) {
    super(...args);

    this.tableBlots = [CellLine.blotName, HeaderCellLine.blotName];

    this.tableBlots.forEach(blotName => {
      this.quill.editor.addImmediateFormat(blotName);
    });
    this.integrateClipboard();
    this.addKeyboardHandlers();

    this.listenBalanceCells();
  }

  integrateClipboard() {
    this.tableBlots.forEach(blotName => {
      this.quill.clipboard.addTableBlot(blotName);
    });

    this.quill.clipboard.addMatcher('td, th', matchCell);
    this.quill.clipboard.addMatcher('table', prepareAttributeMatcher('table'));
    this.quill.clipboard.addMatcher('td, th', prepareAttributeMatcher('cell'));
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
      return EMPTY_RESULT;
    }

    const [cellLine, offset] = this.quill.getLine(range.index);
    if (
      !isDefined(cellLine) ||
      this.tableBlots.indexOf(cellLine.statics.blotName) === -1
    ) {
      return EMPTY_RESULT;
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
      new Array(columns).fill('\n').forEach(text => {
        memo.insert(text, {
          tableCellLine: { row: rowId, cell: tableId() },
        });
      });
      return memo;
    }, new Delta().retain(range.index));
    this.quill.updateContents(delta, Quill.sources.USER);
    this.quill.setSelection(range.index, Quill.sources.SILENT);
    this.balanceTables();
  }

  tableFormats() {
    return this.tableBlots;
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
    handler(range) {
      const [line] = this.quill.getLine(range.index);
      if (
        !line.prev ||
        ['tableCellLine', 'tableHeaderCellLine'].indexOf(
          line.prev.statics.blotName,
        ) === -1
      ) {
        return false;
      }
      return true;
    },
  },
  'table delete': {
    key: 'del',
    format: ['tableCellLine', 'tableHeaderCellLine'],
    collapsed: true,
    suffix: /^$/,
    handler() {},
  },
  'table cell enter': {
    key: 'enter',
    shiftKey: null,
    format: ['tableCellLine', 'tableHeaderCellLine'],
    handler(range, context) {
      if (this.quill.selection?.composing) return;
      if (range.length > 0) {
        this.quill.scroll.deleteAt(range.index, range.length);
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
      this.quill.insertText(
        range.index,
        '\n',
        lineFormats.tableCellLine,
        Quill.sources.USER,
      );
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
  'table down': makeTableArrowHandler(false, [
    'tableCellLine',
    'tableHeaderCellLine',
  ]),
  'table up': makeTableArrowHandler(true, [
    'tableCellLine',
    'tableHeaderCellLine',
  ]),
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

export default Table;
