// Tag utility functions for smart tag handling

/**
 * Normalize a tag: lowercase, trim, remove special chars, replace spaces with hyphens
 */
export function normalizeTag(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');   // Remove leading/trailing hyphens
}

/**
 * Check if two tags are the same (case-insensitive, normalized)
 */
export function tagsMatch(tag1: string, tag2: string): boolean {
  return normalizeTag(tag1) === normalizeTag(tag2);
}

/**
 * Add a tag to an array, preventing duplicates (smart matching)
 */
export function addTag(tags: string[], newTag: string): string[] {
  const normalized = normalizeTag(newTag);
  if (!normalized) return tags;
  
  const exists = tags.some(t => normalizeTag(t) === normalized);
  if (exists) return tags;
  
  return [...tags, normalized];
}

/**
 * Remove a tag from an array
 */
export function removeTag(tags: string[], tagToRemove: string): string[] {
  const normalized = normalizeTag(tagToRemove);
  return tags.filter(t => normalizeTag(t) !== normalized);
}

/**
 * Parse tags from a comma or space separated string
 */
export function parseTags(input: string): string[] {
  const rawTags = input
    .split(/[,\s]+/)
    .map(t => normalizeTag(t))
    .filter(Boolean);
  
  // Remove duplicates
  return [...new Set(rawTags)];
}

/**
 * Get display format for a tag (with #)
 */
export function formatTagDisplay(tag: string): string {
  return `#${normalizeTag(tag)}`;
}

/**
 * Get URL-safe format for a tag
 */
export function tagToSlug(tag: string): string {
  return encodeURIComponent(normalizeTag(tag));
}

/**
 * Get tag from URL slug
 */
export function slugToTag(slug: string): string {
  return decodeURIComponent(slug);
}
