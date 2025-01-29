export default function textToDom(text: string): Element {
  const div = document.createElement('div');
  div.innerHTML = text;
  return div.children[0];
}
