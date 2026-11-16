// RSS 全文：用 Container API 完整渲染文章（包含 Astro 優化過的圖片），再把網址轉成絕對網址。
// 直接用 post.rendered.html 不行：裡面的圖片只是 __ASTRO_IMAGE_ 佔位符。

import { getContainerRenderer as getMDXRenderer } from '@astrojs/mdx/container-renderer';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { render } from 'astro:content';
import type { Post } from './posts';
import { absolutizeHtml } from './utils';

let containerPromise: Promise<AstroContainer> | undefined;

function getContainer() {
	containerPromise ??= loadRenderers([getMDXRenderer()]).then((renderers) => AstroContainer.create({ renderers }));
	return containerPromise;
}

/** 文章的完整 HTML（絕對網址），給 RSS 的 content:encoded 使用 */
export async function renderPostForFeed(post: Post, site: URL): Promise<string> {
	const container = await getContainer();
	const { Content } = await render(post);
	const html = await container.renderToString(Content);
	return absolutizeHtml(html, site);
}
