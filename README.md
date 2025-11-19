# QRFreeGen

> QRFreeGen 是一款免费的浏览器端 QR 二维码生成器, 支持多语言界面、高分辨率导出以及 Cloudflare Pages 云端分享, 可以直接开源到 GitHub。

## 项目介绍

QRFreeGen 基于 React 18 + TypeScript + Vite 构建, 使用 `qrcode` 库在浏览器中渲染二维码, UI 由 Tailwind CSS 和自定义组件驱动。二维码默认全程在本地生成, 只有在点击 Cloud Share 时才会通过 Cloudflare Pages Functions 将 PNG 上传到 R2 并把元数据写入 KV, 以生成 7 天有效的分享链接。

## 功能特性

- 纯前端生成: 借助 Web API 与 `qrcode` 库在浏览器端渲染, 默认情况下数据不会离开用户设备。
- 多种导出方式: 内置 PNG 与 SVG 下载, 并提供 Base64 和 SVG 代码复制, 兼顾设计与开发流程。
- 云端分享: `/api/share` 函数将二维码上传到 Cloudflare R2, 返回 `/s/:id` 短链, 自动复制到剪贴板, 链接有效期 7 天。
- 多语言与 RTL: `locales.ts` 维护 10 种语言与方向配置, 自动检测浏览器语言并允许手动切换。
- 隐私页面: `/privacy` 路径渲染独立页面, 包含隐私声明、FAQ 和使用步骤, 渲染时自动注入 `noindex`。
- 现代 UI/UX: 响应式布局、加载状态、Toast 提示、自定义按钮组件, 让生成体验更加顺滑。

## 技术栈

- React 18, TypeScript, Vite 5
- Tailwind CSS (CDN) + 自定义组件
- lucide-react 图标库
- `qrcode` 二维码渲染
- Cloudflare Pages + Pages Functions + KV + R2
- 浏览器 Clipboard API、Fetch API 等现代能力

## 项目结构

```
.
├── App.tsx                 # 主界面与业务逻辑 (输入/生成/导出/分享/多语言)
├── index.tsx               # React 入口
├── index.html              # Vite 入口模板与 SEO 元数据
├── components/
│   ├── Button.tsx          # 按钮组件
│   ├── PrivacyPage.tsx     # /privacy 页面
│   └── Toaster.tsx         # Toast 通知
├── services/
│   └── qrService.ts        # 封装 qrcode 生成 PNG/SVG
├── functions/
│   ├── api/share.ts        # Cloud Share API (POST 上传, GET 查询)
│   ├── s/[id].ts           # 短链路由, 兼容 HTML 与 PNG 直链
│   └── types.d.ts          # Cloudflare Pages 环境类型
├── locales.ts              # 多语言文案
├── types.ts                # 通用类型声明
├── package.json / lock     # NPM 依赖与脚本
├── tsconfig.json           # TypeScript 配置
└── vite.config.ts          # Vite 构建配置
```

## 使用指南

1. 在输入框中填入 URL、文本或任意内容。
2. 点击 Generate QR Code, 几百毫秒内即可在左侧获得预览。
3. 选择下载 PNG/SVG, 或复制 Base64 / SVG 代码。
4. 需要分享短链时, 点击 Cloud Share, 等待上传成功并复制链接 (默认 7 天有效)。
5. 访问 `/privacy` 可查看隐私说明、使用步骤与 FAQ。

## 本地开发

### 前置条件

- Node.js 18 或以上
- npm (或 pnpm / yarn)

### 启动步骤

```bash
git clone <repo-url>
cd qrfreegen
npm install
npm run dev
```

默认开发服务器运行在 `http://localhost:5173`。Cloud Share 依赖 Cloudflare Pages Functions, 直接 `npm run dev` 时分享接口不可用; 若需要本地联调, 可先 `npm run build`, 再使用 `npx wrangler pages dev dist` 启动 Pages 模拟环境。

### 常用脚本

| 命令              | 功能说明                                   |
| ----------------- | ------------------------------------------ |
| `npm run dev`     | 启动 Vite 开发服务器                       |
| `npm run build`   | 运行 TypeScript 检查并输出生产构建         |
| `npm run preview` | 以本地静态服务器预览 `dist`, 接近生产环境  |

## 部署方式

### Cloudflare Pages + Pages Functions (推荐)

1. **创建资源**: 在 Cloudflare Dashboard 新建 R2 Bucket (如 `qrfreegen`) 和 KV Namespace (如 `QRFreeGenShare`)。
2. **绑定环境**: 在 Pages -> Settings -> Functions -> Bindings 中配置
   - KV Namespace 绑定名 `QR_KV`
   - R2 Bucket 绑定名 `QR_BUCKET`
   - `ASSETS` 由 Pages 自动注入, 用于 `/s/:id` 返回主页
3. **构建与部署**:
   - 本地执行 `npm run build` 生成 `dist/`
   - 使用 `npx wrangler pages deploy dist` 或 Pages Web UI 上传, 确保 `functions/` 目录一起部署
4. **验证**: 打开主站确认二维码生成, 点击 Cloud Share 检查 `POST /api/share` 和 `/s/<id>` 是否可用

如使用 `wrangler`, 可以在 `wrangler.toml` 中写入:

```toml
[[kv_namespaces]]
binding = "QR_KV"
id = "<your-kv-id>"

[[r2_buckets]]
binding = "QR_BUCKET"
bucket_name = "qrfreegen"
```

### 仅静态托管

将 `dist/` 上传到 Vercel、Netlify 等静态平台可以获得本地生成与导出能力, 但 Cloud Share 需要额外 API。可以提示用户部署到 Cloudflare 以启用分享, 或在 UI 中隐藏分享按钮。

## API 概览

| 路径             | 方法 | 描述 |
| ---------------- | ---- | ---- |
| `/api/share`     | POST | 接收 `{ text, dataUrl, svgString }`, 上传 PNG 到 R2, 在 KV 写入元数据, 返回 `{ id, url, expiresIn, expiresAt }` |
| `/api/share?id=` | GET  | 根据 `id` 读取 KV, 返回文本、PNG/SVG Base64 与短链 |
| `/s/:id`         | GET  | 浏览器访问时重定向到主页并复用分享参数, 图片直链访问时直接读取 R2 返回 PNG |

共享链接有效期由 `SHARE_TTL_SECONDS` 控制 (默认 7 天), 可按需调整。

## 多语言与定制

- 所有语言配置集中在 `locales.ts`, 每个语言包实现 `Translation` 类型。
- `languages` 数组决定语言代码、名称与书写方向, UI 会根据 `dir` 自动切换 RTL/LTR。
- 新增语言时, 在 `languages` 中添加条目, 并在 `translations` 对象里补充对应文案即可。

## 隐私说明

- 二维码在浏览器内生成与渲染, 默认不与服务器交互。
- 当用户点击 Cloud Share 时, PNG 会上传到 R2, 元数据写入 KV (包括可选原文、SVG 字符串与创建时间)。
- `/privacy` 页面渲染期间会动态注入 `noindex, nofollow`, 避免被搜索引擎收录。

## 贡献指南

1. Fork 本仓库并创建特性分支。
2. 完成修改后运行 `npm run build` 等脚本保证通过。
3. 提交 PR 时附上改动说明与必要截图。
4. 欢迎贡献: 新语言、UI/UX 优化、Cloud Share 后端适配、自动化测试等。

## 许可协议

当前仓库尚未附带 LICENSE 文件, 建议在发布到 GitHub 之前补充 (常见选择为 MIT License)。如采用其他协议, 请在 README 中同步说明。
