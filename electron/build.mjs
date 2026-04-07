import { build } from "esbuild";

const shared = {
  bundle: true,
  platform: "node",
  target: "node22",
  outdir: "electron/dist",
  external: ["electron"],
  sourcemap: false,
  minify: false,
};

// Main process — bundle all deps into one file
await build({
  ...shared,
  entryPoints: ["electron/main.ts"],
  format: "cjs",
});

// Preload script — separate entry, also bundled
await build({
  ...shared,
  entryPoints: ["electron/preload.ts"],
  format: "cjs",
});

console.log("Electron build complete");
