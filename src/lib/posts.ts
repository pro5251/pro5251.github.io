import { type CollectionEntry, getCollection } from 'astro:content';
import { CATEGORIES, type CategoryKey } from '../consts';

export type Post = CollectionEntry<'blog'>;

/** 取得所有文章（正式建置排除草稿），依發佈日期新到舊排序 */
export async function getPosts(): Promise<Post[]> {
	const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
	return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** 置頂文章排前面，其餘維持日期排序 */
export function pinnedFirst(posts: Post[]): Post[] {
	return [...posts.filter((p) => p.data.pinned), ...posts.filter((p) => !p.data.pinned)];
}

export function postUrl(post: Post): string {
	return `/posts/${post.id}/`;
}

export function categoryName(key: string): string {
	return CATEGORIES[key as CategoryKey]?.name ?? key;
}

export function categoryUrl(key: string): string {
	return `/categories/${key}/`;
}

/** 標籤轉網址用的 slug：轉小寫、空白換成 - ，保留中文 */
export function tagSlug(tag: string): string {
	return tag.trim().toLowerCase().replace(/\s+/g, '-');
}

export function tagUrl(tag: string): string {
	return `/tags/${tagSlug(tag)}/`;
}

/** 每個分類的文章數（含沒有文章的分類），依 CATEGORIES 的順序 */
export function getCategoryCounts(posts: Post[]) {
	return Object.entries(CATEGORIES).map(([key, info]) => ({
		key,
		...info,
		count: posts.filter((p) => p.data.category === key).length,
	}));
}

/** 所有標籤與文章數，依數量多到少 */
export function getTagCounts(posts: Post[]) {
	const map = new Map<string, { name: string; slug: string; count: number }>();
	for (const post of posts) {
		for (const tag of post.data.tags) {
			const slug = tagSlug(tag);
			const entry = map.get(slug) ?? { name: tag, slug, count: 0 };
			entry.count++;
			map.set(slug, entry);
		}
	}
	return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** 估算閱讀時間：中日韓文字每分鐘約 400 字、英文每分鐘約 200 字 */
export function readingTime(body = ''): number {
	const text = body
		.replace(/```[\s\S]*?```/g, ' ') // 程式碼區塊不算
		.replace(/<[^>]+>/g, ' ')
		.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1');
	const cjk = (text.match(/[぀-ヿ㐀-鿿豈-﫿가-힯]/g) ?? []).length;
	const words = (text.replace(/[぀-ヿ㐀-鿿豈-﫿가-힯]/g, ' ').match(/[A-Za-z0-9_'-]+/g) ?? [])
		.length;
	return Math.max(1, Math.round(cjk / 400 + words / 200));
}

/** 相關文章：同標籤每個 +2 分、同分類 +1 分，取分數最高的幾篇 */
export function getRelatedPosts(current: Post, posts: Post[], limit = 3): Post[] {
	const tags = new Set(current.data.tags.map(tagSlug));
	return posts
		.filter((p) => p.id !== current.id)
		.map((p) => {
			const shared = p.data.tags.filter((t) => tags.has(tagSlug(t))).length;
			const score = shared * 2 + (p.data.category === current.data.category ? 1 : 0);
			return { post: p, score };
		})
		.filter((x) => x.score > 0)
		.sort((a, b) => b.score - a.score || b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf())
		.slice(0, limit)
		.map((x) => x.post);
}

/** 依年份分組（歸檔頁用） */
export function groupByYear(posts: Post[]) {
	const groups = new Map<number, Post[]>();
	for (const post of posts) {
		const year = post.data.pubDate.getFullYear();
		groups.set(year, [...(groups.get(year) ?? []), post]);
	}
	return [...groups.entries()].sort((a, b) => b[0] - a[0]);
}
