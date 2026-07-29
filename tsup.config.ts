import { defineConfig } from "tsup";
import { createRequire } from "node:module";

// `createRequire` rather than a static `import pkg from "./package.json"` —
// this file runs under "type": "module", where JSON imports need either
// import-assertion syntax (version-dependent across Node) or this, which
// works everywhere without it.
const require = createRequire(import.meta.url);
const pkg = require("./package.json") as { peerDependencies?: Record<string, string> };

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  // Every peer dependency, read from package.json rather than duplicated
  // here by hand — react/react-dom/every @tiptap/* package must never get
  // bundled into the output; a consumer supplies their own copies (and
  // Tiptap in particular breaks if more than one copy of @tiptap/core ends
  // up loaded at once).
  external: Object.keys(pkg.peerDependencies ?? {}),
});
