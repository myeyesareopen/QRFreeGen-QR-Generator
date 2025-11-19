# QRFreeGen

Live demo & official site: https://qrfreegen.com

---

## English Version

> QRFreeGen is a free, browser-based QR code generator with multilingual UI, high-resolution exports, and optional Cloudflare Pages sharing. The open-source version mirrors the production site and can be deployed anywhere.

### Project Overview

Built with React 18, TypeScript, and Vite, QRFreeGen renders QR codes locally via the `qrcode` library while Tailwind CSS and custom components provide the UI. All generation is browser-only; only the Cloud Share action uploads PNG output to Cloudflare R2 and stores metadata (text, SVG) in KV for a 7-day share link.

### Features

- **Local-only generation**: Uses Web APIs + `qrcode` to render entirely in the browser so data stays on-device by default.
- **Multiple export options**: Download PNG/SVG or copy Base64/SVG strings for design and development workflows.
- **Cloud Share**: `/api/share` uploads to Cloudflare R2 and returns `/s/:id` short links, auto-copying to clipboard (valid for 7 days).
- **Multilingual + RTL**: `locales.ts` includes 10 languages with RTL awareness and automatic browser language detection.
- **Privacy page**: `/privacy` offers policy highlights, FAQ, and usage steps while injecting `noindex` at runtime.
- **Modern UX**: Responsive layout, loading states, toast notifications, and reusable buttons/components.

### Tech Stack

- React 18, TypeScript, Vite 5
- Tailwind CSS (via CDN) + custom components
- lucide-react icons
- `qrcode` rendering library
- Cloudflare Pages + Pages Functions + KV + R2
- Browser Clipboard API, Fetch API, etc.

### Structure

```
.
├── App.tsx                 # Main UI & logic (input/generation/export/share/i18n)
├── index.tsx               # React entry
├── index.html              # Vite HTML template + SEO metadata
├── components/
│   ├── Button.tsx
│   ├── PrivacyPage.tsx
│   └── Toaster.tsx
├── services/
│   └── qrService.ts        # Wrapper around qrcode for PNG/SVG
├── functions/
│   ├── api/share.ts        # Cloud Share POST API
│   ├── s/[id].ts           # Short link route for HTML or PNG responses
│   └── types.d.ts          # Cloudflare Pages typings
├── locales.ts              # Language definitions
├── types.ts                # Shared TypeScript interfaces
├── package.json / lock
├── tsconfig.json
└── vite.config.ts
```

### Usage

1. Enter text/URL/contact info.
2. Click **Generate QR Code** to render in under a second.
3. Download PNG/SVG or copy Base64/SVG strings.
4. Use **Cloud Share** for a short link stored for 7 days.
5. Visit `/privacy` for privacy statements, FAQ, and usage tips.

### Local Development

**Prerequisites:** Node.js 18+ and npm (or pnpm/yarn).

```bash
git clone <repo-url>
cd qrfreegen
npm install
npm run dev
```

Dev server runs at `http://localhost:5173`. Cloud Share requires Cloudflare Pages Functions, so `npm run dev` alone cannot simulate sharing. To test sharing locally, `npm run build` then run `npx wrangler pages dev dist`.

| Script            | Description                                      |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Start Vite dev server                            |
| `npm run build`   | Type-check and build production bundle           |
| `npm run preview` | Serve `dist` locally for production-like preview |

### Deployment

**Cloudflare Pages + Functions (recommended)**

1. Create an R2 bucket (e.g., `qrfreegen`) and KV namespace (e.g., `QRFreeGenShare`).
2. In Pages → Settings → Functions → Bindings, add:
   - `QR_KV` → KV namespace
   - `QR_BUCKET` → R2 bucket
   - `ASSETS` is automatically provided for `/s/:id`.
3. Run `npm run build` and deploy via `npx wrangler pages deploy dist` or the Pages UI, ensuring the `functions/` folder ships too.
4. Verify QR generation and Cloud Share short links (`POST /api/share`, `/s/<id>`).

Sample `wrangler.toml` snippet:

```toml
[[kv_namespaces]]
binding = "QR_KV"
id = "<your-kv-id>"

[[r2_buckets]]
binding = "QR_BUCKET"
bucket_name = "qrfreegen"
```

**Static hosting only**

Serving `dist/` on Vercel/Netlify works for local generation, but Cloud Share requires a serverless backend. Either point users to Cloudflare deployment or hide the share button.

### API Summary

| Path        | Method | Description |
| ----------- | ------ | ----------- |
| `/api/share`| POST   | Accepts `{ text, dataUrl, svgString }`, uploads PNG to R2, stores metadata in KV, and returns `{ id, url, expiresIn, expiresAt }`. |
| `/s/:id`    | GET    | Returns homepage for browsers (with share param) or serves PNG directly for image consumers. |

`SHARE_TTL_SECONDS` defines link expiry (default 7 days).

### Languages & Customization

- Languages are defined in `locales.ts`; each implements the `Translation` interface.
- `languages` list defines code, label, and direction for automatic RTL/LTR handling.
- Add new locales by extending both arrays/objects.

### Privacy Notes

- QR codes are rendered locally and never leave the device unless Cloud Share is used.
- Cloud Share uploads PNG to R2 and stores optional text/SVG plus timestamps in KV.
- `/privacy` injects `noindex,nofollow` to avoid search indexing.

### Contribution Guide

1. Fork and create a feature branch.
2. Run `npm run build` (and other checks if added).
3. Submit PRs with clear descriptions/screenshots.
4. Contributions welcome for new locales, UI/UX, backend adapters, or tests.

### License

Released under the MIT License. See `LICENSE` for details.

---

## 中文版

> QRFreeGen 是一款免费的浏览器端 QR 二维码生成器, 支持多语言界面、高分辨率导出以及可选的 Cloudflare Pages 云端分享; 此开源版本与线上站点保持一致, 可直接部署。

### 项目介绍

QRFreeGen 基于 React 18 + TypeScript + Vite 构建, 由 `qrcode` 库在浏览器中渲染二维码, 并通过 Tailwind CSS 与自定义组件提供界面。二维码默认全部在本地生成, 只有点按 Cloud Share 时才会将 PNG 上传到 Cloudflare R2, 并把文本/SVG 等元数据写入 KV, 生成 7 天有效的分享链接。

### 功能特性

- **纯前端生成**: 借助 Web API 与 `qrcode` 在浏览器端渲染, 默认不离开用户设备。
- **多种导出方式**: 支持下载 PNG/SVG 以及复制 Base64/SVG 字符串, 兼顾设计与开发。
- **云端分享**: `/api/share` 上传到 Cloudflare R2, 返回 `/s/:id` 短链并自动复制 (默认 7 天有效)。
- **多语言与 RTL**: `locales.ts` 内置 10 种语言以及 RTL 支持, 可自动检测浏览器语言并手动切换。
- **隐私页面**: `/privacy` 展示隐私说明、FAQ 和使用步骤, 渲染时自动注入 `noindex`。
- **现代体验**: 响应式布局、加载状态、Toast 提示、自定义按钮等组件。

### 技术栈

- React 18、TypeScript、Vite 5
- Tailwind CSS (CDN) + 自定义组件
- lucide-react 图标
- `qrcode` 渲染库
- Cloudflare Pages + Pages Functions + KV + R2
- 浏览器 Clipboard API、Fetch API 等现代能力

### 项目结构

```
.
├── App.tsx                 # 主界面与业务逻辑 (输入/生成/导出/分享/多语言)
├── index.tsx               # React 入口
├── index.html              # Vite HTML 模板 & SEO
├── components/
│   ├── Button.tsx
│   ├── PrivacyPage.tsx
│   └── Toaster.tsx
├── services/
│   └── qrService.ts        # 封装 qrcode 生成 PNG/SVG
├── functions/
│   ├── api/share.ts        # Cloud Share API (POST)
│   ├── s/[id].ts           # 短链路由, 兼容 HTML 与 PNG
│   └── types.d.ts          # Cloudflare Pages 类型
├── locales.ts              # 多语言文案
├── types.ts                # 类型声明
├── package.json / lock
├── tsconfig.json
└── vite.config.ts
```

### 使用指南

1. 在输入框中填入网址、文本或名片信息。
2. 点击 **Generate QR Code**, 即可在左侧即时预览。
3. 下载 PNG/SVG, 或复制 Base64/SVG 代码。
4. 需要分享短链时点击 **Cloud Share**, 上传完成后会自动复制链接 (默认 7 天有效)。
5. 访问 `/privacy` 查看隐私声明、FAQ 以及使用提示。

### 本地开发

**前置条件**: Node.js 18+ 以及 npm / pnpm / yarn。

```bash
git clone <repo-url>
cd qrfreegen
npm install
npm run dev
```

开发服务器默认运行在 `http://localhost:5173`。Cloud Share 依赖 Cloudflare Pages Functions, 单纯 `npm run dev` 无法模拟; 可先 `npm run build`, 再运行 `npx wrangler pages dev dist` 进行联调。

| 命令              | 功能说明                                |
| ----------------- | --------------------------------------- |
| `npm run dev`     | 启动 Vite 开发服务器                    |
| `npm run build`   | 运行 TypeScript 检查并输出生产构建      |
| `npm run preview` | 本地预览 `dist`, 体验接近生产环境       |

### 部署方式

**Cloudflare Pages + Functions (推荐)**

1. 在 Cloudflare Dashboard 新建 R2 Bucket (如 `qrfreegen`) 以及 KV Namespace (如 `QRFreeGenShare`)。
2. 在 Pages → Settings → Functions → Bindings 中配置:
   - `QR_KV` → KV
   - `QR_BUCKET` → R2
   - `ASSETS` 会在 `/s/:id` 时自动提供静态资源
3. 本地执行 `npm run build`, 通过 `npx wrangler pages deploy dist` 或 Pages 控制台上传, 并确保 `functions/` 一并部署。
4. 验证二维码生成是否正常, 以及 Cloud Share (`POST /api/share`, `/s/<id>`) 是否可用。

`wrangler.toml` 示例:

```toml
[[kv_namespaces]]
binding = "QR_KV"
id = "<your-kv-id>"

[[r2_buckets]]
binding = "QR_BUCKET"
bucket_name = "qrfreegen"
```

**仅静态托管**

将 `dist/` 部署到 Vercel / Netlify 等静态主机可以获得本地生成与导出能力, 但 Cloud Share 仍需服务端支持; 可提示用户改用 Cloudflare 部署或隐藏分享按钮。

### API 概览

| 路径          | 方法 | 描述 |
| ------------- | ---- | ---- |
| `/api/share`  | POST | 接收 `{ text, dataUrl, svgString }`, 上传 PNG 至 R2 并写入 KV, 返回 `{ id, url, expiresIn, expiresAt }` |
| `/s/:id`      | GET  | 浏览器访问跳转回主页(携带分享参数)；图片直链则直接读取 R2 返回 PNG |

`SHARE_TTL_SECONDS` 控制分享链接有效期 (默认 7 天)。

### 多语言与定制

- 语言列表与文案集中在 `locales.ts`, 每个语言包实现 `Translation` 接口。
- `languages` 数组指定语言代码、名称与方向, 组件会自动切换 RTL/LTR。
- 若要新增语言, 在 `languages` 中添加条目并在 `translations` 中补充对应文案即可。

### 隐私说明

- 二维码默认在浏览器本地渲染, 不与服务器通信。
- 当用户点击 Cloud Share 时会上传 PNG 到 R2, 并在 KV 中保存文本/SVG/时间戳等元数据。
- `/privacy` 渲染期间动态写入 `noindex, nofollow`, 防止被搜索引擎收录。

### 贡献指南

1. Fork 仓库并创建特性分支。
2. 修改后运行 `npm run build` 等脚本确保通过。
3. 提交 PR 时附上改动说明与示意图/截图。
4. 欢迎贡献: 新语言、UI/UX 优化、Cloud Share 后端适配、自动化测试等。

### 许可协议

本项目以 MIT License 发布, 详情见根目录 `LICENSE` 文件。
