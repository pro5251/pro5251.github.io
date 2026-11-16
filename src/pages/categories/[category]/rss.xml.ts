import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { CATEGORIES, SITE, type CategoryKey } from '../../../consts';
import { renderPostForFeed } from '../../../lib/feed';
import { getPosts, postUrl } from '../../../lib/posts';

// 每個分類各自的 RSS：/categories/<key>/rss.xml
export function getStaticPaths() {
	return Object.keys(CATEGORIES).map((category) => ({ params: { category } }));
}

export async function GET(context: APIContext) {
	const key = context.params.category as CategoryKey;
	const info = CATEGORIES[key];
	const posts = (await getPosts()).filter((p) => p.data.category === key);
	const items = await Promise.all(
		posts.map(async (post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: postUrl(post),
			categories: post.data.tags,
			content: await renderPostForFeed(post, context.site!),
		})),
	);
	return rss({
		title: `${info.name} | ${SITE.title}`,
		description: info.description,
		site: context.site!,
		items,
		customData: `<language>${SITE.locale}</language>`,
		trailingSlash: true,
	});
}
