import { Node, createAtomBlockMarkdownSpec } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { embedDomSpec } from "markdown-live-editor";

function CalloutView({ node }: NodeViewProps) {
  return (
    <NodeViewWrapper
      data-type="callout"
      className="rounded-md border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-200 text-sm px-3 py-2 mb-4"
    >
      {node.attrs.text as string}
    </NodeViewWrapper>
  );
}

export const Callout = Node.create({
  name: "callout",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      text: { default: "Note" },
    };
  },
  ...embedDomSpec("callout"),
  addNodeView() {
    return ReactNodeViewRenderer(CalloutView);
  },
  ...createAtomBlockMarkdownSpec({
    nodeName: "callout",
    defaultAttributes: { text: "Note" },
    allowedAttributes: ["text"],
  }),
});
