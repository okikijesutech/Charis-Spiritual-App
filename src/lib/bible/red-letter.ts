/**
 * Red Letter Scripture Formatter & Typography Helpers
 * Parses and renders the Words of Jesus Christ in reverent, warm red.
 * Per docs/PRD.md and Charis Contemplative Typography.
 */

import React from 'react';

/**
 * Remove red-letter boundary markers for plain-text export, copy, and search.
 */
export function cleanVerseText(text: string): string {
  if (!text) return '';
  return text.replace(/[{}]/g, '');
}

/**
 * Check if a verse contains spoken words of Christ.
 */
export function hasWordsOfChrist(text: string): boolean {
  return Boolean(text && text.includes('{') && text.includes('}'));
}

/**
 * Render verse text with Words of Christ formatted in warm, non-straining red.
 * In light mode: deep reverent crimson (#B91C1C / rose-700).
 * In dark mode: soft, readable coral-rose (#F87171 / rose-400).
 */
export function renderVerseSegments(
  text: string,
  showRedLetter: boolean = true
): React.ReactNode {
  if (!text) return null;
  if (!showRedLetter || !text.includes('{')) {
    return cleanVerseText(text);
  }

  const parts = text.split(/(\{[^}]+\})/g);
  return parts.map((part, idx) => {
    if (part.startsWith('{') && part.endsWith('}')) {
      const inner = part.slice(1, -1);
      return React.createElement(
        'span',
        {
          key: idx,
          className: 'text-[#B91C1C] dark:text-[#F87171] font-medium transition-colors',
          title: 'Words of Christ',
        },
        inner
      );
    }
    return part;
  });
}
