import { describe, expect, it } from 'vitest';
import { rehypeExternalLinks } from '../src/plugins/rehype-external-links.mjs';
import { remarkAlerts } from '../src/plugins/remark-alerts.mjs';

// 直接建構 mdast / hast 樹來測試，不依賴 Markdown 解析器

function blockquote(firstText: string, ...rest: object[]) {
	return {
		type: 'root',
		children: [
			{
				type: 'blockquote',
				children: [{ type: 'paragraph', children: [{ type: 'text', value: firstText }, ...rest] }],
			},
		],
	};
}

describe('remarkAlerts', () => {
	const run = (tree: any) => (remarkAlerts() as (t: any) => void)(tree);

	it('把 [!NOTE] 轉成提示框並加上中文標題', () => {
		const tree: any = blockquote('[!NOTE]\n內容文字');
		run(tree);
		const bq = tree.children[0];
		expect(bq.data.hName).toBe('div');
		expect(bq.data.hProperties.className).toEqual(['callout', 'callout-note']);
		expect(bq.children[0].children[0].value).toBe('備註');
		expect(bq.children[1].children[0].value).toBe('內容文字');
	});

	it('不分大小寫，支援五種類型', () => {
		for (const [type, label] of [
			['tip', '提示'],
			['IMPORTANT', '重要'],
			['Warning', '注意'],
			['CAUTION', '警告'],
		]) {
			const tree: any = blockquote(`[!${type}]\n文字`);
			run(tree);
			expect(tree.children[0].data.hProperties.className[1]).toBe(`callout-${type.toLowerCase()}`);
			expect(tree.children[0].children[0].children[0].value).toBe(label);
		}
	});

	it('標記單獨一行時移除空段落', () => {
		const tree: any = {
			type: 'root',
			children: [
				{
					type: 'blockquote',
					children: [
						{ type: 'paragraph', children: [{ type: 'text', value: '[!TIP]' }] },
						{ type: 'paragraph', children: [{ type: 'text', value: '第二段' }] },
					],
				},
			],
		};
		run(tree);
		const bq = tree.children[0];
		expect(bq.children).toHaveLength(2);
		expect(bq.children[1].children[0].value).toBe('第二段');
	});

	it('一般引用不受影響', () => {
		const tree: any = blockquote('只是引用 [!NOTE]');
		run(tree);
		expect(tree.children[0].data).toBeUndefined();
	});

	it('未知類型不轉換', () => {
		const tree: any = blockquote('[!INFO]\n文字');
		run(tree);
		expect(tree.children[0].data).toBeUndefined();
	});
});

describe('rehypeExternalLinks', () => {
	const run = (href: string) => {
		const a: any = { type: 'element', tagName: 'a', properties: { href }, children: [] };
		(rehypeExternalLinks({ site: 'https://pro5251.github.io' }) as (t: any) => void)({ type: 'root', children: [a] });
		return a.properties;
	};

	it('外部連結開新分頁並加上 rel 與 class', () => {
		const props = run('https://astro.build');
		expect(props.target).toBe('_blank');
		expect(props.rel).toEqual(['noopener', 'noreferrer']);
		expect(props.className).toContain('external');
	});

	it('站內絕對網址、相對路徑與錨點維持原樣', () => {
		for (const href of ['https://pro5251.github.io/about/', '/archive/', '#title', 'mailto:a@b.c']) {
			expect(run(href).target).toBeUndefined();
		}
	});
});

describe('rehypeTaskListA11y', () => {
	it('依勾選狀態加上 aria-label', async () => {
		const { rehypeTaskListA11y } = await import('../src/plugins/rehype-task-list-a11y.mjs');
		const done: any = { type: 'element', tagName: 'input', properties: { type: 'checkbox', checked: true }, children: [] };
		const todo: any = { type: 'element', tagName: 'input', properties: { type: 'checkbox', checked: false }, children: [] };
		const text: any = { type: 'element', tagName: 'input', properties: { type: 'text' }, children: [] };
		(rehypeTaskListA11y() as (t: any) => void)({ type: 'root', children: [done, todo, text] });
		expect(done.properties.ariaLabel).toBe('已完成');
		expect(todo.properties.ariaLabel).toBe('未完成');
		expect(text.properties.ariaLabel).toBeUndefined();
	});
});
