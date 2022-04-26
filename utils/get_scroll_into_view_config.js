export default function getScrollIntoViewConfig(element) {
  const { innerHeight: windowHeight } = window;
  const { y: elemTop, bottom: elemBottom } = element.getBoundingClientRect();

  if (elemTop < 0) {
    return true; // scroll to the top
  }

  if (elemBottom >= windowHeight) {
    return false; // scroll to the bottom
  }

  return null;
}
