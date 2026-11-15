#!/usr/bin/env node
// 建立新文章
//
// 用法：
//   npm run new -- "文章標題"
//   npm run new -- "文章標題" --category tech --tags "Astro,筆記" --slug my-post
//   npm run new -- "文章標題" --folder      ← 建立資料夾（方便放圖片）
//
// 新文章預設是草稿（draft: true），寫完把它刪掉再推上去就會發佈。

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const blogDir = join(root, 'src', 'content', 'blog');

function parseArgs(argv) {
	const args = { _: [] };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a.startsWith('--')) {
			const key = a.slice(2);
			const next = argv[i + 1];
			if (next === undefined || next.startsWith('--')) args[key] = true;
			else args[key] = argv[++i];
		} else args._.push(a);
	}
	return args;
}

function readCategories() {
	const src = readFileSync(join(root, 'src', 'consts.ts'), 'utf8');
	const block = src.match(/export const CATEGORIES = \{([\s\S]*?)\}\s*as const/);
	if (!block) return [];
	return [...block[1].matchAll(/^\s*([a-z0-9_-]+)\s*:\s*\{/gim)].map((m) => m[1]);
}

function slugify(text) {
	return text
		.normalize('NFKD')
		.toLowerCase()
		.replace(/[^\x00-\x7f]/g, ' ')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function today() {
	// 以台灣時間為準
	const d = new Date(Date.now() + 8 * 3600 * 1000);
	return d.toISOString().slice(0, 10);
}

const args = parseArgs(process.argv.slice(2));
const title = args._.join(' ').trim();
if (!title || args.help) {
	console.log('用法：npm run new -- "文章標題" [--category tech] [--tags "a,b"] [--slug my-post] [--folder]');
	process.exit(title ? 0 : 1);
}

const categories = readCategories();
const category = typeof args.category === 'string' ? args.category : categories[0];
if (categories.length && !categories.includes(category)) {
	console.error(`分類「${category}」不存在。可用的分類：${categories.join(', ')}`);
	console.error('要新增分類，請編輯 src/consts.ts 的 CATEGORIES。');
	process.exit(1);
}

const date = today();
let slug = typeof args.slug === 'string' ? slugify(args.slug) : slugify(title);
if (!slug) slug = `${date}-post`; // 純中文標題時，用日期當網址
const tags = typeof args.tags === 'string' ? args.tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean) : [];

const file = args.folder ? join(blogDir, slug, 'index.md') : join(blogDir, `${slug}.md`);
if (existsSync(file) || existsSync(join(blogDir, `${slug}.md`)) || existsSync(join(blogDir, slug, 'index.md'))) {
	console.error(`已經有同名文章：${slug}。請用 --slug 指定其他網址。`);
	process.exit(1);
}

const yamlString = (s) => JSON.stringify(s);
const content = `---
title: ${yamlString(title)}
description: ""
pubDate: ${date}
category: ${category}
tags: [${tags.map(yamlString).join(', ')}]
draft: true
---

在這裡開始寫作。

## 第一個段落

`;

mkdirSync(dirname(file), { recursive: true });
writeFileSync(file, content, 'utf8');
console.log(`✔ 已建立：${relative(root, file)}`);
console.log(`  網址：/posts/${slug}/`);
console.log('  目前是草稿，寫完後把 draft: true 刪掉即可發佈。');
