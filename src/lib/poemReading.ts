export type ReadingFont = 'georgia' | 'playfair' | 'libre' | 'eb';

export interface ReadingPreferences {
  font: ReadingFont;
  fontSize: number;
  lineHeight: number;
  lineWidth: number;
}

export const DEFAULT_READING_PREFERENCES: ReadingPreferences = {
  font: 'libre',
  fontSize: 18,
  lineHeight: 1.8,
  lineWidth: 620,
};

export const fontStyles: Record<ReadingFont, { label: string; family: string }> = {
  georgia: {
    label: 'Georgia',
    family: 'Georgia, "Times New Roman", serif',
  },
  playfair: {
    label: 'Playfair Display',
    family: '"Playfair Display", Georgia, serif',
  },
  libre: {
    label: 'Libre Baskerville',
    family: '"Libre Baskerville", Georgia, serif',
  },
  eb: {
    label: 'EB Garamond',
    family: '"EB Garamond", Georgia, serif',
  },
};
