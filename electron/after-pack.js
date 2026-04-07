const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// electron-builder strips node_modules and hidden dirs from extraResources.
// Instead, we skip extraResources for standalone entirely and copy it ourselves.
exports.default = async function afterPack(context) {
  const resourcesDir = path.join(
    context.appOutDir,
    context.packager.platform.name === "mac"
      ? `${context.packager.appInfo.productFilename}.app/Contents/Resources`
      : "resources"
  );

  const standaloneSource = path.join(process.cwd(), ".next", "standalone");
  const standaloneDest = path.join(resourcesDir, ".next", "standalone");

  // Copy the entire standalone directory (including node_modules and .next hidden dir)
  // Use rsync to include dotfiles, or cp with explicit dotfile handling
  execSync(`rsync -a "${standaloneSource}/" "${standaloneDest}/"`, { stdio: "inherit" });

  // Copy .next/static into standalone/.next/static (Next.js expects it there)
  const staticSource = path.join(process.cwd(), ".next", "static");
  const staticDest = path.join(standaloneDest, ".next", "static");
  fs.mkdirSync(staticDest, { recursive: true });
  execSync(`cp -R "${staticSource}/"* "${staticDest}/"`, { stdio: "inherit" });

  // Copy public/ into standalone/public
  const publicSource = path.join(process.cwd(), "public");
  const publicDest = path.join(standaloneDest, "public");
  fs.mkdirSync(publicDest, { recursive: true });
  execSync(`cp -R "${publicSource}/"* "${publicDest}/"`, { stdio: "inherit" });

  console.log("  • copied standalone + static + public into app bundle");
};
