import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { PAGE_CONFIGS } from "../app/src/config.js";

test("publisher copy matches the nine saved browser comments", async () => {
  const config = PAGE_CONFIGS.acg;
  assert.equal(config.eyebrow, "地址发布页 · 自动测速");
  assert.equal(config.titleLead, "ACGXX");
  assert.equal(config.heroText, "自动检测各地址之间的网络响应，也可以手动选择");
  assert.equal(config.recommendationLabel, "推荐入口");
  assert.ok(config.groups.every((group) => !group.description));
  assert.ok(config.routes.every((route) => !route.note));
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
    assert.ok(!html.includes('route-note'));
    assert.ok(!html.includes('优先推荐 · 两个地址'));
    assert.ok(!html.includes('保留旧版 · 按需访问'));
    assert.ok(!html.includes('<span></span>'));
  } finally {
    await server.close();
  }
});
