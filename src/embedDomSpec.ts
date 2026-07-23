import { mergeAttributes } from "@tiptap/core";

type DomOutputSpec = readonly [string, ...unknown[]];

// A minimal `toDOM`/`parseHTML` fallback for atom embed nodes — required
// because `DOMSerializer.fromSchema` needs a valid render spec for every
// node type registered in the schema (not just ones present in the current
// document), not something a NodeView-only node otherwise needs to define
// itself. A consumer building their own custom embed node (page galleries,
// images, whatever else) spreads this into its `Node.create()` config.
export function embedDomSpec(dataType: string) {
  return {
    parseHTML() { return [{ tag: `div[data-type="${dataType}"]` }]; },
    renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }): DomOutputSpec {
      return ["div", mergeAttributes(HTMLAttributes, { "data-type": dataType })];
    },
  };
}
