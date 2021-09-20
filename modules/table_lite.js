import Delta from 'quill-delta';
import Quill from '../core/quill';
import Module from '../core/module';
import {
  TableCell,
  TableRow,
  TableBody,
  TableContainer,
  tableId,
  TableHeaderCell,
  TableHeaderRow,
  TableHeader,
  TABLE_TAGS,
} from '../formats/table/lite';
import { applyFormat } from './clipboard';
import isDefined from '../utils/isDefined';

const ELEMENT_NODE = 1;

class TableLite extends Module {
  static register() {
    Quill.register(TableHeaderCell);
    Quill.register(TableCell);
    Quill.register(TableHeaderRow);
    Quill.register(TableRow);
    Quill.register(TableBody);
    Quill.register(TableHeader);
    Quill.register(TableContainer);
  }

  constructor(...args) {
    super(...args);

    this.quill.clipboard.addTableBlot(TableCell.blotName);
    this.quill.clipboard.addTableBlot(TableHeaderCell.blotName);
    console.log('add matcher');

    this.quill.clipboard.addMatcher('tr', matchTable);
    this.quill.clipboard.addMatcher(ELEMENT_NODE, matchDimensions);

    this.listenBalanceCells();
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

    const [cell, offset] = this.quill.getLine(range.index);
    const allowedBlots = [TableCell.blotName, TableHeaderCell.blotName];
    if (
      !isDefined(cell) ||
      allowedBlots.indexOf(cell.statics.blotName) === -1
    ) {
      return [null, null, null, -1];
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

    const delta = new Array(rows).fill(0).reduce(memo => {
      const text = new Array(columns).fill('\n').join('');
      return memo.insert(text, { table: tableId() });
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

function matchTable(node, delta) {
  const table =
    node.parentNode.tagName === 'TABLE'
      ? node.parentNode
      : node.parentNode.parentNode;
  const isHeaderRow = node.parentNode.tagName === 'THEAD' ? true : null;
  const rows = Array.from(table.querySelectorAll('tr'));
  const row = rows.indexOf(node) + 1;
  return applyFormat(delta, isHeaderRow ? 'tableHeaderCell' : 'table', row);
}

function matchDimensions(node, delta) {
  const isTableNode = TABLE_TAGS.indexOf(node.tagName) !== -1;
  return delta.reduce((newDelta, op) => {
    const isEmbed = typeof op.insert === 'object';
    const attributes = op.attributes || {};
    const { width, height, ...rest } = attributes;
    const formats =
      attributes.table || attributes.tableHeaderCell || isTableNode || isEmbed
        ? attributes
        : { ...rest };
    return newDelta.insert(op.insert, formats);
  }, new Delta());
}

export default TableLite;
