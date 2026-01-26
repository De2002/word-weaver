import { useEffect } from 'react';

interface SEOOptions {
  title: string;
  description?: string;
}

const DEFAULT_TITLE = 'WordStack';
const DEFAULT_DESCRIPTION = 'A home for poets. Share drafts, publish poetry, and build a following around your voice.';

/**
 * Custom hook to manage page-level SEO (document title and meta description)
 * 
 * @param options - SEO options containing title and optional description
 * @param options.title - Page title (will be appended with "| WordStack")
 * @param options.description - Meta description for the page
 */
export function useSEO({ title, description }: SEOOptions) {
  useEffect(() => {
    // Set document title
    const fullTitle = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;
    document.title = fullTitle;

    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    const descriptionContent = description || DEFAULT_DESCRIPTION;
    
    if (metaDescription) {
      metaDescription.setAttribute('content', descriptionContent);
    }

    // Set Open Graph title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', fullTitle);
    }

    // Set Open Graph description
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', descriptionContent);
    }

    // Cleanup - reset to defaults when component unmounts
    return () => {
      document.title = DEFAULT_TITLE;
      if (metaDescription) {
        metaDescription.setAttribute('content', DEFAULT_DESCRIPTION);
      }
      if (ogTitle) {
        ogTitle.setAttribute('content', DEFAULT_TITLE);
      }
      if (ogDescription) {
        ogDescription.setAttribute('content', DEFAULT_DESCRIPTION);
      }
    };
  }, [title, description]);
}

export { DEFAULT_TITLE, DEFAULT_DESCRIPTION };
