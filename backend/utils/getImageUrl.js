const BASE = process.env.IMAGE_HOST || 'http://127.0.0.1:8000';

function getImageUrl(path) {
  if (!path) return null;
  // If already absolute URL, return as-is
  if (typeof path === 'string' && (path.startsWith('http://') || path.startsWith('https://'))) {
    return path;
  }

  // Normalize leading slash
  const p = path.startsWith('/') ? path : `/${path}`;

  // If WEBSITE_URL is provided, append it after base host
  const website = process.env.WEBSITE_URL || '';
  const sitePath = website.endsWith('/') ? website.slice(0, -1) : website;

  return `${BASE}${sitePath}${p}`;
}

module.exports = getImageUrl;
