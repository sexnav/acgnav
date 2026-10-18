export const FAST_LIMIT = 280;
export const SLOW_LIMIT = 800;

export function initialRows(routes) {
  return routes.map((route, index) => ({ ...route, index, status: "wait", ms: null }));
}

export function pickBest(rows, preferredVersion) {
  const available = rows.filter((row) => row.status === "ok" && Number.isFinite(row.ms));
  const preferred = preferredVersion ? available.filter((row) => row.version === preferredVersion) : [];
  return [...(preferred.length ? preferred : available)].sort((a, b) => a.ms - b.ms || a.index - b.index)[0] || null;
}

export function gradeFor(row) {
  if (row.status !== "ok") return row.status;
  if (row.ms <= FAST_LIMIT) return "fast";
  return row.ms <= SLOW_LIMIT ? "mid" : "slow";
}

export function barWidth(row) {
  if (row.status === "testing") return 38;
  if (row.status === "fail") return 100;
  if (row.status !== "ok") return 0;
  return Math.min(100, Math.max(6, row.ms / 10));
}

export async function probeRoute(route, { timeout, rounds, signal, fetcher = fetch, clock = () => performance.now() }) {
  if (globalThis.location?.protocol === "https:" && /^http:\/\//i.test(route.probeUrl || route.url)) {
    return { ...route, status: "blocked", ms: null };
  }
  let best = Infinity;
  for (let round = 0; round < rounds; round += 1) {
    if (signal?.aborted) throw new DOMException("Probe cancelled", "AbortError");
    const controller = new AbortController();
    const cancel = () => controller.abort();
    signal?.addEventListener("abort", cancel, { once: true });
    const timer = setTimeout(cancel, timeout);
    const started = clock();
    try {
      const url = new URL(route.probeUrl || route.url);
      url.searchParams.set("_speed", `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      const response = await fetcher(url.href, {
        mode: route.probeType === "health" ? "cors" : "no-cors",
        cache: "no-store",
        credentials: "omit",
        redirect: "follow",
        referrerPolicy: "no-referrer",
        signal: controller.signal,
      });
      if (route.probeType === "health") {
        if (!response.ok) throw new Error("Mirror HTTP error");
        const health = await response.json();
        if (health.project !== "acgnav" || health.status !== "ok") throw new Error("Mirror identity mismatch");
      } else if (response.type !== "opaque" && !response.ok) {
        throw new Error("Target HTTP error");
      }
      if (!controller.signal.aborted) best = Math.min(best, clock() - started);
    } catch {
      if (signal?.aborted) throw new DOMException("Probe cancelled", "AbortError");
      // One failed sample does not override a successful independent sample.
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", cancel);
    }
  }
  return { ...route, status: Number.isFinite(best) ? "ok" : "fail", ms: Number.isFinite(best) ? Math.max(1, Math.round(best)) : null };
}
