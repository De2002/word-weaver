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
