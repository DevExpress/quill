import { Attributor, ClassAttributor, Scope, StyleAttributor } from 'parchment';

const SizeClass = new ClassAttributor('size', 'ql-size', {
  scope: Scope.INLINE,
  whitelist: ['small', 'large', 'huge'],
});
const SizeStyle = new StyleAttributor('size', 'font-size', {
  scope: Scope.INLINE,
  whitelist: ['10px', '18px', '32px'],
});

const config = {
  scope: Scope.BLOCK,
  whitelist: null,
};

const WidthAttribute = new Attributor('width', 'width', config);
const HeightAttribute = new Attributor('height', 'height', config);

export { SizeClass, SizeStyle, WidthAttribute, HeightAttribute };
