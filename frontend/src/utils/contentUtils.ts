export const getExcerpt = (content: string | null): string => {
    if (!content) return '';
    try {
        const parsed = JSON.parse(content);
        const contentJSON = parsed?.contentJSON;
        if (contentJSON?.content) {
            const texts: string[] = [];
            const traverse = (nodes: any[]) => {
                for (const node of nodes) {
                    if (node.type === 'heading') continue;
                    if (node.type === 'text' && node.text) texts.push(node.text);
                    if (node.content) traverse(node.content);
                    if (texts.join('').length > 200) return;
                }
            };
            traverse(contentJSON.content);
            const full = texts.join(' ').trim();
            return full.length > 180 ? full.substring(0, 180) + '...' : full;
        }
    } catch {
        // plain string
    }
    const plain = typeof content === 'string' ? content.replace(/<[^>]+>/g, ' ').trim() : '';
    return plain.length > 180 ? plain.substring(0, 180) + '...' : plain;
};

export const getImageUrl = (content: string | null): string | null => {
    if (!content) return null;
    try {
        const parsed = JSON.parse(content);
        const contentJSON = parsed?.contentJSON;
        if (contentJSON?.content) {
            const findImage = (nodes: any[]): string | null => {
                for (const node of nodes) {
                    if (node.type === 'resizableImage' && node.attrs?.src) return node.attrs.src;
                    if (node.type === 'image' && node.attrs?.src) return node.attrs.src;
                    if (node.content) {
                        const found = findImage(node.content);
                        if (found) return found;
                    }
                }
                return null;
            };
            return findImage(contentJSON.content);
        }
    } catch {
        // ignore
    }
    return null;
};
