import Block from '../blots/block';
import Container from '../blots/container';

const TABLE_TAGS = ['TD', 'TH', 'TR', 'TBODY', 'THEAD', 'TABLE'];

class BaseCell extends Block {
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
    return this.row() && this.row().table();
  }
}
BaseCell.tagName = ['TD', 'TH'];

class TableCell extends BaseCell {
  static create(value) {
    const node = super.create();
    if (value) {
      node.setAttribute('data-row', value);
    } else {
      node.setAttribute('data-row', tableId());
    }
    return node;
  }

  static formats(domNode) {
    if (domNode.hasAttribute('data-row')) {
      return domNode.getAttribute('data-row');
    }
    return undefined;
  }

  format(name, value) {
    if (name === TableCell.blotName && value) {
      this.domNode.setAttribute('data-row', value);
    } else {
      super.format(name, value);
    }
  }
}
TableCell.blotName = 'table';

class TableHeaderCell extends BaseCell {
  static create(value) {
    const node = super.create();
    if (value) {
      node.setAttribute('data-header-row', value);
    } else {
      node.setAttribute('data-header-row', tableId());
    }
    return node;
  }

  static formats(domNode) {
    if (domNode.hasAttribute('data-header-row')) {
      return domNode.getAttribute('data-header-row');
    }
    return undefined;
  }

  format(name, value) {
    if (name === TableHeaderCell.blotName && value) {
      this.domNode.setAttribute('data-header-row', value);
    } else {
      super.format(name, value);
    }
  }
}
TableHeaderCell.blotName = 'tableHeaderCell';

class BaseRow extends Container {
  checkMerge() {
    if (super.checkMerge() && this.next.children.head != null) {
      const formatName = this.childFormatName;
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
      if (child.next == null) return;
      const childFormats = child.formats();
      const nextFormats = child.next.formats();
      if (childFormats[formatName] !== nextFormats[formatName]) {
        const next = this.splitAfter(child);
        if (next) {
          next.optimize();
        }
        // We might be able to merge with prev now
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
    return this.parent && this.parent.parent;
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
TableBody.tagName = ['TBODY'];

class TableHeader extends Container {}
TableHeader.blotName = 'tableHeader';
TableHeader.tagName = ['THEAD'];

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
    return rows.reduce((max, row) => {
      return Math.max(row.children.length, max);
    }, 0);
  }

  balanceRows(maxColCount, rows, CellClass) {
    rows.forEach(row => {
      new Array(maxColCount - row.children.length).fill(0).forEach(() => {
        let value;
        if (row.children.head != null) {
          value = CellClass.formats(row.children.head.domNode);
        }
        const blot = this.scroll.create(CellClass.blotName, value);
        row.appendChild(blot);
        blot.optimize(); // Add break blot
      });
    });
  }

  cells(column) {
    return this.rows().map(row => row.children.at(column));
  }

  deleteColumn(index) {
    const [body] = this.descendant(TableBody);
    if (body == null || body.children.head == null) return;
    body.children.forEach(row => {
      const cell = row.children.at(index);
      if (cell != null) {
        cell.remove();
      }
    });
  }

  insertColumn(index) {
    const [body] = this.descendant(TableBody);
    if (body == null || body.children.head == null) return;
    body.children.forEach(row => {
      const ref = row.children.at(index);
      const value = TableCell.formats(row.children.head.domNode);
      const cell = this.scroll.create(TableCell.blotName, value);
      row.insertBefore(cell, ref);
    });
  }

  insertRow(index) {
    const [body] = this.descendant(TableBody);
    if (body == null || body.children.head == null) return;
    const id = tableId();
    const row = this.scroll.create(TableRow.blotName);
    body.children.head.children.forEach(() => {
      const cell = this.scroll.create(TableCell.blotName, id);
      row.appendChild(cell);
    });
    const ref = body.children.at(index);
    body.insertBefore(row, ref);
  }

  rows() {
    const body = this.children.head;
    if (body == null) return [];
    return body.children.map(row => row);
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

TableHeader.allowedChildren = [TableHeaderRow];
TableHeaderRow.requiredContainer = TableHeader;

TableHeaderRow.allowedChildren = [TableHeaderCell];
TableHeaderCell.requiredContainer = TableHeaderRow;

function tableId() {
  const id = Math.random()
    .toString(36)
    .slice(2, 6);
  return `row-${id}`;
}

export {
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
