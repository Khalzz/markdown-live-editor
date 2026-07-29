import { mergeAttributes } from "@tiptap/core";
import Heading from "@tiptap/extension-heading";
import type { MarkdownLiveStyles } from "../types";

// Heading is the one styled node that can't just take a static
// `HTMLAttributes: { class }` via `.configure()` — h1/h2/h3 share one node
// type distinguished by `attrs.level`, so the class has to be picked per
// level inside `renderHTML`.
export function createHeadingNode(styles: MarkdownLiveStyles) {
  return Heading.extend({
    renderHTML({ node, HTMLAttributes }) {
      const level = node.attrs.level as 1 | 2 | 3;
      const className = level === 1 ? styles.h1 : level === 2 ? styles.h2 : styles.h3;
      return [`h${level}`, mergeAttributes(HTMLAttributes, { class: className }), 0];
    },
  }).configure({ levels: [1, 2, 3] });
}
