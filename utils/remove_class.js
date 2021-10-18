export default function removeClass(node, className) {
  node.classList.remove(className);
  if (node.classList.length === 0) {
    node.removeAttribute('class');
  }
}
