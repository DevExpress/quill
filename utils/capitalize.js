export default function capitalize(text) {
  return text ? text.substring(0, 1).toUpperCase() + text.substring(1) : '';
}
