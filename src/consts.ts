// 全站設定集中在這裡，改這個檔案就能調整大部分內容。

export const SITE = {
	title: '我的部落格',
	description: '記錄技術、學習與生活的地方。',
	author: 'pro5251',
	lang: 'zh-Hant-TW',
	locale: 'zh-TW',
	/** 首頁與分類頁每頁文章數 */
	postsPerPage: 10,
	/** 預設社群分享圖（放在 public/ 底下的路徑），沒有就留空 */
	ogImage: '',
};

export const NAV_LINKS = [
	{ href: '/', label: '首頁' },
	{ href: '/categories/', label: '分類' },
	{ href: '/tags/', label: '標籤' },
	{ href: '/archive/', label: '歸檔' },
	{ href: '/about/', label: '關於' },
];

export const SOCIAL_LINKS = [
	{ href: 'https://github.com/pro5251', label: 'GitHub' },
	{ href: '/rss.xml', label: 'RSS' },
];

/**
 * 分類清單：文章 frontmatter 的 category 必須是這裡的 key。
 * key 會用在網址（/categories/tech/），所以用英文小寫；name 是顯示名稱。
 * 新增分類只要在這裡加一行。
 */
export const CATEGORIES = {
	tech: { name: '技術', description: '程式、工具與系統架構。' },
	notes: { name: '學習筆記', description: '讀書與課程的整理。' },
	life: { name: '生活', description: '日常與隨筆。' },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

/**
 * Giscus 留言（https://giscus.app）。
 * 到 giscus.app 填入 repo 後，把產生的 repoId、categoryId 貼到這裡就會啟用。
 * 留空則不顯示留言區。
 */
export const GISCUS = {
	repo: 'pro5251/pro5251.github.io',
	repoId: '',
	category: 'Announcements',
	categoryId: '',
	mapping: 'pathname',
	lang: 'zh-TW',
};
