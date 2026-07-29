import { Extension } from "@tiptap/core";
import { NodeSelection, Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { ZINC_THEME } from "../themes/definitions/zinc";

export interface BlockSelectionHighlightOptions {
  // The active theme's `blockSelection` — MarkdownLiveEditor always passes
  // it explicitly (see MarkdownLiveEditor.tsx); the zinc default here only
  // matters if this extension is ever used standalone, outside that.
  className: string;
}

export const BlockSelectionHighlight = Extension.create<BlockSelectionHighlightOptions>({
  name: "blockSelectionHighlight",
  addOptions() {
    return { className: ZINC_THEME.blockSelection };
  },
  addProseMirrorPlugins() {
    // Captured here, not read inside `decorations` below — that callback
    // is invoked by ProseMirror itself, not as a method on this extension,
    // so `this.options` wouldn't resolve there the way it does in this
    // outer scope.
    const className = this.options.className;
    return [
      new Plugin({
        key: new PluginKey("blockSelectionHighlight"),
        props: {
          decorations(state) {
            const { selection } = state;
            if (!(selection instanceof NodeSelection)) return null;
            return DecorationSet.create(state.doc, [
              Decoration.node(selection.from, selection.to, { class: className }),
            ]);
          },
        },
      }),
    ];
  },
  addKeyboardShortcuts() {
    const deleteSelectedNode = () => {
      if (!(this.editor.state.selection instanceof NodeSelection)) return false;
      return this.editor.commands.deleteSelection();
    };
    return {
      Delete: deleteSelectedNode,
      Backspace: deleteSelectedNode,
    };
  },
});
