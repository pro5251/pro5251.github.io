#!/usr/bin/env node
// 檢查 dist/ 內所有站內連結（href / src）是否都指向存在的檔案，以及 #錨點 是否存在。
// 由 npm run build 自動執行；有壞連結會列出並以非 0 結束，阻止部署。

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
if (!existsSync(dist)) {
	console.error('找不到 dist/，請先執行 astro build');
	process.exit(1);
}

function walk(dir) {
	return readdirSync(dir).flatMap((name) => {
		const p = join(dir, name);
		return statSync(p).isDirectory() ? walk(p) : [p];
	});
}

const htmlFiles = walk(dist).filter((f) => f.endsWith('.html'));
const idCache = new Map();

function idsOf(file) {
	if (!idCache.has(file)) {
		const html = readFileSync(file, 'utf8');
		idCache.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
	}
	return idCache.get(file);
}

/** 把網址路徑對應到 dist 裡的檔案 */
function resolveTarget(pathname) {
	const clean = decodeURIComponent(pathname);
	const candidates = clean.endsWith('/')
		? [join(dist, clean, 'index.html')]
		: [join(dist, clean), join(dist, clean, 'index.html'), join(dist, `${clean}.html`)];
	return candidates.find((c) => existsSync(c) && statSync(c).isFile());
}

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const broken = [];
let checked = 0;

for (const file of htmlFiles) {
	const html = readFileSync(file, 'utf8')
		// 程式碼區塊與 script 裡的字串不是真的連結
		.replace(/<pre[\s\S]*?<\/pre>/g, '')
		.replace(/<script[\s\S]*?<\/script>/g, '');
	const pagePath = '/' + relative(dist, file).replace(/\\/g, '/').replace(/index\.html$/, '');

	for (const [, attr, raw] of html.matchAll(/\s(href|src)="([^"]*)"/g)) {
		const value = decode(raw);
		if (!value || /^(https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(value)) continue;
		// pagefind 在 astro build 之後才產生，另外由 pagefind 自己負責
		if (value.startsWith('/pagefind/')) continue;

		checked++;
		const url = new URL(value, `https://site.local${pagePath}`);
		const target = resolveTarget(url.pathname);
		if (!target) {
			broken.push(`${pagePath}  →  ${value}（找不到頁面）`);
			continue;
		}
		if (url.hash && target.endsWith('.html')) {
			const id = decodeURIComponent(url.hash.slice(1));
			if (id && !idsOf(target).has(id)) broken.push(`${pagePath}  →  ${value}（找不到錨點 #${id}）`);
		}
	}
}

if (broken.length) {
	console.error(`✘ 發現 ${broken.length} 個壞掉的站內連結：`);
	for (const b of broken) console.error('  ' + b);
	process.exit(1);
}
console.log(`✔ 站內連結檢查通過（${htmlFiles.length} 個頁面、${checked} 個連結）`);
