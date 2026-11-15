import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORIES } from './consts';

const categoryKeys = Object.keys(CATEGORIES) as [string, ...string[]];

const blog = defineCollection({
	// 文章放在 src/content/blog/，可以是單一 .md 檔，也可以是「資料夾/index.md」（圖片放同資料夾）
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string().default(''),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			category: z.enum(categoryKeys),
			tags: z.array(z.string()).default([]),
			heroImage: image().optional(),
			/** 封面圖替代文字 */
			heroImageAlt: z.string().default(''),
			/** 系列名稱：同系列的文章會在文章頁顯示系列目錄 */
			series: z.string().optional(),
			/** 在系列中的順序（省略則依發佈日期） */
			seriesOrder: z.number().int().optional(),
			/** 草稿：正式建置時不會出現 */
			draft: z.boolean().default(false),
			/** 置頂：出現在首頁最上方 */
			pinned: z.boolean().default(false),
			/** 是否顯示目錄 */
			toc: z.boolean().default(true),
			/** 是否開啟留言 */
			comments: z.boolean().default(true),
		}),
});

export const collections = { blog };
