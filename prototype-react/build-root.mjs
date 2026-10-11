import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";

const here = process.cwd();
const repoRoot = path.resolve(here, "..");
const outDir = path.join(here, "dist");

const includeTopLevel = new Set([
  ".nojekyll",
  "CNAME",
  "script.js",
  "styles.css",
]);

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const entries = await readdir(repoRoot);

for (const name of entries) {
  if (name === "prototype-react" || name === ".git" || name === ".github") continue;

  const src = path.join(repoRoot, name);
  const dst = path.join(outDir, name);
  const info = await stat(src);

  if (info.isDirectory()) {
    if (name === "assets") {
      await cp(src, dst, { recursive: true });
    }
    continue;
  }

  if (name.endsWith(".html") || includeTopLevel.has(name)) {
    await cp(src, dst);
  }
}

console.log("CivicAscent staging static build complete:", outDir);
