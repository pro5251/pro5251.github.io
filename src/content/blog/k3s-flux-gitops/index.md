---
title: 用 Flux 在 K3s 上做 GitOps
description: 系列第二篇：把叢集設定放進 Git，讓 Flux 自動同步。示範 Mermaid 圖表與文章內圖片。
pubDate: 2026-11-12
category: notes
tags: [Kubernetes, K3s, Flux, GitOps, CI/CD]
series: K3s 入門
seriesOrder: 2
---

上一篇裝好了 K3s，這篇把叢集交給 Flux 管理。這也是一篇範例文章，示範**系列文章**、**Mermaid 圖表**和**文章內圖片**。

## GitOps 的流程

用 Mermaid 畫流程圖，只要在程式碼區塊標上 `mermaid`：

```mermaid
flowchart LR
    dev[開發者] -->|git push| repo[(Git repo)]
    repo -->|定期拉取| flux[Flux]
    flux -->|套用| k3s[K3s 叢集]
    k3s -->|狀態回報| flux
```

同樣的概念也可以用圖片表示（點圖片可以放大）：

![GitOps 流程：Git repo 經由 Flux 同步到 K3s](./flow.png "Git 是唯一的事實來源，Flux 負責讓叢集跟上")

## Bootstrap

```bash
flux bootstrap github \
  --owner=<你的帳號> \
  --repository=fleet \
  --path=clusters/home \
  --personal
```

> [!IMPORTANT]
> bootstrap 需要 GitHub token，請用環境變數 `GITHUB_TOKEN` 傳入，不要寫進指令或檔案。

## 確認同步狀態

```bash
flux get kustomizations
flux logs --follow
```

## 時序圖

Mermaid 也支援時序圖：

```mermaid
sequenceDiagram
    participant G as Git
    participant F as Flux
    participant K as K3s
    F->>G: 拉取最新 commit
    G-->>F: manifests
    F->>K: kubectl apply
    K-->>F: Ready
```
