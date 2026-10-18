import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { PAGE_CONFIGS } from "../app/src/config.js";
const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
const html = read("../public/index.html");
const assets = readdirSync(new URL("../public/assets/", import.meta.url));
for (const ext of ["js", "css"]) {
  const asset = assets.find((file) => new RegExp(`^index-.*\\.${ext}$`).test(file));
  assert.ok(asset);
  assert.ok(html.includes(asset));
}
assert.deepEqual(JSON.parse(read("../public/health.json")), { project: "acgnav", status: "ok", schemaVersion: 1 });
assert.equal(PAGE_CONFIGS.gateway.routes.length, 3);
assert.equal(PAGE_CONFIGS.acg.routes.length, 4);
assert.equal(JSON.parse(read("../vercel.json")).outputDirectory, "public");
assert.ok(read("../public/_headers").includes("Access-Control-Allow-Origin: *"));
assert.ok(!html.includes("SEX123"));
assert.ok(!read(`../public/assets/${assets.find((f) => f.endsWith(".js"))}`).includes("sex123.netlify.app"));
console.log("Release verification passed: assets, identity, routes, CORS, platform config and project isolation.");
