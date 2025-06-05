export function markdownWithWikiLinks(text: string): string {
  return text.replace(/\[\[([^\]]+)\]\]/g, (_, title) => {
    return `[${title}](wiki:${encodeURIComponent(title)})`;
  });
}

export function extractWikiLinks(text: string): string[] {
  const regex = /\[\[([^\]]+)\]\]/g;
  const links: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    links.push(match[1]);
  }
  return links;
}
