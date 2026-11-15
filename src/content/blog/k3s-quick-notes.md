---
title: 在 WSL 上跑 K3s 的筆記
description: 在 Windows 的 WSL 裡安裝 K3s，並用 Flux 做 GitOps 的重點整理。
pubDate: 2026-11-10
category: notes
tags: [Kubernetes, K3s, WSL]
---

這篇是範例文章，示範「學習筆記」分類。你可以把它刪掉，換成自己的內容。

## 安裝 K3s

```bash
curl -sfL https://get.k3s.io | sh -
sudo k3s kubectl get nodes
```

> [!TIP]
> 把 `/etc/rancher/k3s/k3s.yaml` 複製到 `~/.kube/config`，就能直接用 `kubectl`。

## 用 Flux 管理

1. 安裝 Flux CLI
2. `flux bootstrap github` 指向你的 repo
3. 之後改 YAML 推上去，叢集會自動同步

## 小結

K3s 很輕量，拿來在本機學 Kubernetes 很適合。
