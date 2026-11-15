#!/usr/bin/env node
// 產生預設社群分享圖 public/og-default.png（1200×630）
// 改了網站名稱後重新執行：npm run og
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const consts = readFileSync(join(root, 'src', 'consts.ts'), 'utf8');
// 只讀 SITE 區塊，避免抓到其他物件的同名欄位
const siteBlock = consts.match(/export const SITE = \{([\s\S]*?)\};/)?.[1] ?? '';
const pick = (key) => siteBlock.match(new RegExp(`\\b${key}:\\s*'([^']*)'`))?.[1] ?? '';
const title = pick('title');
const description = pick('description');
const config = readFileSync(join(root, 'astro.config.mjs'), 'utf8');
const host = config.match(/SITE_URL = '([^']+)'/)?.[1].replace(/^https?:\/\//, '') ?? '';

const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// SVG 的 <text> 在部分系統找不到中文字型，所以文字改用 sharp（Pango）另外繪製再疊上去
const FONTS = 'Noto Sans TC,Microsoft JhengHei,PingFang TC,sans-serif';

const background = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
	<rect width="1200" height="630" fill="#ffffff"/>
	<rect x="0" y="0" width="1200" height="10" fill="#0969da"/>
	<circle cx="1060" cy="120" r="200" fill="#f6f8fa"/>
</svg>`;

async function textLayer(text, { size, color, bold = false, width = 1008 }) {
	const input = await sharp({
		text: {
			text: `<span foreground="${color}">${esc(text)}</span>`,
			font: `${FONTS} ${bold ? 'Bold ' : ''}${size}`,
			width,
			rgba: true,
			dpi: 72,
			wrap: 'word-char',
		},
	})
		.png()
		.toBuffer();
	return input;
}

const layers = [
	{ input: await textLayer(title, { size: 88, color: '#1f2328', bold: true }), left: 96, top: 210 },
	{ input: await textLayer(description, { size: 38, color: '#6e7781' }), left: 96, top: 340 },
	{ input: await textLayer(host, { size: 30, color: '#0969da' }), left: 96, top: 515 },
];

await sharp(Buffer.from(background)).composite(layers).png().toFile(join(root, 'public', 'og-default.png'));
console.log('✔ 已產生 public/og-default.png');
