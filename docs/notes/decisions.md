# 部落格規劃與技術決策

2026-11-15 建立。記錄規劃時討論過的選項與理由，日後要改方向時先看這裡。

## 託管：GitHub Pages（先不買網域）

| 選項 | 結論 |
| --- | --- |
| **GitHub Pages** | ✅ 採用：免費、HTTPS 自動、和平常的 git 流程一致；公開 repo 的 Actions 不算分鐘數 |
| Cloudflare Pages | 備案：需要私有 repo、PR 預覽網址、或流量超過每月約 100 GB 時再搬 |
| 自架（K3s / 家裡主機） | 不採用：要處理固定 IP、開機時間、資安；真要做可用 Cloudflare Tunnel |

- 內容是 Markdown + git，之後搬到 Cloudflare Pages 只要接同一個 repo
- **網域**：先用 `pro5251.github.io`，寫了幾篇確定會持續再買。之後綁網域時 GitHub 會把 github.io 自動轉址，舊連結不會失效
  - 建議在 Cloudflare Registrar 買（成本價、續約不漲價）
  - 一定要做 **Verified domains**，防止子網域被劫持
  - 若 DNS 開 Cloudflare Proxy：先關（灰雲）等 GitHub 簽好憑證，SSL 模式用 Full
  - 步驟見 README「改用自訂網域」

## 框架：Astro（不是 Hugo）

- 本機有 Node 24、沒有 Hugo；Astro 的 Content Collections 會檢查 frontmatter，分類打錯建置就失敗
- 預設輸出純靜態 HTML、幾乎不帶 JS（首頁約 7 KB HTML + 16 KB CSS）
- **Astro 7 注意**：預設 Markdown 處理器改成 Sätteri，要用 remark/rehype 外掛必須安裝 `@astrojs/markdown-remark`

## 內容設計

- **分類是固定清單**（`src/consts.ts` 的 `CATEGORIES`）：網址用英文 key（`/categories/tech/`），顯示用中文名稱；schema 用 enum 驗證
- **標籤自由新增**：網址 slug 保留中文，特殊字元轉換（`C#` → `c-sharp`、`CI/CD` → `ci-cd`）
- 文章網址 `/posts/<檔名>/`，與分類解耦：換分類不會讓網址失效
- 每篇有圖的文章用資料夾（`<slug>/index.md` + 圖片），Astro 自動壓縮成 WebP

## 外觀

- 使用者要求**簡單白色系**：只做淺色主題，不做深色模式
- 顏色集中在 `global.css` 的 `:root` 變數；系統字型（不載入網路字型，中文字型檔太大）
- 程式碼用 Shiki `github-light`，底色維持白色，否則對比度不足（axe 檢查會失敗）

## 功能取捨

| 功能 | 做法 | 理由 |
| --- | --- | --- |
| 搜尋 | Pagefind（建置時產生索引） | 不需要後端，支援中文分詞 |
| 留言 | Giscus | 免費、資料在 GitHub Discussions、無廣告 |
| 統計 | GoatCounter / Cloudflare Web Analytics（可選） | 不用 cookie，不需要同意橫幅 |
| Mermaid | 有用到的文章才從 CDN 載入 | 套件很大，不該拖慢其他頁面 |
| 數學公式 | KaTeX，只認 `$$` | 單一 `$` 會把價格誤判成公式 |
| 社群分享圖 | 一張預設圖（`npm run og`）+ 文章封面 | 每篇動態產生需要 satori，成本高於效益 |

## 品質把關

`npm run build` 依序執行，任何一步失敗都不會部署：

1. vitest 單元測試（純函式與 Markdown 外掛）
2. `astro check` 型別檢查
3. `astro build`
4. 站內壞連結與錨點檢查（`scripts/check-links.mjs`）
5. Pagefind 索引

另外用 axe-core 做過無障礙檢查（全部頁面通過），之後改版型時建議再跑一次。

## 待辦（上線後）

- [ ] 在 GitHub 建立公開 repo `pro5251.github.io` 並推送，Pages 來源設成 GitHub Actions
- [ ] 換掉範例文章、網站名稱與介紹（改完執行 `npm run og`，並改 `public/site.webmanifest`）
- [ ] 開啟 Giscus 留言
- [ ] （可選）GoatCounter 統計、Google Search Console 驗證並提交 sitemap
- [ ] 寫了幾篇之後決定是否買網域
