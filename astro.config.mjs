// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { remarkAlerts } from './src/plugins/remark-alerts.mjs';
import { remarkFigure } from './src/plugins/remark-figure.mjs';
import { rehypeExternalLinks } from './src/plugins/rehype-external-links.mjs';
import { rehypeTaskListA11y } from './src/plugins/rehype-task-list-a11y.mjs';

// 換成自訂網域時，只要改這裡（例如 'https://blog.example.com'）
const SITE_URL = 'https://pro5251.github.io';

export default defineConfig({
	site: SITE_URL,
	trailingSlash: 'always',
	integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/search/') })],
	markdown: {
		// 數學公式只認 $$...$$，避免「$10 到 $20」這類價格被誤判成公式
		remarkPlugins: [remarkAlerts, remarkFigure, [remarkMath, { singleDollarTextMath: false }]],
		rehypePlugins: [[rehypeKatex, { strict: false }], [rehypeExternalLinks, { site: SITE_URL }], rehypeTaskListA11y],
		remarkRehype: {
			footnoteLabel: '註腳',
			footnoteBackLabel: '回到內文',
		},
		shikiConfig: {
			theme: 'github-light',
			wrap: false,
		},
	},
	build: {
		format: 'directory',
	},
});
