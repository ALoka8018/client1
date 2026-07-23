import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node20",
  clean: true,
  // @repo/storage's internal relative imports (index.ts -> gcs.ts/factory.ts)
  // use .js specifiers with no compiled .js file to resolve to, so leaving it
  // external breaks `node dist/index.js` at runtime. @repo/database must stay
  // external — its generated Prisma client relies on dynamic require() for
  // native bindings, which bundling breaks.
  noExternal: ["@repo/storage"],
  // @google-cloud/storage (pulled in via @repo/storage) uses dynamic
  // require() for native/child-process bits that don't survive ESM bundling
  // — keep it external and let Node resolve it from node_modules normally.
  external: ["@google-cloud/storage"],
});
