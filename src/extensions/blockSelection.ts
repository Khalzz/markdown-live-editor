import { Extension } from "@tiptap/core";
import { NodeSelection, Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

// The border/tint on a selected block is derived directly from ProseMirror's
// own NodeSelection — there's no separate "which block is selected" state to
// keep in sync, unlike the CodeMirror version this replaces, which had to
// fake node selection with a hand-rolled StateField/StateEffect pair since
// CodeMirror has no native concept of it. Delete/Backspace erase the
// selected node via the built-in `deleteSelection` command, which already
// understands NodeSelection — no custom "eat the block's own trailing
// newline" range math needed either, since ProseMirror blocks are real
// structural nodes, not text delimited by "\n" characters.
// `ring-offset-*` doesn't reserve empty space — it renders the offset gap
// as a solid `--tw-ring-offset-color` box-shadow (white by default), which
// is what showed up as a white gap here. `ring-offset-transparent` keeps
// the same spacing but makes that shadow invisible instead.
// Exported so the drag ghost (DragGhost.tsx / MarkdownLiveEditor.tsx) can
// strip these exact tokens off its own clone of the dragged block's DOM —
// the block is already `setNodeSelection`'d (and so already carries this
// class) by the time it gets cloned for the ghost preview, and the ghost
// shouldn't show the "this is selected in the document" ring/tint on top
// of "this is the thing you're dragging".
export const SELECTED_BLOCK_CLASS = "ring ring-gold-500/10  ring-offset-transparent rounded-xs bg-gold-500/10";

export const BlockSelectionHighlight = Extension.create({
  name: "blockSelectionHighlight",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("blockSelectionHighlight"),
        props: {
          decorations(state) {
            const { selection } = state;
            if (!(selection instanceof NodeSelection)) return null;
            return DecorationSet.create(state.doc, [
              Decoration.node(selection.from, selection.to, { class: SELECTED_BLOCK_CLASS }),
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
