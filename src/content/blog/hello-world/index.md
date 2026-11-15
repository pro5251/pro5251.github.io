---
title: 哈囉，部落格開張了
description: 為什麼用 GitHub Pages 和 Astro 架部落格，以及這個網站有哪些功能。
pubDate: 2026-11-15
category: life
tags: [部落格, Astro, GitHub Pages]
heroImage: ./cover.jpg
pinned: true
---

終於把自己的部落格架起來了。這篇簡單記錄為什麼這樣選，以及這個網站有哪些功能。

## 為什麼選 GitHub Pages

- **免費**：託管、HTTPS 都不用錢。
- **文章就是 Markdown**：用 git 管版本，換平台也帶得走。
- **推上去就自動部署**：GitHub Actions 幫忙建置。

## 為什麼選 Astro

Astro 預設輸出純靜態 HTML，幾乎不帶 JavaScript，速度很快。內建的內容集合（Content Collections）會檢查每篇文章的 frontmatter，打錯分類名稱建置時就會報錯，不會默默壞掉。

## 這個網站有什麼

| 功能 | 說明 |
| --- | --- |
| 分類與標籤 | 每篇一個分類、多個標籤 |
| 全站搜尋 | 用 Pagefind，支援中文 |
| 文章目錄 | 寬螢幕在側邊，窄螢幕可收合 |
| RSS / Sitemap | 方便訂閱與搜尋引擎收錄 |
| 留言 | Giscus（GitHub Discussions） |

> [!NOTE]
> 這篇文章放在 `src/content/blog/hello-world/index.md`，封面圖 `cover.jpg` 就放在同一個資料夾裡。
