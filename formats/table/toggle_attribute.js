export default function toggleAttribute(domNode, attrName, value) {
  if (value) {
    domNode.setAttribute(attrName, value);
  } else {
    domNode.removeAttribute(attrName);
  }
}
