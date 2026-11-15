// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { remarkAlerts } from './src/plugins/remark-alerts.mjs';
import { rehypeExternalLinks } from './src/plugins/rehype-external-links.mjs';

// 換成自訂網域時，只要改這裡（例如 'https://blog.example.com'）
const SITE_URL = 'https://pro5251.github.io';

export default defineConfig({
	site: SITE_URL,
	trailingSlash: 'always',
	integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/search/') })],
	markdown: {
		remarkPlugins: [remarkAlerts],
		rehypePlugins: [[rehypeExternalLinks, { site: SITE_URL }]],
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
