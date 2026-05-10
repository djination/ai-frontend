/**
 * Hanya mengizinkan path relatif internal di bawah /app/ (cegah open redirect).
 * @param {unknown} path
 * @returns {string}
 */
export function sanitizeAppInternalPath(path) {
  if (typeof path !== 'string') {
    return '/app/learn';
  }
  let p = path.trim();
  if (!p.startsWith('/')) {
    return '/app/learn';
  }
  if (p.startsWith('//')) {
    return '/app/learn';
  }
  if (!p.startsWith('/app/')) {
    return '/app/learn';
  }
  if (p.includes('://')) {
    return '/app/learn';
  }
  return p.length > 256 ? '/app/learn' : p;
}
