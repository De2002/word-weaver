const ALLOWED_TAGS = new Set([
  'P',
  'BR',
  'STRONG',
  'EM',
  'U',
  'S',
  'UL',
  'OL',
  'LI',
  'A',
  'BLOCKQUOTE',
  'CODE',
  'PRE',
  'H1',
  'H2',
  'H3',
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  A: new Set(['href', 'target', 'rel']),
};

function sanitizeNode(node: Node): Node | null {
  if (node.nodeType === Node.TEXT_NODE) {
    return document.createTextNode(node.textContent || '');
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const element = node as HTMLElement;
  const tag = element.tagName.toUpperCase();

  if (!ALLOWED_TAGS.has(tag)) {
    const fragment = document.createDocumentFragment();
    Array.from(element.childNodes).forEach((child) => {
      const cleanChild = sanitizeNode(child);
      if (cleanChild) {
        fragment.appendChild(cleanChild);
      }
    });
    return fragment;
  }

  const clean = document.createElement(tag.toLowerCase());

  const allowed = ALLOWED_ATTRS[tag];
  if (allowed) {
    allowed.forEach((attr) => {
      const value = element.getAttribute(attr);
      if (!value) return;

      if (attr === 'href') {
        const trimmed = value.trim();
        const isSafe = /^(https?:|mailto:|\/)/i.test(trimmed);
        if (!isSafe) return;
      }

      clean.setAttribute(attr, value);
    });
  }

  if (tag === 'A' && clean.getAttribute('href')) {
    clean.setAttribute('target', '_blank');
    clean.setAttribute('rel', 'noopener noreferrer nofollow');
  }

  Array.from(element.childNodes).forEach((child) => {
    const cleanChild = sanitizeNode(child);
    if (cleanChild) {
      clean.appendChild(cleanChild);
    }
  });

  return clean;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseMarkdownInline(content: string): string {
  let html = escapeHtml(content);

  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
  html = html.replace(/~~([^~]+)~~/g, '<s>$1</s>');
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g, '<a href="$2">$1</a>');

  return html;
}

function flushList(listType: 'ul' | 'ol' | null, items: string[], blocks: string[]) {
  if (!listType || items.length === 0) return;
  blocks.push(`<${listType}>${items.join('')}</${listType}>`);
}

function parseMarkdownBlocks(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: string[] = [];
  let paragraph: string[] = [];
  let codeFence: string[] = [];
  let inFence = false;
  let listType: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(`<p>${parseMarkdownInline(paragraph.join('<br />'))}</p>`);
    paragraph = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.trim().startsWith('```')) {
      flushParagraph();
      flushList(listType, listItems, blocks);
      listType = null;
      listItems = [];

      if (inFence) {
        blocks.push(`<pre><code>${escapeHtml(codeFence.join('\n'))}</code></pre>`);
        codeFence = [];
      }

      inFence = !inFence;
      continue;
    }

    if (inFence) {
      codeFence.push(rawLine);
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList(listType, listItems, blocks);
      listType = null;
      listItems = [];
      const level = headingMatch[1].length;
      blocks.push(`<h${level}>${parseMarkdownInline(headingMatch[2].trim())}</h${level}>`);
      continue;
    }

    const quoteMatch = line.match(/^>\s?(.*)$/);
    if (quoteMatch) {
      flushParagraph();
      flushList(listType, listItems, blocks);
      listType = null;
      listItems = [];
      blocks.push(`<blockquote>${parseMarkdownInline(quoteMatch[1])}</blockquote>`);
      continue;
    }

    const orderedListMatch = line.match(/^\d+\.\s+(.+)$/);
    if (orderedListMatch) {
      flushParagraph();
      if (listType && listType !== 'ol') {
        flushList(listType, listItems, blocks);
        listItems = [];
      }
      listType = 'ol';
      listItems.push(`<li>${parseMarkdownInline(orderedListMatch[1])}</li>`);
      continue;
    }

    const unorderedListMatch = line.match(/^[-*]\s+(.+)$/);
    if (unorderedListMatch) {
      flushParagraph();
      if (listType && listType !== 'ul') {
        flushList(listType, listItems, blocks);
        listItems = [];
      }
      listType = 'ul';
      listItems.push(`<li>${parseMarkdownInline(unorderedListMatch[1])}</li>`);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList(listType, listItems, blocks);
      listType = null;
      listItems = [];
      continue;
    }

    if (listType) {
      flushList(listType, listItems, blocks);
      listType = null;
      listItems = [];
    }

    paragraph.push(line);
  }

  flushParagraph();
  flushList(listType, listItems, blocks);

  if (inFence) {
    blocks.push(`<pre><code>${escapeHtml(codeFence.join('\n'))}</code></pre>`);
  }

  return blocks.join('');
}

export function markdownToRichTextHtml(markdown: string): string {
  if (!markdown.trim()) return '';
  return sanitizeRichTextHtml(parseMarkdownBlocks(markdown));
}

export function looksLikeMarkdown(input: string): boolean {
  return /(^|\n)#{1,3}\s|\*\*|__|\[[^\]]+\]\([^\)]+\)|(^|\n)[-*]\s|(^|\n)\d+\.\s|(^|\n)>\s|```/.test(input);
}

export function sanitizeRichTextHtml(input: string): string {
  if (!input) return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(input, 'text/html');
  const wrapper = document.createElement('div');

  Array.from(doc.body.childNodes).forEach((node) => {
    const cleanNode = sanitizeNode(node);
    if (cleanNode) {
      wrapper.appendChild(cleanNode);
    }
  });

  return wrapper.innerHTML.trim();
}

export function richTextToPlainText(input: string): string {
  if (!input) return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(input, 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
}
