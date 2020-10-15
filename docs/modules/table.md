The Table module provides an API for working with tables. 

## Configuration

```javascript
var quill = new DevExpress.Quill('#editor', {
  modules: {
    table: true
  }
});
```

## API

#### insertTable

Adds a table to the selection range.

**Methods**

```js
insertTable(rows: number, columns: number)
```

**Examples**

```js
quill.setSelection(5);
quill.table.insertTable(2, 2);
```

#### insertRow

Adds a row above or below the cursor's position. The position of the row depends on the `offset` parameter value.

**Methods**

```js
insertRow(offset: number)
```

**Examples**

```js
quill.table.insertRow(1); // inserts a row below
quill.table.insertRow(0); // inserts a row above
quill.table.insertRow(-3); // inserts a row 3 rows above the current position
quill.table.insertRow(3); // inserts a row 2 rows below the current position
```


#### insertRowAbove

Adds a row above the cursor's position.

**Methods**

```js
insertRowAbove()
```

**Examples**

```js
quill.table.insertRowAbove();
```


#### insertRowBelow

Adds a row below the cursor's position.

**Methods**

```js
insertRowBelow()
```

**Examples**

```js
quill.table.insertRowBelow();
```

#### insertColumn

Adds a column to the left or right of the cursor's position. The position of the column depends on the `offset` parameter value.

**Methods**

```js
quill.table.insertColumn(1); // inserts a column to the right
quill.table.insertColumn(0); // inserts a column to the left
quill.table.insertColumn(-3); // inserts a column 3 columns before the current position
quill.table.insertColumn(3); // inserts a column 2 columns after the current position
```

**Examples**

```js
quill.table.insertColumn();
```


#### insertColumnLeft

Adds a column to the left of the cursor's position.

**Methods**

```js
insertColumnLeft(offset: number)
```

**Examples**

```js
quill.table.insertColumnLeft();
```


#### insertColumnRight

Adds a column to the right of the cursor's position.

**Methods**

```js
insertColumnRight(offset: number)
```

**Examples**

```js
quill.table.insertColumnRight();
```


#### getTable

Gets the specified range of the table.

**Methods**

```js
getTable(range = this.quill.getSelection()): [table, row, cell, offset]
```

**Examples**

```js
const currentTable = quill.getTable();
const tableBySpecificRange = quill.table.getTable({ index: 3, length: 0 });
```


#### deleteRow

Deletes the row at the selection range.

**Methods**

```js
deleteRow()
```

**Examples**

```js
quill.setSelection(4);
quill.table.deleteRow();
```


#### deleteColumn

Deletes the column at the selection range.

**Methods**

```js
deleteColumn()
```

**Examples**

```js
quill.setSelection(4);
quill.table.deleteColumn();
```


#### deleteTable

Deletes the table at the selection range.

**Methods**

```js
deleteTable()
```

**Examples**

```js
quill.setSelection(4);
quill.table.deleteTable();
```
