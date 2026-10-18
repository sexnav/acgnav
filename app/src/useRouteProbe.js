import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { initialRows, pickBest, probeRoute } from "./probe.js";
export { barWidth, gradeFor } from "./probe.js";

export function useRouteProbe(config) {
  const [rows, setRows] = useState(() => initialRows(config.routes));
  const [running, setRunning] = useState(true);
  const [doneCount, setDoneCount] = useState(0);
  const [completedAt, setCompletedAt] = useState("");
  const currentRun = useRef(null);

  const run = useCallback(async () => {
    currentRun.current?.abort();
    const controller = new AbortController();
    currentRun.current = controller;
    setRunning(true);
    setDoneCount(0);
    setCompletedAt("");
    setRows(initialRows(config.routes).map((row) => ({ ...row, status: "testing" })));
    try {
      const results = await Promise.all(config.routes.map(async (route, index) => {
        const result = await probeRoute({ ...route, index }, { timeout: config.timeout, rounds: config.rounds, signal: controller.signal });
        if (!controller.signal.aborted) {
          setRows((before) => before.map((row) => row.id === result.id ? result : row));
          setDoneCount((n) => n + 1);
        }
        return result;
      }));
      if (controller.signal.aborted) return;
      setRows(results);
      setCompletedAt(new Date().toLocaleTimeString("zh-CN", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setRunning(false);
    } catch (error) {
      if (!controller.signal.aborted) {
        setRows(initialRows(config.routes).map((row) => ({ ...row, status: "fail" })));
        setRunning(false);
      }
    }
  }, [config]);

  useEffect(() => { run(); return () => currentRun.current?.abort(); }, [run]);
  const best = useMemo(() => pickBest(rows, config.id === "acg" ? "2.0" : undefined), [rows, config.id]);
  return { rows, running, doneCount, completedAt, best, availableCount: rows.filter((row) => row.status === "ok").length, run };
}
