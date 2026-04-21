import { copyFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");

const filesToCopy = [
  "index.html",
  "styles.css",
  "script.js",
  "site-config.js",
  "_headers"
];

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

for (const file of filesToCopy) {
  const source = path.join(rootDir, file);
  const destination = path.join(distDir, file);

  if (!existsSync(source)) {
    throw new Error(`Missing build asset: ${file}`);
  }

  copyFileSync(source, destination);
}

console.log("Static build ready in dist/");
