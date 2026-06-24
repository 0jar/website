import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

// Ensure links open in a new tab safely
DOMPurify.addHook('afterSanitizeAttributes', function (node) {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

export function parseMarkdown(text) {
  if (!text) return "";

  // Parse markdown to HTML
  const rawHtml = marked.parse(text, { 
    gfm: true, 
    breaks: true 
  });

  // Sanitize the HTML to prevent XSS
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'code', 'pre', 'blockquote', 
      'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'del', 'hr'
    ],
    ALLOWED_ATTR: ['href', 'title', 'class'],
  });

  return cleanHtml;
}
