# ACGNAV · GAMENTR.TOP

独立的 ACG 双层地址发布项目，沿用统一紫色品牌系统。

## 入口与镜像

- 永久入口：<https://gamentr.top/>（Vercel 项目：`ntrgame`）
- 入口别名：<https://ntrgame.vercel.app/>
- Vercel 镜像：<https://acgo.vercel.app/>
- Cloudflare Pages 镜像：<https://acgo.pages.dev/>
- Netlify 镜像：<https://acgo.netlify.app/>

入口检测三个镜像的 CORS health 文档，点击“立即进入”后进入本轮最快的镜像。测速未结束时点击，会等待本轮结束后跳转；全部失败时显示重试与手动入口。

## 目标地址

| 分组 | 域名 |
| --- | --- |
| 2.0 | <https://acgxx.com/> |
| 2.0 | <https://acgyxj.de/> |
| 1.0 | <https://acgntr.com/> |
| 1.0 | <https://gamentr.com/> |

目标页优先推荐有响应的 2.0 地址，仅当全部 2.0 本轮未响应时推荐 1.0 备用地址。两组始终可见。2026-10-18 实测 `acgyxj.de` 重定向至 `www.gamentr.com`，界面按请求保留 2.0 分类并注明该现状。

**检测边界：** 镜像必须返回本项目的有效 health JSON；目标站采用跨域无凭据网络探测，浏览器的 opaque 响应仅证明网络往返完成，并不验证目标 HTTP 状态、站点内容或登录功能。

## 开发与发布

```sh
npm ci
npm run dev
npm run release
node scripts/verify-release.mjs
```

- 应用源码：`app/`
- 发布快照：`public/`（必须随源码一起提交）
- 配置单一来源：`app/src/config.js`
- 入口主机默认显示 Gateway；三个镜像默认显示目标页；`?view=acg` / `/acg` 可显式打开目标页，`?view=gateway` 可显式打开入口。
- Vercel：两个项目均连接本仓库，框架 Other，构建与安装命令为空，发布 `public`。
- Cloudflare Pages：连接本仓库 `main`，构建命令为空，输出目录 `public`。
- Netlify：连接本仓库 `main`，按根目录 `netlify.toml` 发布 `public`。
- 推送已验证的发布快照后，各平台从同一 commit 自动部署；健康检查禁止缓存，资源使用内容哈希。
- `.netlify/`、`.vercel/`、凭据与本地证据均已忽略。
