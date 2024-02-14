export const getXMLElement = (innerHTML?: string) => {
  const xml = document.createElement('xml');

  if (innerHTML) xml.innerHTML = innerHTML;

  return xml;
};
