import assert from "node:assert/strict";
import test from "node:test";
import { PAGE_CONFIGS, selectPageConfig, displayUrl } from "../app/src/config.js";

for (const host of ["acgxx.top", "www.acgxx.top", "ntrgame.vercel.app", "localhost"]) {
  test(`entry host ${host} selects gateway`, () => assert.equal(selectPageConfig(new URL(`https://${host}/`)).id, "gateway"));
}
for (const host of ["acgo.vercel.app", "acgo.pages.dev", "acgo.netlify.app"]) {
  test(`mirror ${host} selects publisher`, () => assert.equal(selectPageConfig(new URL(`https://${host}/`)).id, "acg"));
}
for (const path of ["/?view=acg", "/acg", "/acg/", "/go", "/go.html", "/nav.html"]) {
  test(`publisher path ${path}`, () => assert.equal(selectPageConfig(new URL(`https://ntrgame.vercel.app${path}`)).id, "acg"));
}
test("explicit gateway view wins on a mirror", () => assert.equal(selectPageConfig(new URL("https://acgo.pages.dev/?view=gateway")).id, "gateway"));
test("three exact mirror hosts and verifiable health documents", () => {
  assert.deepEqual(PAGE_CONFIGS.gateway.routes.map((r) => new URL(r.url).hostname), ["acgo.vercel.app", "acgo.pages.dev", "acgo.netlify.app"]);
  for (const route of PAGE_CONFIGS.gateway.routes) {
    assert.equal(route.probeType, "health");
    assert.equal(new URL(route.probeUrl).pathname, "/health.json");
    assert.equal(new URL(route.url).searchParams.get("view"), "acg");
  }
});
test("publisher lists the two live addresses without versions", () => {
  assert.equal("groups" in PAGE_CONFIGS.acg, false);
  assert.deepEqual(PAGE_CONFIGS.acg.routes.map((route) => [route.id, new URL(route.url).hostname]), [["acgxx", "acgxx.com"], ["acgyxj", "acgyxj.de"]]);
  assert.ok(PAGE_CONFIGS.acg.routes.every((route) => !("version" in route) && !route.note));
});
test("display strips routing queries", () => assert.equal(displayUrl("https://acgo.pages.dev/?view=acg"), "https://acgo.pages.dev"));
