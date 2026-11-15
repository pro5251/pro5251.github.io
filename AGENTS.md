# AGENTS.md

個人部落格：Astro 7（靜態輸出），部署在 GitHub Pages。使用說明見 README.md。

## 開發

- 開發伺服器請用背景模式：`npx astro dev --background`，用 `astro dev stop` / `status` / `logs` 管理
- 提交前執行 `npm run build`（包含 `astro check` 型別檢查與 Pagefind 索引），通過才 commit
- 搜尋只在 build 後有效，用 `npm run preview` 測試

## 慣例

- 文章：`src/content/blog/*.md` 或 `src/content/blog/<slug>/index.md`；frontmatter 欄位定義在 `src/content.config.ts`
- 分類只能用 `src/consts.ts` 的 `CATEGORIES` key；新增分類改那裡
- 文章查詢一律走 `src/lib/posts.ts` 的 `getPosts()`（會排除草稿並排序），不要直接呼叫 `getCollection`
- 網址都有結尾斜線（`trailingSlash: 'always'`）
- Astro 7 預設的 Markdown 處理器是 Sätteri；本專案用 remark/rehype 外掛，所以需要 `@astrojs/markdown-remark`，不要移除
- 介面文字用繁體中文；樣式只用白色主題，顏色改 `src/styles/global.css` 的 `:root` 變數

## 文件

Astro 官方文件：https://docs.astro.build
