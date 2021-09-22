import Block from '../../blots/block';
import Break from '../../blots/break';
import Container from '../../blots/container';
import isDefined from '../../utils/is_defined';
import getId from './get_id';

const CELL_IDENTITY_KEYS = ['row', 'cell'];
const TABLE_TAGS = ['TD', 'TH', 'TR', 'TBODY', 'THEAD', 'TABLE'];

class CellLine extends Block {
  static create(value) {
    const node = super.create(value);
    CELL_IDENTITY_KEYS.forEach(key => {
      const identityMarker = key === 'row' ? tableId : cellId;
      node.setAttribute(`data-${key}`, value[key] ?? identityMarker());
    });

    return node;
  }

  static formats(domNode) {
    return CELL_IDENTITY_KEYS.reduce((formats, attribute) => {
      const attrName = `data-${attribute}`;
      if (domNode.hasAttribute(attrName)) {
        formats[attribute] = domNode.getAttribute(attrName) || undefined;
      }
      return formats;
    }, {});
  }

  optimize(...args) {
    const rowId = this.domNode.getAttribute('data-row');
    if (
      this.statics.requiredContainer &&
      !(this.parent instanceof this.statics.requiredContainer)
    ) {
      this.wrap(this.statics.requiredContainer.blotName, { row: rowId });
    }

    super.optimize(...args);
  }

  format(name, value) {
    if (CELL_IDENTITY_KEYS.indexOf(name) > -1) {
      const attrName = `data-${name}`;
      if (value) {
        this.domNode.setAttribute(attrName, value);
      } else {
        this.domNode.removeAttribute(attrName);
      }
    } else {
      super.format(name, value);
    }
  }

  cell() {
    return this.parent;
  }
}
CellLine.blotName = 'tableCellLine';
CellLine.className = 'ql-table-cell-line';
CellLine.tagName = 'P';

class HeaderCellLine extends CellLine {}
HeaderCellLine.blotName = 'tableHeaderCellLine';
HeaderCellLine.className = 'ql-table-header-cell-line';

class BaseCell extends Container {
  checkMerge() {
    if (super.checkMerge() && this.next.children.head != null) {
      const thisHead = this.children.head.formats()[
        this.children.head.statics.blotName
      ];
      const thisTail = this.children.tail.formats()[
        this.children.tail.statics.blotName
      ];
      const nextHead = this.next.children.head.formats()[
        this.next.children.head.statics.blotName
      ];
      const nextTail = this.next.children.tail.formats()[
        this.next.children.tail.statics.blotName
      ];

      return (
        thisHead.cell === thisTail.cell &&
        thisHead.cell === nextHead.cell &&
        thisHead.cell === nextTail.cell
      );
    }
    return false;
  }

  formats() {
    return BaseCell.cellFormats(this.domNode);
  }

  static cellFormats(domNode) {
    const formats = {};

    if (
      domNode.hasAttribute('data-row') ||
      domNode.hasAttribute('data-header-row')
    ) {
      formats.row =
        domNode.getAttribute('data-row') ??
        domNode.getAttribute('data-header-row');
    }

    return formats;
  }

  cellOffset() {
    if (this.parent) {
      return this.parent.children.indexOf(this);
    }
    return -1;
  }

  row() {
    return this.parent;
  }

  rowOffset() {
    if (this.row()) {
      return this.row().rowOffset();
    }
    return -1;
  }

  table() {
    return this.row()?.table();
  }

  optimize(...args) {
    const rowId =
      this.domNode.getAttribute('data-row') ??
      this.domNode.getAttribute('data-header-row');

    if (
      this.statics.requiredContainer &&
      !(this.parent instanceof this.statics.requiredContainer)
    ) {
      this.wrap(this.statics.requiredContainer.blotName, { row: rowId });
    }
    super.optimize(...args);
  }
}
BaseCell.tagName = ['TD', 'TH'];

class TableCell extends BaseCell {
  static create(value) {
    const node = super.create();
    const attrName = 'data-row';
    if (value?.row) {
      node.setAttribute(attrName, value.row);
    }
    return node;
  }

  format(name, value) {
    if (['row'].indexOf(name) > -1) {
      this.domNode.setAttribute(`data-${name}`, value);
      this.children.forEach(child => {
        child.format(name, value);
      });
    } else {
      super.format(name, value);
    }
  }
}
TableCell.blotName = 'tableCell';
TableCell.className = 'ql-table-data-cell';
TableCell.dataAttribute = 'data-row';

class TableHeaderCell extends BaseCell {
  static create(value) {
    const node = super.create();
    const attrName = 'data-header-row';
    if (value && value.row) {
      node.setAttribute(attrName, value.row);
    }
    return node;
  }

  format(name, value) {
    if (['row'].indexOf(name) > -1) {
      this.domNode.setAttribute(`data-${name}`, value);
      this.children.forEach(child => {
        child.format(name, value);
      });
    } else {
      super.format(name, value);
    }
  }
}
TableHeaderCell.tagName = ['TH', 'TD'];
TableHeaderCell.className = 'ql-table-header-cell';
TableHeaderCell.blotName = 'tableHeaderCell';
TableHeaderCell.dataAttribute = 'data-header-row';

class BaseRow extends Container {
  checkMerge() {
    if (super.checkMerge() && isDefined(this.next.children.head)) {
      const formatName = 'row';

      const thisHead = this.children.head.formats();
      const thisTail = this.children.tail.formats();
      const nextHead = this.next.children.head.formats();
      const nextTail = this.next.children.tail.formats();

      return (
        thisHead[formatName] === thisTail[formatName] &&
        thisHead[formatName] === nextHead[formatName] &&
        thisHead[formatName] === nextTail[formatName]
      );
    }
    return false;
  }

  optimize(...args) {
    super.optimize(...args);
    const formatName = this.childFormatName;
    this.children.forEach(child => {
      if (!isDefined(child.next)) {
        return;
      }

      const childFormats = child.formats();
      const nextFormats = child.next.formats();
      if (childFormats[formatName] !== nextFormats[formatName]) {
        const next = this.splitAfter(child);
        if (next) {
          next.optimize();
        }
        if (this.prev) {
          this.prev.optimize();
        }
      }
    });
  }

  rowOffset() {
    if (this.parent) {
      return this.parent.children.indexOf(this);
    }
    return -1;
  }

  table() {
    return this.parent?.parent;
  }

  static create(value) {
    const node = super.create(value);
    if (value?.row) {
      node.setAttribute('data-row', value.row);
    }
    return node;
  }

  formats() {
    return ['row'].reduce((formats, attrPart) => {
      const attrName = `data-${attrPart}`;
      if (this.domNode.hasAttribute(attrName)) {
        formats[attrName] = this.domNode.getAttribute(attrName);
      }
      return formats;
    }, {});
  }
}
BaseRow.tagName = 'TR';

class TableRow extends BaseRow {
  constructor(scroll, domNode) {
    super(scroll, domNode);

    this.childFormatName = 'table';
  }
}
TableRow.blotName = 'tableRow';

class TableHeaderRow extends BaseRow {
  constructor(scroll, domNode) {
    super(scroll, domNode);

    this.childFormatName = 'tableHeaderCell';
  }
}
TableHeaderRow.blotName = 'tableHeaderRow';

class TableBody extends Container {}
TableBody.blotName = 'tableBody';
TableBody.tagName = 'TBODY';

class TableHeader extends Container {}
TableHeader.blotName = 'tableHeader';
TableHeader.tagName = 'THEAD';

class TableContainer extends Container {
  balanceCells() {
    const headerRows = this.descendants(TableHeaderRow);
    const bodyRows = this.descendants(TableRow);
    const maxColCount = this.getMaxTableColCount(headerRows, bodyRows);

    this.balanceRows(maxColCount, headerRows, TableHeaderCell);
    this.balanceRows(maxColCount, bodyRows, TableCell);
  }

  getMaxTableColCount(headerRows, bodyRows) {
    return Math.max(
      this.getMaxRowColCount(headerRows),
      this.getMaxRowColCount(bodyRows),
    );
  }

  getMaxRowColCount(rows) {
    return Math.max(...rows.map(row => row.children.length));
  }

  balanceRows(maxColCount, rows, CellClass) {
    rows.forEach(row => {
      new Array(maxColCount - row.children.length).fill(0).forEach(() => {
        let value;
        if (isDefined(row.children.head)) {
          value = CellClass.cellFormats(row.children.head.domNode);
        }
        const blot = this.scroll.create(CellClass.blotName, value);
        const cellLine = this.scroll.create(
          CellClass.allowedChildren[0].blotName,
          value,
        );
        blot.appendChild(cellLine);
        row.appendChild(blot);
        blot.optimize(); // Add break blot
      });
    });
  }

  cells(column) {
    return this.rows().map(row => row.children.at(column));
  }

  deleteColumn(index) {
    [TableHeader, TableBody].forEach(blot => {
      const [tablePart] = this.descendants(blot);
      if (!isDefined(tablePart) || !isDefined(tablePart.children.head)) {
        return;
      }
      tablePart.children.forEach(row => {
        const cell = row.children.at(index);
        if (isDefined(cell)) {
          cell.remove();
        }
      });
    });
  }

  insertColumn(index) {
    [TableHeader, TableBody].forEach(blot => {
      const [tablePart] = this.descendants(blot);
      if (!isDefined(tablePart) || !isDefined(tablePart.children.head)) {
        return;
      }

      const CellBlot = blot === TableHeader ? TableHeaderCell : TableCell;
      const CellLineBlot = blot === TableHeader ? HeaderCellLine : CellLine;

      tablePart.children.forEach(row => {
        const ref = row.children.at(index);
        const value = CellLineBlot.formats(
          row.children.head.children.head.domNode,
        );
        const cell = this.scroll.create(CellBlot.blotName, { row: value.row });
        const cellLine = this.scroll.create(CellLineBlot.blotName, {
          row: value.row,
        });
        const emptyLine = this.scroll.create(Break.blotName);

        cellLine.appendChild(emptyLine);
        cell.appendChild(cellLine);
        row.insertBefore(cell, ref);
      });
    });
  }

  insertRow(index) {
    const [body] = this.descendants(TableBody);
    if (!isDefined(body) || !isDefined(body.children.head)) {
      return;
    }

    const id = tableId();
    const row = this.scroll.create(TableRow.blotName, { row: id });
    body.children.head.children.forEach(() => {
      const cell = this.scroll.create(TableCell.blotName, { row: id });
      const cellLine = this.scroll.create(CellLine.blotName, { row: id });
      const emptyLine = this.scroll.create(Break.blotName);

      cellLine.appendChild(emptyLine);
      cell.appendChild(cellLine);
      row.appendChild(cell);
    });
    const ref = body.children.at(index);
    body.insertBefore(row, ref);
  }

  insertHeaderRow() {
    const [header] = this.descendants(TableHeader);
    const [body] = this.descendants(TableBody);

    if (
      isDefined(header) ||
      !isDefined(body) ||
      !isDefined(body.children.head)
    ) {
      return;
    }

    const id = tableId();
    const newHeader = this.scroll.create(TableHeader.blotName);
    const row = this.scroll.create(TableHeaderRow.blotName);
    const ref = this.children.at(0);
    newHeader.appendChild(row);
    body.children.head.children.forEach(() => {
      const cell = this.scroll.create(TableHeaderCell.blotName, { row: id });
      const cellLine = this.scroll.create(HeaderCellLine.blotName, { row: id });
      const emptyLine = this.scroll.create(Break.blotName);

      cellLine.appendChild(emptyLine);
      cell.appendChild(cellLine);
      row.appendChild(cell);
      cell.optimize();
    });
    this.insertBefore(newHeader, ref);
  }

  rows() {
    const body = this.children.head;
    return isDefined(body) ? body.children.map(row => row) : [];
  }
}
TableContainer.blotName = 'tableContainer';
TableContainer.tagName = 'TABLE';

TableContainer.allowedChildren = [TableHeader, TableBody];
TableBody.requiredContainer = TableContainer;
TableHeader.requiredContainer = TableContainer;

TableBody.allowedChildren = [TableRow];
TableRow.requiredContainer = TableBody;

TableRow.allowedChildren = [TableCell];
TableCell.requiredContainer = TableRow;

CellLine.requiredContainer = TableCell;
TableCell.allowedChildren = [CellLine];

TableHeader.allowedChildren = [TableHeaderRow];
TableHeaderRow.requiredContainer = TableHeader;

HeaderCellLine.requiredContainer = TableHeaderCell;
TableHeaderCell.allowedChildren = [HeaderCellLine];

TableHeaderRow.allowedChildren = [TableHeaderCell];
TableHeaderCell.requiredContainer = TableHeaderRow;

function tableId() {
  return `row-${getId()}`;
}

function cellId() {
  return `cell-${getId()}`;
}

export {
  CellLine,
  HeaderCellLine,
  TableCell,
  TableHeaderCell,
  TableRow,
  TableHeaderRow,
  TableBody,
  TableHeader,
  TableContainer,
  tableId,
  TABLE_TAGS,
};
