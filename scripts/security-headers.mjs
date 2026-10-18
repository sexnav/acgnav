// Captured from the Codex 26.1013.4894.0 browser comment overlay on 2026-10-18.
// Only these exact inline stylesheets are allowed; scripts and other inline styles
// retain the original restrictions. Fixture bytes are pinned in .gitattributes.
export const browserAnnotationStyleHash = "sha256-WO55anZ1V8A0G22bY2t72RV4dI79SLI4VnYLgsEeWUc=";
// The native selector also injects document-level cursor/user-select rules.
// Its region, native-text and cleared states were observed during a real drag.
export const browserAnnotationSelectionStyleHashes = [
  "sha256-OUoShR0c3lqWNHEaHdorwfYnp/0EJHI/7QhTEUtan9w=",
  "sha256-6ddE/BE/E7OfXOyznfBSKxo7Dfm3OMuxy0O5a2y6TqI=",
  "sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=",
];

export const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self'",
  `style-src 'self' ${[browserAnnotationStyleHash, ...browserAnnotationSelectionStyleHashes].map((hash) => `'${hash}'`).join(" ")}`,
  "img-src 'self' https: data:",
  "connect-src 'self' https:",
  "font-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");
