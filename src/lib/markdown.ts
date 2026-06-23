export function parseMarkdown(text: string): string {
  if (!text) return "";

  // Escape HTML
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Italic
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
    const cleanUrl = url.trim().replace(/^javascript:/i, "");
    return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${label}</a>`;
  });

  // Inline code
  html = html.replace(/`(.*?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

  // Blockquotes
  html = html.replace(/^&gt;\s?(.*)$/gm, '<blockquote class="border-l-4 border-primary pl-4 italic opacity-80 my-2">$1</blockquote>');

  return html;
}
