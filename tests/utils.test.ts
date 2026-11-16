import { describe, expect, it } from 'vitest';
import { absolutizeHtml, getRelatedPosts, getSeriesPosts, groupByYear, readingTime, sortByDate, tagSlug, type PostLike } from '../src/lib/utils';

function post(id: string, date: string, extra: Partial<PostLike['data']> = {}): PostLike {
	return { id, data: { pubDate: new Date(date), category: 'tech', tags: [], ...extra } };
}

describe('tagSlug', () => {
	it('轉小寫並把空白換成 -', () => {
		expect(tagSlug('GitHub Pages')).toBe('github-pages');
		expect(tagSlug('  Astro  ')).toBe('astro');
	});
	it('保留中文', () => {
		expect(tagSlug('部落格')).toBe('部落格');
	});
	it('網址特殊字元不會破壞路徑', () => {
		expect(tagSlug('CI/CD')).toBe('ci-cd');
		expect(tagSlug('C#')).toBe('c-sharp');
		expect(tagSlug('C++')).toBe('c-plus-plus');
		expect(tagSlug('.NET')).toBe('dotnet');
		expect(tagSlug('Node.js')).toBe('node.js');
		expect(tagSlug('a?b%c\\d')).toBe('a-b-c-d');
		expect(tagSlug('--x--')).toBe('x');
	});
});

describe('readingTime', () => {
	it('空內容至少 1 分鐘', () => {
		expect(readingTime('')).toBe(1);
	});
	it('中文約每分鐘 400 字', () => {
		expect(readingTime('字'.repeat(1200))).toBe(3);
	});
	it('英文約每分鐘 200 字', () => {
		expect(readingTime('word '.repeat(600))).toBe(3);
	});
	it('不計算程式碼區塊', () => {
		const code = '```js\n' + 'const x = 1;\n'.repeat(2000) + '```';
		expect(readingTime(code)).toBe(1);
	});
	it('連結只計算文字部分', () => {
		expect(readingTime(`[${'字'.repeat(800)}](https://example.com/${'a'.repeat(5000)})`)).toBe(2);
	});
});

describe('sortByDate', () => {
	it('新到舊排序且不改動原陣列', () => {
		const list = [post('a', '2026-01-01'), post('b', '2026-03-01'), post('c', '2026-02-01')];
		expect(sortByDate(list).map((p) => p.id)).toEqual(['b', 'c', 'a']);
		expect(list.map((p) => p.id)).toEqual(['a', 'b', 'c']);
	});
});

describe('getRelatedPosts', () => {
	const current = post('cur', '2026-05-01', { tags: ['Astro', 'CSS'], category: 'tech' });
	const posts = [
		current,
		post('same-cat', '2026-04-01', { category: 'tech' }),
		post('one-tag', '2026-03-01', { category: 'life', tags: ['astro'] }),
		post('two-tags', '2026-02-01', { category: 'life', tags: ['Astro', 'css'] }),
		post('unrelated', '2026-06-01', { category: 'life', tags: ['Food'] }),
	];

	it('依共同標籤與分類計分，排除自己與無關文章', () => {
		expect(getRelatedPosts(current, posts).map((p) => p.id)).toEqual(['two-tags', 'one-tag', 'same-cat']);
	});
	it('遵守數量上限', () => {
		expect(getRelatedPosts(current, posts, 1)).toHaveLength(1);
	});
});

describe('groupByYear', () => {
	it('依台灣時間分年，新年份在前', () => {
		// UTC 12/31 20:00 = 台灣 1/1 04:00，應算在 2026 年
		const list = [post('a', '2025-12-31T20:00:00Z'), post('b', '2025-06-01'), post('c', '2026-03-01')];
		const groups = groupByYear(list);
		expect(groups.map(([y, ps]) => [y, ps.map((p) => p.id)])).toEqual([
			[2026, ['a', 'c']],
			[2025, ['b']],
		]);
	});
});

describe('getSeriesPosts', () => {
	it('只取同系列，依 seriesOrder 再依日期排序', () => {
		const list = [
			post('p3', '2026-01-03', { series: 'K8s' }),
			post('p1', '2026-01-05', { series: 'K8s', seriesOrder: 1 }),
			post('p2', '2026-01-01', { series: 'K8s', seriesOrder: 2 }),
			post('other', '2026-01-02', { series: 'Other' }),
		];
		expect(getSeriesPosts('K8s', list).map((p) => p.id)).toEqual(['p1', 'p2', 'p3']);
	});
});

describe('absolutizeHtml', () => {
	const site = 'https://pro5251.github.io';

	it('站內相對網址轉成絕對網址', () => {
		const html = '<a href="/posts/a/">a</a><img src="/_astro/x.webp">';
		expect(absolutizeHtml(html, site)).toBe(
			'<a href="https://pro5251.github.io/posts/a/">a</a><img src="https://pro5251.github.io/_astro/x.webp">',
		);
	});

	it('外部網址、協定相對網址與錨點不變', () => {
		const html = '<a href="https://x.com/">x</a><img src="//cdn.example.com/a.png"><a href="#top">t</a>';
		expect(absolutizeHtml(html, site)).toBe(html);
	});

	it('處理 srcset 的多個候選', () => {
		const html = '<img srcset="/a-400.webp 400w, /a-800.webp 800w">';
		expect(absolutizeHtml(html, site)).toBe(
			'<img srcset="https://pro5251.github.io/a-400.webp 400w, https://pro5251.github.io/a-800.webp 800w">',
		);
	});

	it('保留中文路徑', () => {
		expect(absolutizeHtml('<a href="/tags/寫作/">t</a>', site)).toContain('https://pro5251.github.io/tags/');
	});
});
