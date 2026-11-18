import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { PAGE_CONFIGS } from "../app/src/config.js";

const retiredCopy = ["新版", "旧版", "备用", "1.0", "2.0", "acgntr.com", "gamentr.com"];

function collectStrings(value, found = []) {
  if (typeof value === "string") found.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, found));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collectStrings(item, found));
  return found;
}

test("publisher copy keeps the saved notices and omits the version split", async () => {
  const config = PAGE_CONFIGS.acg;
  assert.equal(config.eyebrow, "地址发布页 · 自动测速");
  assert.equal(config.titleLead, "ACGXX");
  assert.equal(config.heroText, "自动检测各地址之间的网络响应，也可以手动选择");
  assert.equal(config.recommendationLabel, "推荐入口");
  assert.equal(config.description, "ACGXX 永久地址发布页，自动检测 acgxx.com、acgyxj.de 的网络响应，也可以手动选择。");
  assert.equal(config.recommendationTestingDetail, "正在检测两个地址，完成后推荐响应最快的入口。");
  assert.equal(config.sectionTitle, "全部地址");
  assert.equal("groups" in config, false);
  assert.ok(config.routes.every((route) => !route.note && !("version" in route)));
  for (const text of collectStrings(PAGE_CONFIGS)) {
    for (const banned of retiredCopy) assert.ok(!text.includes(banned), `${banned} in ${text}`);
  }
  const indexHtml = readFileSync(new URL("../app/index.html", import.meta.url), "utf8");
  const description = indexHtml.match(/name="description"\s+content="([^"]*)"/)[1];
  const manifest = JSON.parse(readFileSync(new URL("../app/static/manifest.json", import.meta.url), "utf8")).description;
  for (const banned of retiredCopy) {
    assert.ok(!description.includes(banned), banned);
    assert.ok(!manifest.includes(banned), banned);
  }
  assert.deepEqual(config.notices, [
    "收藏 gamentr.top 永久地址发布页，回家不迷路。",
    "最终内容以目标站实际打开的页面为准。",
    "测速仅反映当前网络响应，不代表目标站内容或功能验证；超时地址仍可手动尝试。",
  ]);
  assert.equal(config.footer, "GAMENTR.TOP · 永久地址发布页");

  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  try {
    const { AddressPublisher } = await server.ssrLoadModule("/src/AddressPublisher.jsx");
    const html = renderToStaticMarkup(createElement(AddressPublisher, { config }));
    assert.ok(html.includes('<span class="hl">ACGXX</span>'));
    assert.ok(html.includes('<span>推荐入口</span>'));
    assert.ok(html.includes('<ol class="notice-list">'));
    for (const text of config.notices) assert.ok(html.includes(text));
    assert.ok(!html.includes("route-note"));
    assert.ok(!html.includes("route-group"));
    assert.ok(!html.includes("version-badge"));
    assert.equal(html.match(/<ol class="line-list"/g).length, 1);
    assert.ok(html.includes("https://acgxx.com/"));
    assert.ok(html.includes("https://acgyxj.de/"));
    assert.ok(!html.includes("优先推荐 · 两个地址"));
    assert.ok(!html.includes("保留旧版 · 按需访问"));
    assert.ok(!html.includes("<span></span>"));
    for (const banned of retiredCopy) assert.ok(!html.includes(banned), banned);
  } finally {
    await server.close();
  }
});
