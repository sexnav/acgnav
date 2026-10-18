// Captured from the Codex 26.1013.4894.0 browser comment overlay on 2026-10-18.
// Only this exact inline stylesheet is allowed; scripts and other inline styles
// retain the original restrictions. Fixture bytes are pinned in .gitattributes.
export const browserAnnotationStyleHash = "sha256-WO55anZ1V8A0G22bY2t72RV4dI79SLI4VnYLgsEeWUc=";

export const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self'",
  `style-src 'self' '${browserAnnotationStyleHash}'`,
  "img-src 'self' https: data:",
  "connect-src 'self' https:",
  "font-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");
