// 圖片說明文字：
//   ![替代文字](./photo.png "這段會成為圖片下方的說明")
// 獨立成段、且有 title 的圖片，會轉成 <figure> + <figcaption>。

function walk(node, fn) {
	fn(node);
	if (node.children) for (const child of node.children) walk(child, fn);
}

export function remarkFigure() {
	return (tree) => {
		walk(tree, (node) => {
			if (node.type !== 'paragraph') return;
			const meaningful = node.children.filter((c) => !(c.type === 'text' && !c.value.trim()));
			if (meaningful.length !== 1) return;
			const img = meaningful[0];
			if (img.type !== 'image' || !img.title) return;

			const caption = img.title;
			node.children = [
				img,
				{
					type: 'paragraph',
					data: { hName: 'figcaption' },
					children: [{ type: 'text', value: caption }],
				},
			];
			node.data = { ...(node.data ?? {}), hName: 'figure' };
		});
	};
}
