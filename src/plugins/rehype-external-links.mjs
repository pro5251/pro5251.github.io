// 外部連結自動加上 target="_blank" 與 rel="noopener noreferrer"

function walk(node, fn) {
	fn(node);
	if (node.children) for (const child of node.children) walk(child, fn);
}

export function rehypeExternalLinks({ site = '' } = {}) {
	const siteHost = site ? new URL(site).host : '';
	return (tree) => {
		walk(tree, (node) => {
			if (node.type !== 'element' || node.tagName !== 'a') return;
			const href = node.properties?.href;
			if (typeof href !== 'string' || !/^https?:\/\//i.test(href)) return;
			try {
				if (new URL(href).host === siteHost) return;
			} catch {
				return;
			}
			node.properties.target = '_blank';
			node.properties.rel = ['noopener', 'noreferrer'];
			const cls = node.properties.className;
			node.properties.className = [...(Array.isArray(cls) ? cls : cls ? [cls] : []), 'external'];
		});
	};
}
