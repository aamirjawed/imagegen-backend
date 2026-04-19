/**
 * Strip dangerous characters from user text (XSS prevention in SVG)
 */
function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '') // strip HTML/XML tags
    .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '') // printable unicode only
    .trim()
    .slice(0, 500); // hard cap per field
}

function sanitizeTextData(obj) {
  if (!obj || typeof obj !== 'object') return {};
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof key === 'string' && key.length <= 64) {
      result[key] = sanitizeText(String(val ?? ''));
    }
  }
  return result;
}

module.exports = { sanitizeText, sanitizeTextData };
