import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../consts';
import { renderPostForFeed } from '../lib/feed';
import { categoryName, getPosts, postUrl } from '../lib/posts';

export async function GET(context: APIContext) {
	const posts = await getPosts();
	const items = await Promise.all(
		posts.map(async (post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: postUrl(post),
			categories: [categoryName(post.data.category), ...post.data.tags],
			// 全文輸出，讓 RSS 閱讀器不用點進網站也能讀完
			content: await renderPostForFeed(post, context.site!),
		})),
	);
	return rss({
		title: SITE.title,
		description: SITE.description,
		site: context.site!,
		items,
		customData: `<language>${SITE.locale}</language>`,
		trailingSlash: true,
	});
}
