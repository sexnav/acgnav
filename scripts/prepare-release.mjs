import { copyFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { PAGE_CONFIGS } from "../app/src/config.js";
import { contentSecurityPolicy as csp } from "./security-headers.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "public");
for (const name of ["404.html", "go.html", "nav.html"]) copyFileSync(path.join(output, "index.html"), path.join(output, name));
writeFileSync(path.join(output, "health.json"), JSON.stringify({ project: "acgnav", status: "ok", schemaVersion: 1 }) + "\n");
writeFileSync(path.join(output, "config.json"), JSON.stringify({
  schemaVersion: 1,
  brand: "GAMENTR.TOP",
  gateway: "https://gamentr.top/",
  gatewayAlias: "https://ntrgame.vercel.app/",
  mirrors: PAGE_CONFIGS.gateway.routes,
  targets: PAGE_CONFIGS.acg.routes,
}, null, 2) + "\n");
writeFileSync(path.join(output, "robots.txt"), "User-agent: *\nDisallow: /\n");
writeFileSync(path.join(output, "_headers"), `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  Content-Security-Policy: ${csp}
  Cache-Control: public, max-age=0, must-revalidate

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/health.json
  Access-Control-Allow-Origin: *
  Cache-Control: no-store, max-age=0
`);
writeFileSync(path.join(output, "_redirects"), "/acg /index.html 200\n/go /index.html 200\n");
writeFileSync(path.join(root, "vercel.json"), JSON.stringify({
  version: 2,
  framework: null,
  buildCommand: "",
  installCommand: "",
  outputDirectory: "public",
  headers: [
    { source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "Content-Security-Policy", value: csp },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
    ] },
    { source: "/assets/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    { source: "/health.json", headers: [{ key: "Access-Control-Allow-Origin", value: "*" }, { key: "Cache-Control", value: "no-store, max-age=0" }] },
  ],
  rewrites: [{ source: "/acg", destination: "/index.html" }, { source: "/go", destination: "/index.html" }],
}, null, 2) + "\n");
console.log(`Prepared ACGNAV release: ${output}`);
