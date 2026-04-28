/**
 * SVG sanitization and normalization service.
 * Inspired by scratch-svg-renderer: fixup-svg-string.js + load-svg-string.js
 */

export type ImageFormat = 'svg' | 'png' | 'jpg';

/**
 * Detect image format from a URL, data URI, or raw SVG string.
 */
export function detectFormat(url: string): ImageFormat {
  const trimmed = url.trim();
  if (
    trimmed.startsWith('<svg') ||
    trimmed.startsWith('<?xml') ||
    trimmed.startsWith('data:image/svg') ||
    url.toLowerCase().includes('.svg')
  ) {
    return 'svg';
  }
  if (
    trimmed.startsWith('data:image/jpeg') ||
    url.toLowerCase().includes('.jpg') ||
    url.toLowerCase().includes('.jpeg')
  ) {
    return 'jpg';
  }
  return 'png';
}

/**
 * Pre-parse fixups — mirrors scratch-svg-renderer/fixup-svg-string.js.
 * Corrects common authoring quirks before DOMParser sees the string.
 */
export function fixupSvgString(svgString: string): string {
  // Ensure root svg namespace is declared
  const svgAttrs = svgString.match(/<svg [^>]*>/);
  if (svgAttrs && !svgAttrs[0].includes('xmlns=')) {
    svgString = svgString.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  }

  // Photoshop exports data:img/png instead of data:image/png
  if (svgString.includes('data:img/png')) {
    svgString = svgString.replace(
      /(<image[^>]+?xlink:href=["'])data:img\/png/g,
      (_$0, $1) => `${$1}data:image/png`,
    );
  }

  // Inkscape binds a prefix to the reserved XML namespace — replace with dummy
  const xmlnsRegex = /(<[^>]+?xmlns:(?!xml=)[^ ]+=)"http:\/\/www\.w3\.org\/XML\/1998\/namespace"/g;
  if (xmlnsRegex.test(svgString)) {
    svgString = svgString.replace(xmlnsRegex, (_$0, $1) => `${$1}"http://dummy.namespace"`);
  }

  // Strip Inkscape's svg: tag prefix (DOMPurify doesn't recognise prefixed tag names)
  svgString = svgString.replace(/<(\/?)\s*svg:/g, '<$1');

  // Empty <metadata> (Illustrator sometimes puts unparseable garbage there)
  svgString = svgString.replace(/<metadata>[\s\S]*?<\/metadata>/g, '<metadata></metadata>');

  // Neutralise inline scripts
  svgString = svgString.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/g, '');

  // Remove javascript: href attributes
  svgString = svgString.replace(/\s(href|xlink:href)=["']javascript:[^"']*["']/gi, '');

  return svgString;
}

/**
 * Parse a sanitized SVG string into an SVGSVGElement.
 * Throws if the document is not valid SVG.
 */
export function parseSvgString(svgString: string): SVGSVGElement {
  const fixed = fixupSvgString(svgString);
  const parser = new DOMParser();
  const doc = parser.parseFromString(fixed, 'text/xml');

  if (
    doc.documentElement.localName !== 'svg' ||
    doc.querySelector('parsererror')
  ) {
    // Try HTML parser as fallback (handles more malformed markup)
    const htmlDoc = parser.parseFromString(fixed, 'text/html');
    const svgEl = htmlDoc.querySelector('svg');
    if (!svgEl) throw new Error('[svgRenderer] Document is not valid SVG.');
    return svgEl as unknown as SVGSVGElement;
  }

  return doc.documentElement as unknown as SVGSVGElement;
}

/**
 * Ensure the SVG element has explicit width, height, and viewBox attributes.
 * When the viewBox is missing we temporarily mount it to the DOM to measure
 * the real bounding box — the same technique used by scratch-svg-renderer.
 */
export function normalizeSvgDimensions(svgTag: SVGSVGElement): void {
  // Already complete — nothing to fix
  if (
    svgTag.getAttribute('viewBox') &&
    svgTag.getAttribute('width') &&
    svgTag.getAttribute('height')
  ) {
    return;
  }

  if (!svgTag.getAttribute('viewBox')) {
    // Mount off-screen to measure real bbox via getBBox()
    const spot = document.createElement('span');
    spot.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;';
    let bbox: DOMRect | null = null;
    try {
      spot.innerHTML = svgTag.outerHTML;
      document.body.appendChild(spot);
      const mounted = spot.children[0] as SVGSVGElement;
      bbox = mounted.getBBox();
    } catch {
      // getBBox can throw in some environments; fall back to 100×100
    } finally {
      document.body.removeChild(spot);
    }

    const w = bbox?.width || 100;
    const h = bbox?.height || 100;
    const x = bbox?.x ?? 0;
    const y = bbox?.y ?? 0;

    svgTag.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
    svgTag.setAttribute('width', String(w));
    svgTag.setAttribute('height', String(h));
  } else {
    // viewBox present but width/height missing
    svgTag.setAttribute('width', String(svgTag.viewBox.baseVal.width));
    svgTag.setAttribute('height', String(svgTag.viewBox.baseVal.height));
  }
}

/**
 * Decode a raw URL into a plain SVG string.
 * Handles: raw SVG text, data:image/svg+xml;base64,…, data:image/svg+xml,…, and http(s) URLs.
 */
export async function decodeSvgUrl(url: string): Promise<string> {
  const trimmed = url.trim();

  if (trimmed.startsWith('<') ) return trimmed;

  if (trimmed.startsWith('data:image/svg+xml;base64,')) {
    const base64 = trimmed.slice('data:image/svg+xml;base64,'.length);
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  if (trimmed.startsWith('data:image/svg+xml,')) {
    return decodeURIComponent(trimmed.slice('data:image/svg+xml,'.length));
  }

  // Remote or relative URL
  const res = await fetch(url);
  if (!res.ok) throw new Error(`[svgRenderer] Failed to fetch SVG: ${res.status}`);
  return res.text();
}

/**
 * Full pipeline: decode URL → fixup → parse → normalize dimensions.
 * Returns both the SVGSVGElement and its final serialized string.
 */
export async function loadAndNormalizeSvg(url: string): Promise<{ svgElement: SVGSVGElement; svgString: string }> {
  const raw = await decodeSvgUrl(url);
  const svgElement = parseSvgString(raw);
  normalizeSvgDimensions(svgElement);
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  return { svgElement, svgString };
}

/**
 * Serialize an SVGSVGElement back to a string.
 */
export function serializeSvg(svgElement: SVGSVGElement): string {
  return new XMLSerializer().serializeToString(svgElement);
}
