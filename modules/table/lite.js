import Delta from 'quill-delta';
import Quill from '../../core/quill';
import Module from '../../core/module';
import {
  TableCell,
  TableRow,
  TableBody,
  TableContainer,
  tableId,
  TableHeaderCell,
  TableHeaderRow,
  TableHeader,
} from '../../formats/table/lite';
import { applyFormat } from '../clipboard';
import isDefined from '../../utils/is_defined';
import makeTableArrowHandler from './utils/make_table_arrow_handler';
import insertParagraphAbove from './utils/insert_pr_below';
import insertParagraphBelow from './utils/insert_pr_above';
import tableSide from './utils/table_side';
import {
  prepareAttributeMatcher,
  prepareCellAttributeMatcher,
} from './utils/prepare_attr_matcher';
import {
  TABLE_ATTRIBUTORS,
  TABLE_FORMATS,
} from '../../formats/table/attributors/table';
import {
  CELL_ATTRIBUTORS,
  CELL_FORMATS,
} from '../../formats/table/attributors/cell';

const EMPTY_RESULT = [null, null, null, -1];

class TableLite extends Module {
  static register() {
    Quill.register(TableHeaderCell, true);
    Quill.register(TableCell, true);
    Quill.register(TableHeaderRow, true);
    Quill.register(TableRow, true);
    Quill.register(TableBody, true);
    Quill.register(TableHeader, true);
    Quill.register(TableContainer, true);

    [TABLE_FORMATS, CELL_FORMATS].forEach((formats) => {
      Object.keys(formats).forEach((name) => {
        Quill.register({ [`formats/${name}`]: formats[name] }, true);
      });
    });
  }

  constructor(...args) {
    super(...args);

    this.tableBlots = [TableCell.blotName, TableHeaderCell.blotName];

    this.tableBlots.forEach((blotName) => {
      this.quill.editor.addImmediateFormat(blotName);
    });
    this.integrateClipboard();
    this.addKeyboardHandlers();

    this.listenBalanceCells();
  }

  integrateClipboard() {
    this.tableBlots.forEach((blotName) => this.quill.clipboard.addTableBlot(blotName));

    this.quill.clipboard.addMatcher('tr', matchTable);
    this.quill.clipboard.addMatcher(
      'table',
      prepareAttributeMatcher(TABLE_ATTRIBUTORS),
    );
    this.quill.clipboard.addMatcher(
      'td, th',
      prepareCellAttributeMatcher(CELL_ATTRIBUTORS),
    );
  }

  addKeyboardHandlers() {
    const bindings = TableLite.keyboardBindings;
    Object.keys(bindings).forEach((name) => {
      if (bindings[name]) {
        this.quill.keyboard.addBinding(bindings[name]);
      }
    });
  }

  balanceTables() {
    this.quill.scroll.descendants(TableContainer).forEach((table) => {
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

    const [cell, offset] = this.quill.getLine(range.index);
    if (
      !isDefined(cell)
      || this.tableBlots.indexOf(cell.statics.blotName) === -1
    ) {
      return EMPTY_RESULT;
    }

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

    const delta = new Array(rows).fill(0).reduce((memo) => {
      const text = new Array(columns).fill('\n').join('');
      return memo.insert(text, { table: tableId() });
    }, new Delta().retain(range.index));
    this.quill.updateContents(delta, Quill.sources.USER);
    this.quill.setSelection(range.index, Quill.sources.SILENT);
    this.balanceTables();
  }

  tableFormats() {
    return this.tableBlots;
  }

  listenBalanceCells() {
    this.quill.on(Quill.events.SCROLL_OPTIMIZE, (mutations) => {
      mutations.some((mutation) => {
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

TableLite.keyboardBindings = {
  'table backspace': {
    key: 'backspace',
    format: ['table', 'tableHeaderCell'],
    collapsed: true,
    offset: 0,
    handler() {},
  },
  'table delete': {
    key: 'del',
    format: ['table', 'tableHeaderCell'],
    collapsed: true,
    suffix: /^$/,
    handler() {},
  },
  'table enter': {
    key: 'enter',
    shiftKey: null,
    format: ['table'],
    handler(range) {
      const module = this.quill.getModule('table');
      if (module) {
        const { quill } = this;
        const [table, row, cell, offset] = module.getTable(range);
        const shift = tableSide(row, cell, offset);
        const hasHead = table.children.length > 1 && table.children.head;

        if (shift == null || (shift < 0 && hasHead)) {
          return;
        }

        const index = table.offset();
        if (shift < 0) {
          insertParagraphAbove({ quill, index, range });
        } else {
          insertParagraphBelow({ quill, index, table });
        }
      }
    },
  },
  'table header enter': {
    key: 'enter',
    shiftKey: null,
    format: ['tableHeaderCell'],
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
    format: ['table', 'tableHeaderCell'],
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
  'table down': makeTableArrowHandler(false, ['table', 'tableHeaderCell']),
  'table up': makeTableArrowHandler(true, ['table', 'tableHeaderCell']),
};

function matchTable(node, delta) {
  const table = node.parentNode.tagName === 'TABLE'
    ? node.parentNode
    : node.parentNode.parentNode;
  const isHeaderRow = node.parentNode.tagName === 'THEAD' ? true : null;
  const rows = Array.from(table.querySelectorAll('tr'));
  const row = rows.indexOf(node) + 1;
  return applyFormat(delta, isHeaderRow ? 'tableHeaderCell' : 'table', row);
}

export default TableLite;
