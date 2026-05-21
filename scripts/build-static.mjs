import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");

const pathsToCopy = [
  "index.html",
  "styles.css",
  "script.js",
  "site-config.js",
  "_headers",
  "app",
  "styles"
];

function copyPathSync(source, destination) {
  const stats = statSync(source);

  if (stats.isDirectory()) {
    mkdirSync(destination, { recursive: true });

    for (const entry of readdirSync(source)) {
      copyPathSync(path.join(source, entry), path.join(destination, entry));
    }

    return;
  }

  mkdirSync(path.dirname(destination), { recursive: true });

  try {
    copyFileSync(source, destination);
  } catch (error) {
    if (error?.code === "EPERM" && existsSync(destination)) {
      return;
    }

    throw error;
  }
}

mkdirSync(distDir, { recursive: true });

for (const filePath of pathsToCopy) {
  const source = path.join(rootDir, filePath);
  const destination = path.join(distDir, filePath);

  if (!existsSync(source)) {
    throw new Error(`Missing build asset: ${filePath}`);
  }

  copyPathSync(source, destination);
}

console.log("Static build ready in dist/");
