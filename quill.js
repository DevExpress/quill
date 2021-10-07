import './polyfills';
import Quill from './core';

import { AlignClass, AlignStyle } from './formats/align';
import {
  DirectionAttribute,
  DirectionClass,
  DirectionStyle,
} from './formats/direction';
import Indent from './formats/indent';

import Blockquote from './formats/blockquote';
import Header from './formats/header';
import List from './formats/list';

import { BackgroundClass, BackgroundStyle } from './formats/background';
import { ColorClass, ColorStyle } from './formats/color';
import { FontClass, FontStyle } from './formats/font';
import { SizeClass, SizeStyle } from './formats/size';

import Bold from './formats/bold';
import Italic from './formats/italic';
import Link from './formats/link';
import Script from './formats/script';
import Strike from './formats/strike';
import Underline from './formats/underline';

import Formula from './formats/formula';
import Image from './formats/image';
import Video from './formats/video';

import CodeBlock, { Code as InlineCode } from './formats/code';

import Syntax from './modules/syntax';
import Table from './modules/table';
import Multiline from './modules/multiline';
import TableLite from './modules/table/lite';
import {
  CellBackgroundColorStyle,
  CellBorderColorStyle,
  CellBorderStyle,
  CellBorderStyleStyle,
  CellBorderWidthStyle,
  CellHeightAttribute,
  CellHeightStyle,
  CellPaddingBottomStyle,
  CellPaddingLeftStyle,
  CellPaddingRightStyle,
  CellPaddingStyle,
  CellPaddingTopStyle,
  CellTextAlignStyle,
  CellVerticalAlignStyle,
  CellWidthAttribute,
  CellWidthStyle,
} from './formats/table/attributors/cell';
import {
  TableTextAlignStyle,
  TableBackgroundColorStyle,
  TableBorderColorStyle,
  TableBorderStyle,
  TableBorderStyleStyle,
  TableBorderWidthStyle,
  TableHeightAttribute,
  TableHeightStyle,
  TableWidthAttribute,
  TableWidthStyle,
} from './formats/table/attributors/table';

Quill.register(
  {
    'attributors/attribute/direction': DirectionAttribute,
    'attributors/attribute/tableWidth': TableWidthAttribute,
    'attributors/attribute/tableHeight': TableHeightAttribute,
    'attributors/attribute/cellWidth': CellWidthAttribute,
    'attributors/attribute/cellHeight': CellHeightAttribute,

    'attributors/class/align': AlignClass,
    'attributors/class/background': BackgroundClass,
    'attributors/class/color': ColorClass,
    'attributors/class/direction': DirectionClass,
    'attributors/class/font': FontClass,
    'attributors/class/size': SizeClass,

    'attributors/style/align': AlignStyle,
    'attributors/style/background': BackgroundStyle,
    'attributors/style/color': ColorStyle,
    'attributors/style/direction': DirectionStyle,
    'attributors/style/font': FontStyle,
    'attributors/style/size': SizeStyle,
    'attributors/style/tableTextAlign': TableTextAlignStyle,
    'attributors/style/tableBackgroundColor': TableBackgroundColorStyle,
    'attributors/style/tableBorder': TableBorderStyle,
    'attributors/style/tableBorderStyle': TableBorderStyleStyle,
    'attributors/style/tableBorderColor': TableBorderColorStyle,
    'attributors/style/tableBorderWidth': TableBorderWidthStyle,
    'attributors/style/tableWidth': TableWidthStyle,
    'attributors/style/tableHeight': TableHeightStyle,
    'attributors/style/cellBackground': CellBackgroundColorStyle,
    'attributors/style/cellBorder': CellBorderStyle,
    'attributors/style/cellBorderStyle': CellBorderStyleStyle,
    'attributors/style/cellBorderWidth': CellBorderWidthStyle,
    'attributors/style/cellBorderColor': CellBorderColorStyle,
    'attributors/style/cellPadding': CellPaddingStyle,
    'attributors/style/cellPaddingTop': CellPaddingTopStyle,
    'attributors/style/cellPaddingBottom': CellPaddingBottomStyle,
    'attributors/style/cellPaddingLeft': CellPaddingLeftStyle,
    'attributors/style/cellPaddingRight': CellPaddingRightStyle,
    'attributors/style/cellVerticalAlign': CellVerticalAlignStyle,
    'attributors/style/cellTextAlign': CellTextAlignStyle,
    'attributors/style/cellWidth': CellWidthStyle,
    'attributors/style/cellHeight': CellHeightStyle,
  },
  true,
);

Quill.register(
  {
    'formats/align': AlignClass,
    'formats/direction': DirectionClass,
    'formats/indent': Indent,

    'formats/background': BackgroundStyle,
    'formats/color': ColorStyle,
    'formats/font': FontClass,
    'formats/size': SizeClass,

    'formats/blockquote': Blockquote,
    'formats/code-block': CodeBlock,
    'formats/header': Header,
    'formats/list': List,

    'formats/bold': Bold,
    'formats/code': InlineCode,
    'formats/italic': Italic,
    'formats/link': Link,
    'formats/script': Script,
    'formats/strike': Strike,
    'formats/underline': Underline,

    'formats/formula': Formula,
    'formats/image': Image,
    'formats/video': Video,

    'tableModules/lite': TableLite,
    'tableModules/main': Table,

    'modules/syntax': Syntax,
    'modules/multiline': Multiline,
    'modules/table': Table,
  },
  true,
);

export default Quill;
