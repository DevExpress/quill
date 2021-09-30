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
import {
  SizeClass,
  SizeStyle,
  WidthAttribute,
  HeightAttribute,
} from './formats/size';

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
  CellBorderWidthStyle,
  CellPaddingBottomStyle,
  CellPaddingLeftStyle,
  CellPaddingRightStyle,
  CellPaddingStyle,
  CellPaddingTopStyle,
  CellVerticalAlignStyle,
} from './formats/table/attributors/table';

Quill.register(
  {
    'attributors/attribute/direction': DirectionAttribute,
    'attributors/attribute/width': WidthAttribute,
    'attributors/attribute/height': HeightAttribute,

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
    'attributors/style/tableBackground': CellBackgroundColorStyle,
    'attributors/style/tableBorder': CellBorderStyle,
    'attributors/style/tableBorderWidth': CellBorderWidthStyle,
    'attributors/style/tableBorderColor': CellBorderColorStyle,
    'attributors/style/tablePadding': CellPaddingStyle,
    'attributors/style/tablePaddingTop': CellPaddingTopStyle,
    'attributors/style/tablePaddingBottom': CellPaddingBottomStyle,
    'attributors/style/tablePaddingLeft': CellPaddingLeftStyle,
    'attributors/style/tablePaddingRight': CellPaddingRightStyle,
    'attributors/style/tableVerticalAlign': CellVerticalAlignStyle,
  },
  true,
);

Quill.register(
  {
    'formats/align': AlignClass,
    'formats/direction': DirectionClass,
    'formats/indent': Indent,

    'formats/width': WidthAttribute,
    'formats/height': HeightAttribute,

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

    'formats/tableBorder': CellBorderStyle,
    'formats/tableBorderWidth': CellBorderWidthStyle,
    'formats/tableBorderColor': CellBorderColorStyle,
    'formats/tableBackground': CellBackgroundColorStyle,
    'formats/tablePadding': CellPaddingStyle,
    'formats/tablePaddingTop': CellPaddingTopStyle,
    'formats/tablePaddingBottom': CellPaddingBottomStyle,
    'formats/tablePaddingLeft': CellPaddingLeftStyle,
    'formats/tablePaddingRight': CellPaddingRightStyle,
    'formats/tableVerticalAlign': CellVerticalAlignStyle,

    'tableModules/lite': TableLite,
    'tableModules/main': Table,

    'modules/syntax': Syntax,
    'modules/multiline': Multiline,
    'modules/table': TableLite,
  },
  true,
);

export default Quill;
