import { useEffect, useMemo, useRef, useState } from "react";
import { barWidth, gradeFor, useRouteProbe } from "./useRouteProbe.js";
import { displayUrl } from "./config.js";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  return reduced;
}

function AnimatedNumber({ value }) {
  const reducedMotion = useReducedMotion();
  const [shown, setShown] = useState(reducedMotion ? value : 0);

  useEffect(() => {
    if (reducedMotion || value <= 0) {
      setShown(value);
      return undefined;
    }

    let frame = 0;
    const started = performance.now();
    const duration = Math.min(520, 220 + value / 3);
    const step = (now) => {
      const progress = Math.min(1, (now - started) / duration);
      setShown(Math.round(value * (progress * (2 - progress))));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion, value]);

  return shown;
}

function useToast() {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const timer = useRef(0);

  const show = (nextMessage) => {
    window.clearTimeout(timer.current);
    setMessage(nextMessage);
    setVisible(true);
    timer.current = window.setTimeout(() => setVisible(false), 2400);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);
  return { message, visible, show };
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.cssText = "position:fixed;top:-999px;opacity:0";
    document.body.appendChild(textarea);
    textarea.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    textarea.remove();
    return copied;
  }
}

function RouteMetric({ row }) {
  if (row.status === "ok") {
    return (
      <span className="ms">
        <b><AnimatedNumber value={row.ms} /></b> ms
      </span>
    );
  }

  const labels = {
    wait: "待检测",
    testing: "检测中",
    fail: "超时",
    blocked: "未完成",
  };
  return <span className="ms">{labels[row.status] || "待检测"}</span>;
}

function RouteRow({ row, onCopy }) {
  const grade = gradeFor(row);
  const title =
    row.status === "fail"
      ? "连接超时：该入口当前可能不可用"
      : row.status === "blocked"
        ? "浏览器限制了该入口的自动检测，可直接点击访问尝试"
        : undefined;

  return (
    <li className="line" data-grade={grade} title={title}>
      <div className="line-id">
        <span className="dot" aria-hidden="true" />
        <div className="line-names">
          <span className="line-name">{row.name} <span className="version-badge" data-version={row.version}>{row.version}</span></span>
          <a
            className="line-url"
            href={row.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {displayUrl(row.url)}
          </a>
          {row.note && <span className="route-note">{row.note}</span>}
        </div>
      </div>
      <div className="line-metric">
        <span className={`bar${row.status === "testing" ? " busy" : ""}`} aria-hidden="true">
          <i style={{ width: `${barWidth(row)}%` }} />
        </span>
        <RouteMetric row={row} />
      </div>
      <div className="line-actions">
        <a
          className="btn btn-solid go"
          href={row.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          访问
        </a>
        <button className="btn btn-ghost copy" type="button" onClick={() => onCopy(row.url)}>
          复制
        </button>
      </div>
    </li>
  );
}

export function AddressPublisher({ config }) {
  const { rows, running, doneCount, completedAt, best: probedBest, availableCount, run } =
    useRouteProbe(config);
  const best = running ? null : probedBest;
  const toast = useToast();
  const isMac = useMemo(
    () => /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent),
    [],
  );
  const shortcut = isMac ? "⌘ + D" : "Ctrl + D";

  useEffect(() => {
    document.title = config.documentTitle;
    document.body.classList.add("publisher-mode");
    const description = document.querySelector('meta[name="description"]');
    const themeColor = document.querySelector('meta[name="theme-color"]');
    description?.setAttribute("content", config.description);
    themeColor?.setAttribute("content", "#160824");

    return () => {
      document.body.classList.remove("publisher-mode");
    };
  }, [config]);

  const handleCopy = async (url) => {
    const copied = await copyText(url);
    toast.show(
      copied
        ? `已复制：${displayUrl(url)}`
        : "复制失败，请长按或选中地址手动复制",
    );
  };

  const recommendationState = running ? "testing" : best ? "done" : "none";
  const recommendationUrl = best ? displayUrl(best.url) : running ? config.recommendationTesting : "自动检测未成功";
  const recommendationDetail = running
    ? config.recommendationTestingDetail
    : config.recommendationNoneDetail;
  const statusText = running
    ? `正在检测 ${doneCount}/${rows.length} …`
    : completedAt
      ? `检测完成 ${completedAt} · ${availableCount}/${rows.length} ${config.countUnit}`
      : "正在准备检测…";

  return (
    <>
      <div className="wrap">
        <header className="masthead">
          <div className="brand">
            <span className="brand-dot" aria-hidden="true" />
            <span className="brand-name">{config.siteName}</span>
            <span className="brand-tag">官方发布页</span>
          </div>
          <button
            className="bookmark"
            type="button"
            onClick={() => toast.show(`请按 ${shortcut} 将本页加入书签，防止失联`)}
          >
            <span aria-hidden="true">☆</span> 收藏本页 <kbd>{shortcut}</kbd>
          </button>
        </header>

        <main>
          <section className="hero" aria-labelledby="page-title">
            <p className="eyebrow">{config.eyebrow}</p>
            <h1 id="page-title">
              <span className="hl">{config.titleLead}</span> {config.heroSuffix}
            </h1>
            <p className="hero-sub">{config.heroText}</p>
          </section>

          <section
            className="reco"
            data-state={recommendationState}
            aria-live="polite"
            aria-label="推荐入口"
          >
            <p className="reco-label">
              <span className="reco-bolt" aria-hidden="true">⚡</span>
              <span>{best?.version === "1.0" ? "1.0 备用推荐 · 新版本轮未响应" : best || running ? config.recommendationLabel : config.recommendationEmpty}</span>
            </p>
            <div className="reco-body">
              <div className="reco-main">
                {best ? (
                  <a
                    className="reco-url"
                    href={best.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {recommendationUrl}
                  </a>
                ) : (
                  <span className="reco-url">
                    {recommendationUrl}
                    {running && (
                      <span className="dots" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span>
                    )}
                  </span>
                )}
                <p className="reco-meta">
                  {best ? (
                    <>网络响应 · <b>{best.ms}</b> ms · {best.name} · {best.version}</>
                  ) : recommendationDetail}
                </p>
              </div>
              {best && (
                <div className="reco-actions">
                  <a
                    className="btn btn-solid btn-lg"
                    href={best.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {config.primaryAction}
                  </a>
                  <button
                    className="btn btn-ghost btn-lg"
                    type="button"
                    onClick={() => handleCopy(best.url)}
                  >
                    复制地址
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="lines" aria-labelledby="routes-title">
            <div className="lines-head">
              <h2 id="routes-title">{config.sectionTitle}</h2>
              <div className="lines-meta">
                <span className="test-status" role="status">{statusText}</span>
                <button
                  className={`btn btn-ghost retest${running ? " running" : ""}`}
                  type="button"
                  disabled={running}
                  onClick={run}
                >
                  <span className="icon" aria-hidden="true">↻</span>
                  {running ? "检测中…" : "重新检测"}
                </button>
              </div>
            </div>
            <p className="legend" aria-hidden="true">
              <i className="l-ok" />≤280ms 流畅{" "}
              <i className="l-mid" />280–800ms 一般{" "}
              <i className="l-bad" />&gt;800ms / 超时 较慢
            </p>
            {config.groups.map((group) => (
              <div className="route-group" key={group.version}>
                <div className="route-group__heading">
                  <h3>{group.title}</h3>
                  {group.description && <span>{group.description}</span>}
                </div>
                <ol className="line-list" aria-label={group.title}>
                  {rows.filter((row) => row.version === group.version).map((row) => (
                    <RouteRow key={row.id} row={row} onCopy={handleCopy} />
                  ))}
                </ol>
              </div>
            ))}
          </section>

          <section className="notices" aria-labelledby="notice-title">
            <h3 id="notice-title">温馨提示</h3>
            <ol className="notice-list">
              {config.notices.map((notice) => <li key={notice}>{notice}</li>)}
            </ol>
          </section>
        </main>

        <footer>
          <p>© {new Date().getFullYear()} {config.footer}</p>
        </footer>
      </div>

      <div className={`toast${toast.visible ? " show" : ""}`} role="status" aria-live="polite">
        {toast.message}
      </div>
    </>
  );
}
