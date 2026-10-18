export const MIRROR_HOSTS = new Set([
  "acgo.vercel.app",
  "acgo.pages.dev",
  "acgo.netlify.app",
]);

export const PAGE_CONFIGS = {
  gateway: {
    id: "gateway",
    siteName: "GAMENTR.TOP",
    documentTitle: "GAMENTR.TOP - ACG 永久入口",
    description: "GAMENTR.TOP ACG 永久入口，智能检测 Vercel、Cloudflare Pages 和 Netlify 三个平台镜像。",
    probeLabel: "三平台智能测速中",
    timeout: 3500,
    rounds: 2,
    routes: [
      { id: "vercel", name: "Vercel 镜像", url: "https://acgo.vercel.app/?view=acg", probeUrl: "https://acgo.vercel.app/health.json", probeType: "health" },
      { id: "cloudflare", name: "Cloudflare 镜像", url: "https://acgo.pages.dev/?view=acg", probeUrl: "https://acgo.pages.dev/health.json", probeType: "health" },
      { id: "netlify", name: "Netlify 镜像", url: "https://acgo.netlify.app/?view=acg", probeUrl: "https://acgo.netlify.app/health.json", probeType: "health" },
    ],
  },
  acg: {
    id: "acg",
    siteName: "GAMENTR.TOP",
    titleLead: "ACGXX",
    documentTitle: "ACGXX 最新可用地址 | GAMENTR.TOP",
    description: "ACGXX 永久地址发布页，自动检测 acgxx.com、acgyxj.de、acgntr.com、gamentr.com 的网络响应，也可以手动选择。",
    eyebrow: "地址发布页 · 自动测速",
    heroSuffix: "最新可用地址",
    heroText: "自动检测各地址之间的网络响应，也可以手动选择",
    recommendationLabel: "推荐入口",
    recommendationEmpty: "请手动选择入口",
    recommendationTesting: "正在检测最快地址",
    recommendationTestingDetail: "正在检测四个地址；优先选择 2.0，旧版入口保持可选。",
    recommendationNoneDetail: "本轮自动检测未完成，请重新检测，或手动尝试下方入口。",
    primaryAction: "立即访问",
    sectionTitle: "全部地址",
    countUnit: "个地址有响应",
    groups: [
      { version: "2.0", title: "2.0 新版入口" },
      { version: "1.0", title: "1.0 旧版入口" },
    ],
    notices: [
      "收藏 gamentr.top 永久地址发布页，回家不迷路。",
      "最终内容以目标站实际打开的页面为准。",
      "测速仅反映当前网络响应，不代表目标站内容或功能验证；超时地址仍可手动尝试。",
    ],
    footer: "GAMENTR.TOP · 永久地址发布页",
    timeout: 4000,
    rounds: 2,
    routes: [
      { id: "acgxx", name: "ACGXX", version: "2.0", url: "https://acgxx.com/" },
      { id: "acgyxj", name: "ACGYXJ", version: "2.0", url: "https://acgyxj.de/" },
      { id: "acgntr", name: "ACGNTR", version: "1.0", url: "https://acgntr.com/" },
      { id: "gamentr", name: "GAMENTR", version: "1.0", url: "https://gamentr.com/" },
    ],
  },
};

export function selectPageConfig(locationLike = window.location) {
  const params = new URLSearchParams(locationLike.search);
  const pathname = locationLike.pathname.replace(/\/+$/, "") || "/";
  if (params.get("view") === "gateway") return PAGE_CONFIGS.gateway;
  const publisher = params.get("view") === "acg" || ["/acg", "/go", "/go.html", "/nav.html"].includes(pathname);
  return publisher || MIRROR_HOSTS.has(locationLike.hostname) ? PAGE_CONFIGS.acg : PAGE_CONFIGS.gateway;
}

export function displayUrl(url) {
  return url.replace(/[?#].*$/, "").replace(/\/$/, "");
}
