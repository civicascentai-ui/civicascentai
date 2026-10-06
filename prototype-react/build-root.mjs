import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
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

// The canonical knowledge client is intentionally a browser client. Vercel's
// VITE_SUPABASE_PUBLISHABLE_KEY is a public/publishable key, not a service-role
// secret. Write it only into the generated deployment output, never into Git.
const publishableKey =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "";

await mkdir(path.join(outDir, "assets"), { recursive: true });

const runtimeSource = publishableKey
  ? `window.CIVICASCENT_SUPABASE_PUBLISHABLE_KEY = ${JSON.stringify(publishableKey)};\n`
  : `console.warn("CivicAscent canonical client key is not configured for this deployment.");\n`;

await writeFile(
  path.join(outDir, "assets", "canonical-runtime.js"),
  runtimeSource,
  "utf8",
);

const canonicalScripts = [
  '<script src="/assets/canonical-runtime.js"></script>',
  '<script src="/script.js"></script>',
].join("\n");

for (const name of await readdir(outDir)) {
  if (!name.endsWith(".html")) continue;

  const file = path.join(outDir, name);
  let html = await readFile(file, "utf8");

  if (html.includes("/assets/canonical-runtime.js")) continue;

  if (/<\/body>/i.test(html)) {
    html = html.replace(/<\/body>/i, `${canonicalScripts}\n</body>`);
  } else {
    html += `\n${canonicalScripts}\n`;
  }

  await writeFile(file, html, "utf8");
}

console.log(
  "CivicAscent staging static build complete:",
  outDir,
  publishableKey ? "(canonical client configured)" : "(canonical client unavailable)",
);
