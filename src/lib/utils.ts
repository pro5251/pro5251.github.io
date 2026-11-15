// 不依賴 Astro 的純函式，方便單元測試（tests/utils.test.ts）。

/** 文章的最小形狀：讓函式能同時處理 Astro 的 entry 與測試用假資料 */
export interface PostLike {
	id: string;
	body?: string;
	data: {
		pubDate: Date;
		category: string;
		tags: string[];
		series?: string;
		seriesOrder?: number;
	};
}

const CJK = /[぀-ヿ㐀-鿿豈-﫿가-힯]/g;

/**
 * 標籤轉網址用的 slug：轉小寫、空白換成 - ，保留中文。
 * 常見的程式語言寫法先轉成文字（C# → c-sharp），其餘會破壞路徑的字元（/ ? # % \）換成 -。
 */
export function tagSlug(tag: string): string {
	return tag
		.trim()
		.toLowerCase()
		.replace(/^\.(?=[a-z])/, 'dot')
		.replace(/#/g, '-sharp')
		.replace(/\+/g, '-plus')
		.replace(/[\s/?#%\\&]+/g, '-')
		.replace(/-{2,}/g, '-')
		.replace(/^-+|-+$/g, '');
}

/** 估算閱讀分鐘數：中日韓文字每分鐘約 400 字、英文每分鐘約 200 字，至少 1 分鐘 */
export function readingTime(body = ''): number {
	const text = body
		.replace(/^---[\s\S]*?---/, ' ') // frontmatter
		.replace(/```[\s\S]*?```/g, ' ') // 程式碼區塊不算
		.replace(/<[^>]+>/g, ' ')
		.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1');
	const cjk = (text.match(CJK) ?? []).length;
	const words = (text.replace(CJK, ' ').match(/[A-Za-z0-9][A-Za-z0-9_'-]*/g) ?? []).length;
	return Math.max(1, Math.round(cjk / 400 + words / 200));
}

/** 依發佈日期新到舊排序（不改動原陣列） */
export function sortByDate<T extends PostLike>(posts: T[]): T[] {
	return [...posts].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** 相關文章：同標籤每個 +2 分、同分類 +1 分，同分數時較新的優先 */
export function getRelatedPosts<T extends PostLike>(current: T, posts: T[], limit = 3): T[] {
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

/** 依年份分組（新到舊），年份以台灣時間計算 */
export function groupByYear<T extends PostLike>(posts: T[]): [number, T[]][] {
	const groups = new Map<number, T[]>();
	for (const post of posts) {
		const year = new Date(post.data.pubDate.valueOf() + 8 * 3600 * 1000).getUTCFullYear();
		groups.set(year, [...(groups.get(year) ?? []), post]);
	}
	return [...groups.entries()].sort((a, b) => b[0] - a[0]);
}

/** 同一系列的文章，依 seriesOrder（沒有則依日期）由舊到新排列 */
export function getSeriesPosts<T extends PostLike>(series: string, posts: T[]): T[] {
	return posts
		.filter((p) => p.data.series === series)
		.sort(
			(a, b) =>
				(a.data.seriesOrder ?? Infinity) - (b.data.seriesOrder ?? Infinity) ||
				a.data.pubDate.valueOf() - b.data.pubDate.valueOf(),
		);
}
