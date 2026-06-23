function walk(node) {
  if (node.type === 'element' && node.tagName === 'p') {
    // Check if the p tag contains exactly one img element
    const imgChild = node.children.find(child => child.type === 'element' && child.tagName === 'img');
    const hasTextContent = node.children.some(child => child.type === 'text' && child.value.trim().length > 0);
    
    if (imgChild && !hasTextContent && imgChild.properties && imgChild.properties.alt) {
      const altText = imgChild.properties.alt;
      node.tagName = 'figure';
      node.children = [
        imgChild,
        {
          type: 'element',
          tagName: 'figcaption',
          properties: {},
          children: [{ type: 'text', value: altText }]
        }
      ];
    }
  }
  
  if (node.children) {
    node.children.forEach(walk);
  }
}

export default function rehypeImageCaptions() {
  return walk;
}
