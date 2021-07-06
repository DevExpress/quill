import Block from '../blots/block';
import Container from '../blots/container';

const TABLE_TAGS = ['TD', 'TH', 'TR', 'TBODY', 'THEAD', 'TABLE'];

class TableCell extends Block {
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

  cellOffset() {
    if (this.parent) {
      return this.parent.children.indexOf(this);
    }
    return -1;
  }

  format(name, value) {
    if (name === TableCell.blotName && value) {
      this.domNode.setAttribute('data-row', value);
    } else {
      super.format(name, value);
    }
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
TableCell.blotName = 'table';
TableCell.tagName = ['TD', 'TH'];

class TableHeaderCell extends Block {
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
TableHeaderCell.blotName = 'table-header-cell';
TableHeaderCell.tagName = ['TD', 'TH'];

class TableRow extends Container {
  checkMerge() {
    if (super.checkMerge() && this.next.children.head != null) {
      const thisHead = this.children.head.formats();
      const thisTail = this.children.tail.formats();
      const nextHead = this.next.children.head.formats();
      const nextTail = this.next.children.tail.formats();
      return (
        thisHead.table === thisTail.table &&
        thisHead.table === nextHead.table &&
        thisHead.table === nextTail.table
      );
    }
    return false;
  }

  optimize(...args) {
    super.optimize(...args);
    this.children.forEach(child => {
      if (child.next == null) return;
      const childFormats = child.formats();
      const nextFormats = child.next.formats();
      if (childFormats.table !== nextFormats.table) {
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
TableRow.blotName = 'table-row';
TableRow.tagName = 'TR';

class TableHeaderRow extends Container {
  checkMerge() {
    if (super.checkMerge() && this.next.children.head != null) {
      const thisHead = this.children.head.formats();
      const thisTail = this.children.tail.formats();
      const nextHead = this.next.children.head.formats();
      const nextTail = this.next.children.tail.formats();
      return (
        thisHead['table-header-cell'] === thisTail['table-header-cell'] &&
        thisHead['table-header-cell'] === nextHead['table-header-cell'] &&
        thisHead['table-header-cell'] === nextTail['table-header-cell']
      );
    }
    return false;
  }

  optimize(...args) {
    super.optimize(...args);
    this.children.forEach(child => {
      if (child.next == null) return;
      const childFormats = child.formats();
      const nextFormats = child.next.formats();
      if (
        childFormats['table-header-cell'] !== nextFormats['table-header-cell']
      ) {
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
TableHeaderRow.tagName = 'TR';
TableHeaderRow.blotName = 'table-header-row';

class TableBody extends Container {}
TableBody.blotName = 'table-body';
TableBody.tagName = ['TBODY'];

class TableHeader extends Container {}
TableHeader.blotName = 'table-header';
TableHeader.tagName = ['THEAD'];

class TableContainer extends Container {
  balanceCells() {
    const headerRows = this.descendants(TableHeaderRow);
    const rows = this.descendants(TableRow);
    const maxHeaderColumns = headerRows.reduce((max, row) => {
      return Math.max(row.children.length, max);
    }, 0);
    const maxBodyColumns = rows.reduce((max, row) => {
      return Math.max(row.children.length, max);
    }, 0);
    const maxColumns = Math.max(maxHeaderColumns, maxBodyColumns);

    headerRows.forEach(row => {
      new Array(maxColumns - row.children.length).fill(0).forEach(() => {
        let value;
        if (row.children.head != null) {
          value = TableHeaderCell.formats(row.children.head.domNode);
        }
        const blot = this.scroll.create(TableHeaderCell.blotName, value);
        row.appendChild(blot);
        blot.optimize(); // Add break blot
      });
    });

    rows.forEach(row => {
      new Array(maxColumns - row.children.length).fill(0).forEach(() => {
        let value;
        if (row.children.head != null) {
          value = TableCell.formats(row.children.head.domNode);
        }
        const blot = this.scroll.create(TableCell.blotName, value);
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
TableContainer.blotName = 'table-container';
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
