import assert from "node:assert/strict";
import test from "node:test";
import { initialRows, pickBest, gradeFor, barWidth, probeRoute } from "../app/src/probe.js";

const route = { id: "v", index: 0, url: "https://acgo.vercel.app/", probeUrl: "https://acgo.vercel.app/health.json", probeType: "health" };
const health = (project = "acgnav") => ({ ok: true, json: async () => ({ project, status: "ok" }) });
const options = (fetcher, extra = {}) => ({ timeout: 100, rounds: 2, fetcher, clock: (() => { let n = 0; return () => n += 20; })(), ...extra });

test("empty rows are pending", () => assert.deepEqual(initialRows([{ id: "a" }]), [{ id: "a", index: 0, status: "wait", ms: null }]));
test("gateway chooses globally fastest verified mirror", () => {
  assert.equal(pickBest([{ id: "a", status: "ok", ms: 60 }, { id: "b", status: "ok", ms: 30 }, { id: "c", status: "fail", ms: 1 }]).id, "b");
});
test("2.0 remains preferred over faster 1.0", () => {
  assert.equal(pickBest([{ id: "old", version: "1.0", status: "ok", ms: 10 }, { id: "new", version: "2.0", status: "ok", ms: 100 }], "2.0").id, "new");
});
test("1.0 fallback only when no 2.0 responds", () => {
  assert.equal(pickBest([{ id: "old", version: "1.0", status: "ok", ms: 10 }, { id: "new", version: "2.0", status: "fail", ms: null }], "2.0").id, "old");
});
test("all failed routes yield no invented recommendation", () => assert.equal(pickBest([{ status: "fail", ms: null }]), null));
test("status thresholds and bars", () => {
  for (const [ms, grade] of [[280, "fast"], [281, "mid"], [800, "mid"], [801, "slow"]]) assert.equal(gradeFor({ status: "ok", ms }), grade);
  assert.equal(barWidth({ status: "testing" }), 38);
  assert.equal(barWidth({ status: "fail" }), 100);
  assert.equal(barWidth({ status: "ok", ms: 5 }), 6);
  assert.equal(barWidth({ status: "ok", ms: 2000 }), 100);
});
test("health probe validates identity, CORS mode and credential omission", async () => {
  const calls = [];
  const result = await probeRoute(route, options(async (url, opts) => { calls.push({ url, opts }); return health(); }));
  assert.equal(result.status, "ok");
  assert.equal(result.ms, 20);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].opts.mode, "cors");
  assert.equal(calls[0].opts.credentials, "omit");
  assert.ok(new URL(calls[0].url).searchParams.has("_speed"));
});
test("404 and unrelated health pages fail", async () => {
  for (const res of [{ ok: false }, health("other-project"), { ok: true, json: async () => { throw new Error("HTML"); } }]) {
    assert.equal((await probeRoute(route, options(async () => res))).status, "fail");
  }
});
test("one failing round still preserves a successful sample", async () => {
  let n = 0;
  const res = await probeRoute(route, options(async () => { if (n++ === 0) throw new Error("network"); return health(); }));
  assert.equal(res.status, "ok");
});
test("opaque target response is reachability, never parsed as health", async () => {
  let mode;
  const res = await probeRoute({ id: "t", url: "https://acgxx.com/" }, options(async (_, opts) => { mode = opts.mode; return { type: "opaque", ok: false }; }));
  assert.equal(res.status, "ok");
  assert.equal(mode, "no-cors");
});
test("timeout aborts and produces a failed route", async () => {
  const fetcher = (_, opts) => new Promise((resolve, reject) => opts.signal.addEventListener("abort", () => reject(new DOMException("timeout", "AbortError"))));
  const res = await probeRoute(route, options(fetcher, { timeout: 5, rounds: 1 }));
  assert.equal(res.status, "fail");
  assert.equal(res.ms, null);
});
test("cancelled run rejects instead of overwriting a later run", async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(probeRoute(route, options(async () => health(), { signal: controller.signal })), { name: "AbortError" });
});
