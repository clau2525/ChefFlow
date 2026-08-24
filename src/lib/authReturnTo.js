// Shared by the auth pages (Login, Register). Keep the redirect validation in
// one place — it is security-sensitive and easy to drift.

// Resolve a ?returnTo= value to a safe in-app route, else "/".
//
// These are HashRouter paths, so they never leave the page — but a value like
// "//evil.com" or "/\evil.com" would still normalize to a protocol-relative URL
// if it ever reached location.href. Require exactly one leading slash, and no
// backslash, so only real in-app routes get through.
export function safeReturnTo(raw) {
  if (!raw) return '/';
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return '/';
  return raw;
}

/** Build the `?returnTo=` suffix for a link between the auth pages. */
export function returnToQuery(returnTo) {
  return returnTo && returnTo !== '/' ? `?returnTo=${encodeURIComponent(returnTo)}` : '';
}
