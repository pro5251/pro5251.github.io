// 支援 GitHub 風格提示框：
// > [!NOTE]
// > 內容
// 類型：NOTE / TIP / IMPORTANT / WARNING / CAUTION

const LABELS = {
	note: '備註',
	tip: '提示',
	important: '重要',
	warning: '注意',
	caution: '警告',
};

const MARKER = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*(?:\r?\n)?/i;

function walk(node, fn) {
	fn(node);
	if (node.children) for (const child of node.children) walk(child, fn);
}

export function remarkAlerts() {
	return (tree) => {
		walk(tree, (node) => {
			if (node.type !== 'blockquote') return;
			const first = node.children?.[0];
			if (!first || first.type !== 'paragraph') return;
			const text = first.children?.[0];
			if (!text || text.type !== 'text') return;
			const match = text.value.match(MARKER);
			if (!match) return;

			const type = match[1].toLowerCase();
			text.value = text.value.slice(match[0].length);
			if (!text.value) first.children.shift();
			// 標記後若緊接換行節點，一併移除
			if (first.children[0]?.type === 'break') first.children.shift();
			if (first.children.length === 0) node.children.shift();

			node.data = {
				hName: 'div',
				hProperties: { className: ['callout', `callout-${type}`], role: 'note' },
			};
			node.children.unshift({
				type: 'paragraph',
				data: { hProperties: { className: ['callout-title'] } },
				children: [{ type: 'text', value: LABELS[type] }],
			});
		});
	};
}
