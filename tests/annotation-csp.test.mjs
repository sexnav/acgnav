import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { contentSecurityPolicy } from "../scripts/security-headers.mjs";

const read = (name) => readFileSync(new URL(name, import.meta.url), "utf8");
const css = read("./fixtures/browser-annotation.css");
const allowedStyle = `'sha256-${createHash("sha256").update(css, "utf8").digest("base64")}'`;
const selectionStyles = [
  read("./fixtures/browser-annotation-selection.css"),
  read("./fixtures/browser-annotation-text-selection.css"),
  "", // The client clears its temporary stylesheet between selection modes.
];
const vercel = JSON.parse(read("../vercel.json")).headers.find((rule) => rule.source === "/(.*)").headers.find((header) => header.key === "Content-Security-Policy").value;
const pages = read("../public/_headers").match(/^\s+Content-Security-Policy: (.+)$/m)[1];

for (const [platform, csp] of [["Generator", contentSecurityPolicy], ["Vercel", vercel], ["Cloudflare/Netlify", pages]]) {
  test(`${platform}: admits the exact observed browser annotation stylesheet`, () => {
    const styleSrc = csp.split(";").map((part) => part.trim()).find((part) => part.startsWith("style-src "));
    assert.ok(styleSrc?.split(/\s+/).includes(allowedStyle), `annotation style blocked; expected ${allowedStyle} in ${styleSrc}`);
  });

  test(`${platform}: keeps script and other style protections intact`, () => {
    assert.equal(csp.split(";").map((part) => part.trim()).find((part) => part.startsWith("script-src ")), "script-src 'self'");
    assert.ok(!csp.includes("'unsafe-inline'"));
    assert.ok(!csp.includes("'unsafe-eval'"));
    assert.ok(csp.includes("object-src 'none'"));
    assert.ok(csp.includes("frame-ancestors 'none'"));
  });

  test(`${platform}: admits native selection, text selection and cleanup styles`, () => {
    const styleSrc = csp.split(";").map((part) => part.trim()).find((part) => part.startsWith("style-src "));
    for (const text of selectionStyles) {
      const hash = `'sha256-${createHash("sha256").update(text, "utf8").digest("base64")}'`;
      assert.ok(styleSrc?.split(/\s+/).includes(hash), `selection style blocked; expected ${hash}`);
    }
  });
}

test("generator and both platform policies have one shared value", () => {
  assert.equal(vercel, pages);
  assert.equal(vercel, contentSecurityPolicy);
});

test("HTML changes with CSP so cached documents cannot retain the old annotation policy", () => {
  const revision = createHash("sha256").update(contentSecurityPolicy).digest("hex").slice(0, 16);
  for (const page of ["index.html", "404.html", "go.html", "nav.html"]) {
    assert.ok(read(`../public/${page}`).includes(`<meta name="security-policy-revision" content="${revision}" />`), `${page} has no current CSP revision`);
  }
});
