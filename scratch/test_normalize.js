
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.DOMParser = dom.window.DOMParser;
global.XMLSerializer = dom.window.XMLSerializer;
global.SVGSVGElement = dom.window.SVGSVGElement;

const TobiSvg = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN" "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">
<!-- Creator: CorelDRAW -->
<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="228px" height="325px" version="1.0" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd"
viewBox="0 0 228.02 324.98"
 xmlns:xlink="http://www.w3.org/1999/xlink"
 xmlns:xodm="http://www.corel.com/coreldraw/odm/2003">
 <defs>
    <linearGradient id="id0" gradientUnits="userSpaceOnUse" x1="26.91" y1="28.18" x2="201.37" y2="285.73">
     <stop offset="0" stop-opacity="1" stop-color="#101D24"/>
     <stop offset="1" stop-opacity="1" stop-color="#1F1D1C"/>
    </linearGradient>
 </defs>
 <g id="Camada_x0020_1">
  <metadata id="CorelCorpID_0Corel-Layer"/>
  <g id="_1716803215744">
   <path fill="url(#id0)" fill-rule="nonzero" d="M64.49 0.15c6.37,-0.67 9.99,0.78 12.73,6.71 25.7,-6.61 45.61,0.07 63.31,19.23 3.88,0.65 7.83,1.26 10.95,3.85 6.14,5.09 9.45,13.62 10.5,21.24 7.64,5.12 17.25,13.29 24.22,19.4 16.15,14.29 33.01,28.2 39.67,49.6 3.8,12.2 3.9,29.3 -11.11,33.82 -6.24,1.88 -11.42,-1.08 -16.67,-4.05 -10.49,17.62 -24.09,26.83 -43.27,32.83l0.47 3.23c12.3,14.04 25.76,35.76 25.76,55.09 0,4 -2,9.38 -5.11,11.94 -4.23,3.48 -8.02,3.56 -13.1,3.31 -3.86,6.86 -3.36,11.36 -4.13,19.01 -0.93,8.73 -1.8,17.46 -2.6,26.2 5.57,1.9 11.09,5.19 12.08,11.58 1.71,11.1 -17.69,9.11 -24.39,9.49 -3.46,0.2 -12.15,-1.18 -14.34,-3.53 -2.37,-2.51 -2.34,-14.5 -2.53,-18.37 -0.35,-6.77 -0.8,-13.53 -1.35,-20.28l-6.65 0.03c-1.14,9.01 -2.89,17.28 -3.03,26.5 0.04,3.42 0.49,11.82 -1.86,13.88 -6.02,5.23 -35.19,7.2 -35.63,-4.64 -0.16,-4.21 4.01,-8.52 6.97,-11.33 -0.53,-7.04 -2.64,-32.22 -5.27,-37.71 -0.3,-0.63 -0.45,-0.89 -1.16,-1.07 -2.24,-0.58 -4.77,-0.52 -7.07,-0.75 -4.26,-0.41 -8.15,-1.27 -12.18,-2.72 -6.95,-2.47 -20.26,-9.29 -23.36,-16.32 -0.93,-2.12 -0.79,-3.53 0,-5.66 -6.07,-6.87 -15.32,-18.26 -9.58,-29.04 1,-1.87 3.23,-0.87 4.45,0.44 8.46,9.11 15.69,17.71 25.14,25.89 1.54,-18.2 10.78,-38.06 21.37,-52.76 -0.06,-0.26 -0.13,-0.52 -0.19,-0.78 -0.6,-2.57 0.01,-3.66 1.35,-5.77 -14.87,-7.94 -19.41,-13.53 -26.64,-28.38 -5.17,11.14 -13.61,23.97 -26.54,26.26 -13.49,2.47 -23.46,-10.48 -25.22,-22.59 -3.9,-26.87 16.72,-52.27 31.49,-72.66 -0.58,-3.85 -0.67,-9.43 -0.17,-13.29 0.79,-6.04 3.2,-8.76 7.77,-12.29 -0.02,-1.01 -0.03,-2.02 -0.02,-3.04 0.07,-14.97 5.54,-23.61 15.78,-33.77 -4.77,-9.28 -0.54,-16.41 9.16,-18.74l0 0.01z"/>
  </g>
 </g>
</svg>
`;

function fixupSvgString(svgString) {
  if (svgString.charCodeAt(0) === 0xFEFF) svgString = svgString.slice(1);
  svgString = svgString.replace(/<\?xml.*\?>/gi, '');
  svgString = svgString.replace(/<!DOCTYPE.*?>/gi, '');
  const svgAttrs = svgString.match(/<svg [^>]*>/);
  if (svgAttrs && !svgAttrs[0].includes('xmlns=')) {
    svgString = svgString.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  }
  return svgString;
}

function parseSvgString(svgString) {
  const fixed = fixupSvgString(svgString);
  const parser = new DOMParser();
  const doc = parser.parseFromString(fixed, 'text/xml');
  return doc.documentElement;
}

function normalizeSvgDimensions(svgTag) {
  if (svgTag.getAttribute('viewBox') && svgTag.getAttribute('width') && svgTag.getAttribute('height')) {
      // Check if they have units
      if (!svgTag.getAttribute('width').includes('px') && !svgTag.getAttribute('height').includes('px')) {
          return;
      }
  }

  if (svgTag.getAttribute('viewBox')) {
    svgTag.setAttribute('width', String(svgTag.viewBox.baseVal.width));
    svgTag.setAttribute('height', String(svgTag.viewBox.baseVal.height));
  }
}

const sanitized = fixupSvgString(TobiSvg);
const el = parseSvgString(sanitized);
console.log("Before normalization:");
console.log("Width:", el.getAttribute('width'));
console.log("Height:", el.getAttribute('height'));

normalizeSvgDimensions(el);

console.log("After normalization:");
console.log("Width:", el.getAttribute('width'));
console.log("Height:", el.getAttribute('height'));
