// Where a link may send someone after signing in: only a path on this site.
// Resolving it first catches tricks such as "//host" or "/\host", which
// browsers treat as another site. Anything else falls back to `fallback`.
export function safeNext(value: string | null, base: string, fallback: string): URL {
  const origin = new URL(base).origin;
  if (value?.startsWith("/")) {
    try {
      const url = new URL(value, origin);
      if (url.origin === origin) return url;
    } catch {
      // Not a valid address: use the fallback.
    }
  }
  return new URL(fallback, origin);
}
