import { useEffect, useMemo, useState } from "react";
import { displayUrl } from "./config.js";
import { useRouteProbe } from "./useRouteProbe.js";
import "./gateway.css";

function hostnameFor(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return displayUrl(url);
  }
}

export function GatewayLanding({ config }) {
  const { rows, running, doneCount, best, run } = useRouteProbe(config);
  const [enterRequested, setEnterRequested] = useState(false);

  useEffect(() => {
    document.title = config.documentTitle;
    document.body.classList.add("gateway-mode");

    const description = document.querySelector('meta[name="description"]');
    const themeColor = document.querySelector('meta[name="theme-color"]');
    description?.setAttribute("content", config.description);
    themeColor?.setAttribute("content", "#160824");

    return () => {
      document.body.classList.remove("gateway-mode");
      themeColor?.setAttribute("content", "#160824");
    };
  }, [config]);

  useEffect(() => {
    if (!enterRequested || running) return;

    if (best) {
      window.location.assign(best.url);
      return;
    }

    setEnterRequested(false);
  }, [best, enterRequested, running]);

  const status = useMemo(() => {
    if (running) {
      return {
        label: enterRequested ? "正在选择最快镜像" : config.probeLabel,
        value: `${doneCount}/${rows.length}`,
      };
    }

    if (best) {
      return {
        label: `已优选 ${best.name} · ${best.ms} ms`,
        value: hostnameFor(best.url),
      };
    }

    return {
      label: "本轮检测未找到可用镜像",
      value: "点击按钮重新检测",
    };
  }, [best, doneCount, enterRequested, rows.length, running, config.probeLabel]);

  const handleEnter = () => {
    if (!running && best) {
      window.location.assign(best.url);
      return;
    }

    setEnterRequested(true);
    if (!running) run();
  };

  const buttonLabel = enterRequested && running
    ? "正在选择…"
    : !running && !best
      ? "重新检测"
      : "立即进入";

  return (
    <main className="gateway-entry" aria-labelledby="gateway-title">
      <div className="gateway-entry__content">
        <h1 id="gateway-title" className="gateway-entry__title">
          {config.siteName}
        </h1>
        <p className="gateway-entry__subtitle">点击下方按钮进入最快镜像</p>

        <button
          className="gateway-entry__button"
          type="button"
          onClick={handleEnter}
          disabled={enterRequested && running}
        >
          {buttonLabel}
        </button>

        <div className="gateway-entry__status" role="status" aria-live="polite">
          <span className="gateway-entry__status-label">{status.label}</span>
          {best && !running ? (
            <a
              className="gateway-entry__status-value"
              href={best.url}
              rel="noopener noreferrer"
            >
              {status.value}
            </a>
          ) : (
            <span className="gateway-entry__status-value">{status.value}</span>
          )}
        </div>
        {!running && !best && (
          <nav className="gateway-entry__fallback" aria-label="手动选择镜像">
            {config.routes.map((route) => <a key={route.id} href={route.url}>{route.name}</a>)}
          </nav>
        )}
      </div>
    </main>
  );
}
