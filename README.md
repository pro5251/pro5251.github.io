# 我的部落格

用 [Astro](https://astro.build) 建置、部署在 GitHub Pages 的個人部落格。白色簡潔風格，文章用 Markdown 撰寫。

網址：<https://pro5251.github.io>

## 功能

- **Markdown / MDX 寫作**：frontmatter 有型別檢查，寫錯分類或日期，建置時就會報錯
- **分類與標籤**：分類是固定清單（網址乾淨），標籤可以自由新增
- **全站搜尋**：用 [Pagefind](https://pagefind.app)，支援中文，可以依分類篩選；任何頁面按 <kbd>/</kbd> 都能直接開啟搜尋
- **文章頁**：目錄（寬螢幕在側邊）、閱讀時間、閱讀進度條、上下篇、相關文章、標題錨點、程式碼複製按鈕、分享按鈕（複製連結、X、Facebook、LINE、Threads）
- **系列文章**：同一個 `series` 的文章會顯示系列目錄與進度
- **Markdown 擴充**：GitHub 風格提示框（`> [!NOTE]`）、Mermaid 圖表、數學公式（KaTeX）、圖片說明、表格、待辦清單、註腳、語法高亮
- **圖片**：自動壓縮成 WebP、延遲載入，點擊可放大
- **其他頁面**：首頁、分類頁、標籤頁都有分頁，歸檔頁（依年份）、關於、404
- **SEO**：sitemap、全站與各分類 RSS（全文輸出，圖片可在閱讀器顯示）、robots.txt、Open Graph（含預設分享圖）、JSON-LD 結構化資料、canonical、Web App Manifest
- **草稿與置頂**：`draft: true` 只在本機顯示，`pinned: true` 會固定在首頁最上方
- **留言**：Giscus（GitHub Discussions），填好設定就會啟用
- **在 GitHub 上編輯**：文章底部有編輯連結，讀者可以直接提 PR 修正錯字
- **品質把關**：單元測試、型別檢查、站內壞連結檢查，任何一項失敗都不會部署
- **自動部署**：推到 `main` 後，GitHub Actions 會自動建置並發佈；PR 只做檢查；Dependabot 每月更新套件

## 快速開始

需要 Node.js 22.23.4 以上版本（建議用 24）。

```bash
npm install
npm run dev        # 開發模式 http://localhost:4321（看得到草稿）
```

| 指令 | 說明 |
| --- | --- |
| `npm run dev` | 開發伺服器，存檔後自動重新整理 |
| `npm run new -- "標題"` | 建立新文章（預設為草稿） |
| `npm run build` | 測試 → 型別檢查 → 建置 → 壞連結檢查 → 搜尋索引，輸出到 `dist/` |
| `npm run build:fast` | 只建置與建立搜尋索引（略過檢查） |
| `npm run preview` | 預覽建置結果（要測試搜尋請用這個） |
| `npm run check` | 只跑型別檢查 |
| `npm run test` | 只跑單元測試 |
| `npm run check:links` | 只跑壞連結檢查（需先 build） |
| `npm run og` | 依網站名稱重新產生預設分享圖 `public/og-default.png` |

## 寫文章

### 1. 建立檔案

```bash
npm run new -- "我的新文章" --category tech --tags "Astro,筆記" --slug my-new-post
npm run new -- "有很多圖的文章" --folder      # 建立資料夾，圖片放在同一層
```

也可以直接在 `src/content/blog/` 底下新增 `.md` 檔。在 VS Code 輸入 `post` 再按 Tab，就會展開 frontmatter 範本。

檔名就是網址：`src/content/blog/my-new-post.md` 會變成 `/posts/my-new-post/`。

### 2. Frontmatter 欄位

```yaml
---
title: "文章標題"              # 必填
description: "一兩句摘要"       # 顯示在列表、搜尋引擎和社群分享
pubDate: 2026-11-15            # 必填，發佈日期
updatedDate: 2026-11-20        # 選填，更新日期
category: tech                 # 必填，必須是 src/consts.ts 的 CATEGORIES 之一
tags: [Astro, 筆記]            # 選填
heroImage: ./cover.jpg         # 選填，封面圖（相對路徑），也會當作社群分享圖
heroImageAlt: "封面說明"        # 選填，封面圖替代文字
series: K3s 入門               # 選填，系列名稱
seriesOrder: 1                 # 選填，在系列中的順序（省略則依日期）
draft: true                    # 選填，草稿不會出現在正式網站
pinned: false                  # 選填，置頂
toc: true                      # 選填，是否顯示目錄（預設 true）
comments: true                 # 選填，是否顯示留言（預設 true）
---
```

### 3. 圖片

建議每篇有圖的文章用一個資料夾：

```
src/content/blog/my-trip/
├── index.md
├── cover.jpg
└── photo-1.png
```

在文章裡用相對路徑 `![說明](./photo-1.png)` 引用，建置時會自動壓縮並轉成 WebP。讀者點圖片可以放大。

### 4. 圖表（Mermaid）

程式碼區塊標上 `mermaid` 就會畫成圖表，支援流程圖、時序圖、甘特圖等（[語法](https://mermaid.js.org/intro/)）：

````md
```mermaid
flowchart LR
    A[寫文章] --> B[git push] --> C[自動上線]
```
````

Mermaid 只在有用到的文章才會載入，不影響其他頁面的速度。

### 5. 數學公式與圖片說明

- 公式用 `$$` 包起來：寫在句子中是行內公式，獨立成段是區塊公式。單一個 `$` 不會觸發，寫價格不用擔心
- 圖片加上標題就會顯示說明：`![替代文字](./a.png "圖片下方的說明")`

### 6. 發佈

把 `draft: true` 刪掉，commit 後推到 `main`，大約一分鐘後網站就會更新。

語法範例請看 [Markdown 寫作語法速查](src/content/blog/markdown-guide.md)。

## 分類

分類定義在 `src/consts.ts`：

```ts
export const CATEGORIES = {
	tech: { name: '技術', description: '程式、工具與系統架構。' },
	notes: { name: '學習筆記', description: '讀書與課程的整理。' },
	life: { name: '生活', description: '日常與隨筆。' },
} as const;
```

- **key**（例如 `tech`）用在網址和 frontmatter，請用英文小寫
- **name** 是畫面上顯示的名稱
- 新增分類只要加一行；`npm run new` 和型別檢查會自動認得

## 網站設定

大部分設定都在 `src/consts.ts`：網站名稱、介紹、作者、每頁文章數、選單、社群連結、分類、Giscus。

顏色與排版在 `src/styles/global.css` 最上方的 `:root` 變數。

改了網站名稱或介紹後，執行 `npm run og` 重新產生預設分享圖，並同步修改 `public/site.webmanifest` 的 `name`。

## 第一次部署到 GitHub Pages

1. 在 GitHub 建立**公開** repo，名稱為 `pro5251.github.io`
2. 推上去：
   ```bash
   git remote add origin https://github.com/pro5251/pro5251.github.io.git
   git push -u origin main
   ```
3. 到 repo 的 **Settings → Pages → Build and deployment → Source**，選 **GitHub Actions**
4. 到 **Actions** 分頁等部署完成，就能打開 <https://pro5251.github.io>

> 公開 repo 跑 GitHub Actions 不算分鐘數，不會用到私有 repo 每月的額度。

## 開啟留言（Giscus）

1. 到 repo 的 **Settings → General → Features**，勾選 **Discussions**
2. 安裝 [giscus app](https://github.com/apps/giscus) 到這個 repo
3. 到 <https://giscus.app/zh-TW>，輸入 `pro5251/pro5251.github.io`，Discussion 分類選 **Announcements**
4. 把頁面產生的 `data-repo-id` 和 `data-category-id` 填到 `src/consts.ts` 的 `GISCUS.repoId` 和 `GISCUS.categoryId`

## 流量統計與搜尋引擎

都在 `src/consts.ts` 設定，留空就不啟用：

- **流量統計**：`ANALYTICS.goatcounter`（[GoatCounter](https://www.goatcounter.com) 代碼）或 `ANALYTICS.cloudflareToken`（Cloudflare Web Analytics）。兩者都不用 cookie，只在正式網站載入
- **Google Search Console**：選「HTML 標記」驗證方式，把 `content` 的值填到 `GOOGLE_SITE_VERIFICATION`；驗證後提交 `https://pro5251.github.io/sitemap-index.xml`

## 改用自訂網域

1. 在 DNS 加上記錄：
   - 根網域（`example.com`）：A 記錄 `185.199.108.153`、`185.199.109.153`、`185.199.110.153`、`185.199.111.153`
   - 子網域（`blog.example.com`）：CNAME 指向 `pro5251.github.io`
2. 到個人 **Settings → Pages → Verified domains** 驗證網域，防止子網域被劫持
3. 到 repo 的 **Settings → Pages → Custom domain** 填入網域，並勾選 **Enforce HTTPS**
4. 把 `astro.config.mjs` 的 `SITE_URL` 改成新網域，推上去

`github.io` 的舊網址會自動轉到新網域，舊連結不會失效。

## 專案結構

```
├── .github/workflows/deploy.yml   # 自動部署
├── public/                        # 原樣複製的靜態檔（favicon 等）
├── scripts/
│   ├── new-post.mjs               # 建立新文章
│   ├── check-links.mjs            # 建置後檢查站內壞連結
│   └── og-image.mjs               # 產生預設分享圖
├── src/
│   ├── components/                # 頁首、頁尾、文章列表、目錄、留言等元件
│   ├── content/blog/              # ← 文章放這裡
│   ├── layouts/                   # 版型
│   ├── lib/posts.ts               # 文章查詢、分類、標籤
│   ├── lib/utils.ts               # 閱讀時間、相關文章、系列等純函式（有單元測試）
│   ├── pages/                     # 路由（每個檔案就是一個網址）
│   ├── plugins/                   # Markdown 外掛（提示框、外部連結）
│   ├── styles/global.css          # 全站樣式
│   ├── consts.ts                  # ← 網站設定
│   └── content.config.ts          # 文章 frontmatter 的欄位定義
├── tests/                         # 單元測試（vitest）
└── astro.config.mjs               # Astro 設定（網址、Markdown）
```
