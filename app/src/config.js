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
    titleLead: "ACG",
    documentTitle: "ACG 2.0 / 1.0 地址发布页 | GAMENTR.TOP",
    description: "ACG 地址发布页，检测 acgxx.com、acgyxj.de、acgntr.com、gamentr.com 的网络响应，按 2.0 / 1.0 分组。",
    eyebrow: "ACG 地址发布页 · 2.0 / 1.0 · 自动测速",
    heroSuffix: "最新可用地址",
    heroText: "检测你与各个地址之间的网络响应，优先推荐响应最快的 2.0 地址。1.0 旧版入口独立保留，你也可以随时手动选择。",
    recommendationLabel: "优先推荐 2.0",
    recommendationEmpty: "请手动选择入口",
    recommendationTesting: "正在检测最快地址",
    recommendationTestingDetail: "正在检测四个地址；优先选择 2.0，旧版入口保持可选。",
    recommendationNoneDetail: "本轮自动检测未完成，请重新检测，或手动尝试下方入口。",
    primaryAction: "立即访问",
    sectionTitle: "全部地址",
    countUnit: "个地址有响应",
    groups: [
      { version: "2.0", title: "2.0 新版入口", description: "优先推荐 · 两个地址" },
      { version: "1.0", title: "1.0 旧版入口", description: "保留旧版 · 按需访问" },
    ],
    notices: [
      "请收藏 gamentr.top 永久入口，入口页会智能选择三个平台中响应最快的镜像。",
      "2.0 / 1.0 按站点版本分组；域名可能存在跳转，最终内容以目标站实际打开的页面为准。",
      "测速仅反映当前网络响应，不是传统 Ping，也不代表目标站内容或功能验证；超时地址仍可手动尝试。",
    ],
    footer: "GAMENTR.TOP · ACG 地址发布服务",
    timeout: 4000,
    rounds: 2,
    routes: [
      { id: "acgxx", name: "ACGXX", version: "2.0", url: "https://acgxx.com/" },
      { id: "acgyxj", name: "ACGYXJ", version: "2.0", url: "https://acgyxj.de/", note: "当前跳转 www.gamentr.com，版本以落地站为准" },
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
