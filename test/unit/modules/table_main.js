import Delta from 'quill-delta';
import Quill from '../../../core/quill';
import TableMain from '../../../modules/table';
import capitalize from '../../../utils/capitalize';
import {
  CELL_STYLE_TESTS_PRESET,
  TABLE_STYLE_TESTS_PRESET,
} from '../../helpers/table_format_presets';

describe('Table Module', function() {
  beforeAll(function() {
    Quill.register({ 'modules/table': TableMain }, true);
  });

  describe('clipboard integration', function() {
    it('formatted table', function() {
      const quill = this.initialize(Quill, '<p><br></p>', this.container, {
        modules: {
          table: true,
        },
      });
      const markup = `
      <table style="border: 2px dashed green; background-color: azure;" width="800px" height="600px">
        <tbody>
          <tr><td style="border: 2px solid red; text-align: center; vertical-align: bottom; background-color: aliceblue; padding-top: 10px;">a1</td><td width="100px" height="100px" style="padding: 20px;">a2</td><td>a3</td></tr>
        </tbody>
      </table>
      `;
      const delta = quill.clipboard.convert({ html: markup });
      const tableAttrs = {
        tableBackgroundColor: 'azure',
        tableBorder: '2px dashed green',
        tableHeight: '600px',
        tableWidth: '800px',
      };
      expect(delta).toEqual(
        new Delta()
          .insert('a1\n', {
            cellBackgroundColor: 'aliceblue',
            cellBorder: '2px solid red',
            cellPaddingTop: '10px',
            cellTextAlign: 'center',
            cellVerticalAlign: 'bottom',
            tableCellLine: { row: 1, cell: 1 },
            ...tableAttrs,
          })
          .insert('a2\n', {
            cellHeight: '100px',
            cellPadding: '20px',
            cellWidth: '100px',
            tableCellLine: { row: 1, cell: 2 },
            ...tableAttrs,
          })
          .insert('a3\n', {
            tableCellLine: { row: 1, cell: 3 },
            ...tableAttrs,
          }),
      );
    });
  });

  describe('insert table', function() {
    it('empty', function() {
      const quill = this.initialize(Quill, '<p><br></p>', this.container, {
        modules: {
          table: true,
        },
      });
      const table = quill.getModule('table');
      quill.setSelection(0);
      table.insertTable(2, 3);
      expect(quill.root).toEqualHTML(
        `
          <table>
          <tbody>
            <tr>
              <td><p><br></p></td>
              <td><p><br></p></td>
              <td><p><br></p></td>
            </tr>
            <tr>
              <td><p><br></p></td>
              <td><p><br></p></td>
              <td><p><br></p></td>
            </tr>
          </tbody>
        </table>
        <p><br></p>
      `,
        true,
      );
    });

    it('multiparagraph', function() {
      const markup = `
        <table>
          <tbody>
            <tr>
              <td>
                <p>paragraph1</p>
                <p>paragraph2</p>
                <p><br></p>
              </td>
              <td><p><br></p></td>
              <td><p><br></p></td>
            </tr>
            <tr>
              <td><p><br></p></td>
              <td>
                <p>paragraph3</p>
                <p>paragraph4</p>
              </td>
              <td><p><br></p></td>
            </tr>
          </tbody>
        </table>
      `;
      const quill = this.initialize(Quill, markup, this.container, {
        modules: {
          table: true,
        },
      });
      expect(quill.root).toEqualHTML(markup, true);
    });

    it('multiparagraph with header', function() {
      const markup = `
        <table>
          <thead>
            <tr>
              <th><p><br></p></th>
              <th><p><br></p></th>
              <th>
                <p>Header paragraph1</p>
                <p>Header paragraph2</p>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <p>paragraph1</p>
                <p>paragraph2</p>
                <p><br></p>
              </td>
              <td><p><br></p></td>
              <td><p><br></p></td>
            </tr>
            <tr>
              <td><p><br></p></td>
              <td>
                <p>paragraph3</p>
                <p>paragraph4</p>
              </td>
              <td><p><br></p></td>
            </tr>
          </tbody>
        </table>
      `;
      const quill = this.initialize(Quill, markup, this.container, {
        modules: {
          table: true,
        },
      });
      expect(quill.root).toEqualHTML(markup, true);
    });

    it('initial markup with formatting', function() {
      const markup = `
      <table style="background-color: azure;">
        <tbody>
          <tr>
            <td style="background-color: aliceblue;">
              <p>a1</p>
            </td>
            <td style="padding: 20px;">
              <p>a2</p>
            </td>
            <td>
              <p>a3</p>
            </td>
          </tr>
        </tbody>
      </table>
      `;
      const quill = this.initialize(Quill, markup, this.container, {
        modules: {
          table: true,
        },
      });
      expect(quill.root).toEqualHTML(markup, true);
    });

    it('head', function() {
      const quill = this.initialize(
        Quill,
        `<table>
          <thead>
            <tr data-table-row="1">
              <th class="ql-table-header-cell" data-table-header-row="1">
                <p class="ql-table-header-cell-line" data-table-row="1" data-table-cell="1">H1</p>
              </th>
              <th class="ql-table-header-cell" data-table-header-row="1">
                <p class="ql-table-header-cell-line" data-table-row="1" data-table-cell="2">H2</p>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr data-table-row="2">
              <td class="ql-table-data-cell" data-table-row="2">
                <p class="ql-table-cell-line" data-table-row="2" data-table-cell="1">A1</p>
              </td>
              <td class="ql-table-data-cell" data-table-row="2">
                <p class="ql-table-cell-line" data-table-row="2" data-table-cell="2">A2</p>
              </td>
            </tr>
          </tbody>
        </table>
        `,
        this.container,
        {
          modules: {
            table: true,
          },
        },
      );

      expect(quill.root).toEqualHTML(
        `<table>
          <thead>
            <tr>
              <th><p>H1</p></th>
              <th><p>H2</p></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><p>A1</p></td>
              <td><p>A2</p></td>
            </tr>
          </tbody>
        </table>`,
        true,
      );
    });

    it('initial markup with thead and formatting', function() {
      const markup = `
      <table style="background-color: azure;">
        <thead>
          <tr>
            <th>
              <p>h1</p>
            </th>
            <th>
              <p>h2</p>
            </th>
            <th>
              <p>h3</p>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="background-color: aliceblue;">
              <p>a1</p>
            </td>
            <td style="padding: 20px;">
              <p>a2</p>
            </td>
            <td>
              <p>a3</p>
            </td>
          </tr>
        </tbody>
      </table>
      `;
      const quill = this.initialize(Quill, markup, this.container, {
        modules: {
          table: true,
        },
      });
      expect(quill.root).toEqualHTML(markup, true);
    });

    it('split', function() {
      const quill = this.initialize(Quill, '<p>0123</p>', this.container, {
        modules: {
          table: true,
        },
      });
      const table = quill.getModule('table');
      quill.setSelection(2);
      table.insertTable(2, 3);
      expect(quill.root).toEqualHTML(
        `<table>
          <tbody>
            <tr>
              <td><p>01</p></td>
              <td><p><br></p></td>
              <td><p><br></p></td>
            </tr>
            <tr>
              <td><p><br></p></td>
              <td><p><br></p></td>
              <td><p><br></p></td>
            </tr>
          </tbody>
        </table>
        <p>23</p>`,
        true,
      );
    });

    it('old table module markup', function() {
      const quill = this.initialize(
        Quill,
        `<table>
          <tr>
            <td data-row="1">1</td>
            <td data-row="2">2</td>
          </tr>
        </table>`,
        this.container,
        {
          modules: {
            table: true,
          },
        },
      );

      expect(quill.root).toEqualHTML(
        `
          <table>
          <tbody>
            <tr>
              <td><p>1</p></td>
              <td><p>2</p></td>
            </tr>
          </tbody>
        </table>
      `,
        true,
      );
    });
  });

  describe('modify table', function() {
    beforeEach(function() {
      const tableHTML = `
        <table>
          <tbody>
            <tr><td>a1</td><td>a2</td><td>a3</td></tr>
            <tr><td>b1</td><td>b2</td><td>b3</td></tr>
          </tbody>
        </table>
      `;
      this.quill = this.initialize(Quill, tableHTML, this.container, {
        modules: {
          table: true,
        },
      });
      this.table = this.quill.getModule('table');
    });

    it('insertHeaderRow', function() {
      this.quill.setSelection(0);
      this.table.insertHeaderRow();

      expect(this.quill.root).toEqualHTML(
        `
        <table>
          <thead>
            <tr>
              <th><p><br></p></th>
              <th><p><br></p></th>
              <th><p><br></p></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><p>a1</p></td>
              <td><p>a2</p></td>
              <td><p>a3</p></td>
            </tr>
            <tr>
              <td><p>b1</p></td>
              <td><p>b2</p></td>
              <td><p>b3</p></td>
            </tr>
          </tbody>
        </table>
      `,
        true,
      );
    });

    it('insertRowAbove', function() {
      this.quill.setSelection(0);
      this.table.insertRowAbove();
      expect(this.quill.root).toEqualHTML(
        `
          <table>
            <tbody>
              <tr>
                <td><p><br></p></td>
                <td><p><br></p></td>
                <td><p><br></p></td>
              </tr>
              <tr>
                <td><p>a1</p></td>
                <td><p>a2</p></td>
                <td><p>a3</p></td>
              </tr>
              <tr>
                <td><p>b1</p></td>
                <td><p>b2</p></td>
                <td><p>b3</p></td>
              </tr>
            </tbody>
          </table>
        `,
        true,
      );
    });

    it('insertRowAbove, selection at header', function() {
      this.quill.setSelection(0);
      this.table.insertHeaderRow();
      this.quill.setSelection(0);
      this.table.insertRowAbove();
      expect(this.quill.root).toEqualHTML(
        `
          <table>
            <thead>
              <tr>
                <th><p><br></p></th>
                <th><p><br></p></th>
                <th><p><br></p></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><p><br></p></td>
                <td><p><br></p></td>
                <td><p><br></p></td>
              </tr>
              <tr>
                <td><p>a1</p></td>
                <td><p>a2</p></td>
                <td><p>a3</p></td>
              </tr>
              <tr>
                <td><p>b1</p></td>
                <td><p>b2</p></td>
                <td><p>b3</p></td>
              </tr>
            </tbody>
          </table>
        `,
        true,
      );
    });

    it('insertRowBelow', function() {
      this.quill.setSelection(0);
      this.table.insertRowBelow();
      expect(this.quill.root).toEqualHTML(
        `
          <table>
            <tbody>
              <tr>
                <td><p>a1</p></td>
                <td><p>a2</p></td>
                <td><p>a3</p></td>
              </tr>
              <tr>
                <td><p><br></p></td>
                <td><p><br></p></td>
                <td><p><br></p></td>
              </tr>
              <tr>
                <td><p>b1</p></td>
                <td><p>b2</p></td>
                <td><p>b3</p></td>
              </tr>
            </tbody>
          </table>
        `,
        true,
      );
    });

    it('insertRowBelow, selection at header', function() {
      this.quill.setSelection(0);
      this.table.insertHeaderRow();
      this.quill.setSelection(0);
      this.table.insertRowBelow();
      expect(this.quill.root).toEqualHTML(
        `
          <table>
            <thead>
              <tr>
                <th><p><br></p></th>
                <th><p><br></p></th>
                <th><p><br></p></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><p>a1</p></td>
                <td><p>a2</p></td>
                <td><p>a3</p></td>
              </tr>
              <tr>
                <td><p><br></p></td>
                <td><p><br></p></td>
                <td><p><br></p></td>
              </tr>
              <tr>
                <td><p>b1</p></td>
                <td><p>b2</p></td>
                <td><p>b3</p></td>
              </tr>
            </tbody>
          </table>
        `,
        true,
      );
    });

    it('insertColumnLeft', function() {
      this.quill.setSelection(0);
      this.table.insertColumnLeft();
      expect(this.quill.root).toEqualHTML(
        `
          <table>
            <tbody>
              <tr>
                <td><p><br></p></td>
                <td><p>a1</p></td>
                <td><p>a2</p></td>
                <td><p>a3</p></td>
              </tr>
              <tr>
                <td><p><br></p></td>
                <td><p>b1</p></td>
                <td><p>b2</p></td>
                <td><p>b3</p></td>
              </tr>
            </tbody>
          </table>
        `,
        true,
      );
    });

    it('insertColumnLeft, selection at header', function() {
      this.quill.setSelection(0);
      this.table.insertHeaderRow();
      this.quill.setSelection(0);
      this.table.insertColumnLeft();
      expect(this.quill.root).toEqualHTML(
        `
          <table>
            <thead>
              <tr>
                <th><p><br></p></th>
                <th><p><br></p></th>
                <th><p><br></p></th>
                <th><p><br></p></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><p><br></p></td>
                <td><p>a1</p></td>
                <td><p>a2</p></td>
                <td><p>a3</p></td>
              </tr>
              <tr>
                <td><p><br></p></td>
                <td><p>b1</p></td>
                <td><p>b2</p></td>
                <td><p>b3</p></td>
              </tr>
            </tbody>
          </table>
        `,
        true,
      );
    });

    it('insertColumnRight', function() {
      this.quill.setSelection(0);
      this.table.insertColumnRight();
      expect(this.quill.root).toEqualHTML(
        `
          <table>
            <tbody>
              <tr>
                <td><p>a1</p></td>
                <td><p><br></p></td>
                <td><p>a2</p></td>
                <td><p>a3</p></td>
              </tr>
              <tr>
                <td><p>b1</p></td>
                <td><p><br></p></td>
                <td><p>b2</p></td>
                <td><p>b3</p></td>
              </tr>
            </tbody>
          </table>
        `,
        true,
      );
    });

    it('insertColumnRight, selection at header', function() {
      this.quill.setSelection(0);
      this.table.insertHeaderRow();
      this.quill.setSelection(0);
      this.table.insertColumnRight();
      expect(this.quill.root).toEqualHTML(
        `
          <table>
            <thead>
              <tr>
                <th><p><br></p></th>
                <th><p><br></p></th>
                <th><p><br></p></th>
                <th><p><br></p></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><p>a1</p></td>
                <td><p><br></p></td>
                <td><p>a2</p></td>
                <td><p>a3</p></td>
              </tr>
              <tr>
                <td><p>b1</p></td>
                <td><p><br></p></td>
                <td><p>b2</p></td>
                <td><p>b3</p></td>
              </tr>
            </tbody>
          </table>
        `,
        true,
      );
    });

    it('deleteRow', function() {
      this.quill.setSelection(0);
      this.table.deleteRow();
      expect(this.quill.root).toEqualHTML(
        `
          <table>
            <tbody>
              <tr>
                <td><p>b1</p></td>
                <td><p>b2</p></td>
                <td><p>b3</p></td>
              </tr>
            </tbody>
          </table>
        `,
        true,
      );
    });

    it('delete header row', function() {
      this.quill.setSelection(0);
      this.table.insertHeaderRow();
      this.quill.setSelection(0);
      this.table.deleteRow();
      expect(this.quill.root).toEqualHTML(
        `
          <table>
            <tbody>
              <tr>
                <td><p>a1</p></td>
                <td><p>a2</p></td>
                <td><p>a3</p></td>
              </tr>
              <tr>
                <td><p>b1</p></td>
                <td><p>b2</p></td>
                <td><p>b3</p></td>
              </tr>
            </tbody>
          </table>
        `,
        true,
      );
    });

    it('deleteColumn', function() {
      this.quill.setSelection(0);
      this.table.deleteColumn();
      expect(this.quill.root).toEqualHTML(
        `
          <table>
            <tbody>
              <tr>
                <td><p>a2</p></td>
                <td><p>a3</p></td>
              </tr>
              <tr>
                <td><p>b2</p></td>
                <td><p>b3</p></td>
              </tr>
            </tbody>
          </table>
        `,
        true,
      );
    });

    it('deleteColumn with header', function() {
      this.quill.setSelection(0);
      this.table.insertHeaderRow();
      this.quill.setSelection(0);
      this.table.deleteColumn();
      expect(this.quill.root).toEqualHTML(
        `
          <table>
            <thead>
              <tr>
                <th><p><br></p></th>
                <th><p><br></p></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><p>a2</p></td>
                <td><p>a3</p></td>
              </tr>
              <tr>
                <td><p>b2</p></td>
                <td><p>b3</p></td>
              </tr>
            </tbody>
          </table>
        `,
        true,
      );
    });

    it('insertText before', function() {
      this.quill.updateContents(new Delta().insert('\n'));
      expect(this.quill.root).toEqualHTML(
        `
          <p><br></p>
          <table>
            <tbody>
              <tr>
                <td><p>a1</p></td>
                <td><p>a2</p></td>
                <td><p>a3</p></td>
              </tr>
              <tr>
                <td><p>b1</p></td>
                <td><p>b2</p></td>
                <td><p>b3</p></td>
              </tr>
            </tbody>
          </table>
        `,
        true,
      );
    });

    it('insertText after', function() {
      this.quill.updateContents(new Delta().retain(18).insert('\n'));
      expect(this.quill.root).toEqualHTML(
        `
          <table>
            <tbody>
              <tr>
                <td><p>a1</p></td>
                <td><p>a2</p></td>
                <td><p>a3</p></td>
              </tr>
              <tr>
                <td><p>b1</p></td>
                <td><p>b2</p></td>
                <td><p>b3</p></td>
              </tr>
            </tbody>
          </table>
          <p><br></p>
        `,
        true,
      );
    });

    it('insertText inside after getSemanticHtml', function() {
      this.quill.getSemanticHTML(0, this.quill.getLength() + 1);
      this.quill.insertText(8, '\n');
      expect(this.quill.root).toEqualHTML(
        `
          <table>
            <tbody>
              <tr>
                <td><p>a1</p></td>
                <td><p>a2</p></td>
                <td>
                  <p>a3</p>
                  <p><br></p>
                </td>
              </tr>
              <tr>
                <td><p>b1</p></td>
                <td><p>b2</p></td>
                <td><p>b3</p></td>
              </tr>
            </tbody>
          </table>
        `,
        true,
      );
    });
  });

  describe('customize table', function() {
    beforeEach(function() {
      const tableHTML = `
        <table>
          <tbody>
            <tr><td>a1</td><td>a2</td></tr>
          </tbody>
        </table>
      `;
      this.quill = this.initialize(Quill, tableHTML, this.container, {
        modules: {
          table: true,
        },
      });
    });

    TABLE_STYLE_TESTS_PRESET.forEach(({ formatName, styleName, value }) => {
      it(`${formatName} table style`, function() {
        this.quill.setSelection(1, 0);
        this.quill.format(`table${capitalize(formatName)}`, value);
        expect(this.quill.root).toEqualHTML(
          `
            <table style="${styleName}: ${value};">
              <tbody>
                <tr>
                  <td><p>a1</p></td>
                  <td><p>a2</p></td>
                </tr>
              </tbody>
            </table>
          `,
          true,
        );
      });
    });

    CELL_STYLE_TESTS_PRESET.forEach(({ formatName, styleName, value }) => {
      it(`${formatName} cell style`, function() {
        this.quill.setSelection(1, 0);
        this.quill.format(`cell${capitalize(formatName)}`, value);
        expect(this.quill.root).toEqualHTML(
          `
            <table>
              <tbody>
                <tr>
                  <td style="${styleName}: ${value};"><p>a1</p></td>
                  <td><p>a2</p></td>
                </tr>
              </tbody>
            </table>
          `,
          true,
        );
      });
    });

    it(`get table formats after formatting`, function() {
      this.quill.setSelection(4, 0);
      const formats = this.quill.getFormat();

      this.quill.format('tableBorderColor', 'red');
      formats.tableBorderColor = 'red';

      expect(this.quill.getFormat()).toEqual(formats);
    });
  });

  describe('customize table with headers', function() {
    beforeEach(function() {
      const tableHTML = `
        <table>
          <thead>
            <tr><th><p>h1</p></th><th><p>h2</p></th</tr>
          </thead>
          <tbody>
            <tr><td><p>a1</p></td><td><p>a2</p></td></tr>
          </tbody>
        </table>
      `;
      this.quill = this.initialize(Quill, tableHTML, this.container, {
        modules: {
          table: true,
        },
      });
    });

    TABLE_STYLE_TESTS_PRESET.forEach(({ formatName, styleName, value }) => {
      it(`${formatName} table style`, function() {
        this.quill.setSelection(1, 0);
        this.quill.format(`table${capitalize(formatName)}`, value);
        expect(this.quill.root).toEqualHTML(
          `
            <table style="${styleName}: ${value};">
              <thead>
                <tr>
                  <th><p>h1</p></th>
                  <th><p>h2</p></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><p>a1</p></td>
                  <td><p>a2</p></td>
                </tr>
              </tbody>
            </table>
          `,
          true,
        );
      });
    });

    CELL_STYLE_TESTS_PRESET.forEach(({ formatName, styleName, value }) => {
      it(`${formatName} cell style`, function() {
        this.quill.setSelection(1, 0);
        this.quill.format(`cell${capitalize(formatName)}`, value);
        expect(this.quill.root).toEqualHTML(
          `
            <table>
              <thead>
                <tr>
                  <th style="${styleName}: ${value};"><p>h1</p></th>
                  <th><p>h2</p></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><p>a1</p></td>
                  <td><p>a2</p></td>
                </tr>
              </tbody>
            </table>
          `,
          true,
        );
      });
    });
  });
});
