const copyIconAst = {
  type: 'element',
  tagName: 'svg',
  properties: {
    xmlns: 'http://www.w3.org/2000/svg',
    width: '16', height: '16', viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round',
    'aria-hidden': 'true'
  },
  children: [
    { type: 'element', tagName: 'path', properties: { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' }, children: [] },
    { type: 'element', tagName: 'rect', properties: { x: '8', y: '2', width: '8', height: '4', rx: '1', ry: '1' }, children: [] }
  ]
};

function walk(node) {
  if (node.type === 'element' && (node.tagName === 'pre' || node.tagName === 'blockquote')) {
    node.children.push({
      type: 'element',
      tagName: 'button',
      properties: {
        className: ['copy-button'],
        type: 'button',
        ariaLabel: node.tagName === 'pre' ? 'Copy code' : 'Copy quote',
        title: 'Copy to clipboard'
      },
      children: [structuredClone(copyIconAst)]
    });
  }
  node.children?.forEach(walk);
}

export default function rehypeCopyButton() {
  return walk;
}
