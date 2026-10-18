import assert from "node:assert/strict";
import test from "node:test";
import { PAGE_CONFIGS, selectPageConfig, displayUrl } from "../app/src/config.js";

for (const host of ["gamentr.top", "www.gamentr.top", "ntrgame.vercel.app", "localhost"]) {
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
test("version groups match the supplied domains", () => {
  assert.deepEqual(PAGE_CONFIGS.acg.routes.map((r) => [new URL(r.url).hostname, r.version]), [["acgxx.com", "2.0"], ["acgyxj.de", "2.0"], ["acgntr.com", "1.0"], ["gamentr.com", "1.0"]]);
});
test("display strips routing queries", () => assert.equal(displayUrl("https://acgo.pages.dev/?view=acg"), "https://acgo.pages.dev"));
