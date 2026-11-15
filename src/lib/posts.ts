import { type CollectionEntry, getCollection } from 'astro:content';
import { CATEGORIES, type CategoryKey } from '../consts';
import { sortByDate, tagSlug } from './utils';

export { getRelatedPosts, getSeriesPosts, groupByYear, readingTime, tagSlug } from './utils';

export type Post = CollectionEntry<'blog'>;

/** 取得所有文章（正式建置排除草稿），依發佈日期新到舊排序 */
export async function getPosts(): Promise<Post[]> {
	const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
	return sortByDate(posts);
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
