// 待辦清單的 checkbox 沒有文字標籤，螢幕閱讀器無法辨識；補上 aria-label

function walk(node, fn) {
	fn(node);
	if (node.children) for (const child of node.children) walk(child, fn);
}

export function rehypeTaskListA11y() {
	return (tree) => {
		walk(tree, (node) => {
			if (node.type !== 'element' || node.tagName !== 'input') return;
			if (node.properties?.type !== 'checkbox') return;
			node.properties.ariaLabel = node.properties.checked ? '已完成' : '未完成';
		});
	};
}
