import { splitText } from "animejs";

// Wraps each word of an element's text in its own span (Anime.js handles the
// accessible-markup fallback) so headings can animate in word-by-word instead
// of as one block. Callers must call `.revert()` on unmount / before
// re-splitting — React never re-renders this subtree, so nothing else does.
export function splitWords(el: HTMLElement) {
  const splitter = splitText(el, { words: true, chars: false, accessible: true });
  return { splitter, words: splitter.words as HTMLElement[] };
}
