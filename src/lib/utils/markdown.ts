export function parseMarkdown(text: string): string {
  if (!text) return "";

  const escapes: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };

  return text
    .replace(/[&<>"]/g, m => escapes[m])
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/([*_])(.*?)\1/g, "<em>$2</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, l, u) => `<a href="${u.trim().replace(/^javascript:/i, "")}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${l}</a>`)
    .replace(/`(.*?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/^&gt;\s?(.*)$/gm, '<blockquote class="border-l-4 border-primary pl-4 italic opacity-80 my-2">$1</blockquote>');
}
