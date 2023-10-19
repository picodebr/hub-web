/**
 * Format html code to avoid character conflict
 * @param html Html source code minified
 * @returns Html formatted
 */
export function escape(htmlStr: string) {
  return htmlStr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/**
 * Format html code to display
 * @param html Html source escaped
 * @returns Html formatted
 */
export function unEscape(htmlStr: string) {
  htmlStr = htmlStr.replace(/&lt;/g, '<');
  htmlStr = htmlStr.replace(/&gt;/g, '>');
  htmlStr = htmlStr.replace(/&quot;/g, '"');
  htmlStr = htmlStr.replace(/&#39;/g, "'");
  htmlStr = htmlStr.replace(/&amp;/g, '&');
  htmlStr = htmlStr.replace(/[\r\n\t]/g, '');

  return htmlStr;
}

/**
 * Remove backslash marks
 * @param html Html source code unEscaped
 * @returns Html formatted ready to display
 */
export function removeBackslash(htmlStr: string) {
  return htmlStr.replace(/\"/g, '"');
}
