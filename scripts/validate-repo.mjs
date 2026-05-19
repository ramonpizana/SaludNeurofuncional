import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const errors = [];
const warnings = [];

const requiredFiles = [
  "_headers",
  "ARCHITECTURE.md",
  "CONFIGURATION.md",
  "index.html",
  "styles.css",
  "script.js",
  "README.md",
  "package.json",
  "site-config.js",
  ".dev.vars.example",
  "wrangler.jsonc",
  "app/config.js",
  "app/dom.js",
  "app/main.js",
  "app/utils/calendar.js",
  "app/utils/whatsapp.js",
  "app/features/appointment-form.js",
  "app/features/booking-mode.js",
  "app/features/branding.js",
  "app/features/faq.js",
  "app/features/whatsapp-links.js",
  "app/utils/links.js",
  "scripts/build-static.mjs",
  "styles/tokens.css",
  "styles/base.css",
  "styles/layout.css",
  "styles/components.css",
  "styles/sections.css",
  "styles/responsive.css",
  "functions/api/health.ts",
  "server/formatting.js",
  "server/runtime-config.js",
  "server/calcom.js",
  "server/twilio.js",
  "functions/api/webhooks/calcom.js",
  "functions/api/webhooks/twilio/inbound.js"
];

const textExtensions = new Set([
  ".css",
  ".env",
  ".gitignore",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".toml",
  ".txt",
  ".ts",
  ".tsx",
  ".yml",
  ".yaml"
]);

const secretPatterns = [
  {
    label: "Possible private key",
    regex: /-----BEGIN (?:RSA |DSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/
  },
  {
    label: "Possible GitHub token",
    regex: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b/
  },
  {
    label: "Possible GitHub fine-grained token",
    regex: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/
  },
  {
    label: "Possible OpenAI-style key",
    regex: /\bsk-[A-Za-z0-9]{20,}\b/
  },
  {
    label: "Possible Google API key",
    regex: /\bAIza[0-9A-Za-z\-_]{35}\b/
  },
  {
    label: "Possible Slack token",
    regex: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/
  },
  {
    label: "Possible AWS access key",
    regex: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/
  },
  {
    label: "Possible hardcoded credential assignment",
    regex: /\b(?:password|passwd|pwd|secret|api[_-]?key|token)\b\s*[:=]\s*["'`][^"'`\n]{8,}["'`]/
  }
];

function relative(filePath) {
  return path.relative(rootDir, filePath).replace(/\\/g, "/");
}

function addError(message) {
  errors.push(message);
}

function addWarning(message) {
  warnings.push(message);
}

function ensureFile(filePath) {
  if (!existsSync(path.join(rootDir, filePath))) {
    addError(`Missing required file: ${filePath}`);
  }
}

function walk(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    if (
      entry.name === ".agents" ||
      entry.name === ".git" ||
      entry.name === ".specify" ||
      entry.name === "dist" ||
      entry.name === "node_modules" ||
      entry.name === "specs"
    ) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    inspectTextFile(fullPath);
  }
}

function inspectTextFile(fullPath) {
  const fileName = path.basename(fullPath);
  const ext = path.extname(fullPath).toLowerCase();
  const relPath = relative(fullPath);

  if (fileName === ".env" || fileName.startsWith(".env.")) {
    addError(`Environment file should not be committed: ${relPath}`);
    return;
  }

  if (!textExtensions.has(ext) && fileName !== ".gitignore") {
    return;
  }

  const content = readFileSync(fullPath, "utf8");

  for (const pattern of secretPatterns) {
    if (pattern.regex.test(content)) {
      addError(`${pattern.label} found in ${relPath}`);
    }
  }

  if (content.includes("\t")) {
    addWarning(`Tab characters found in ${relPath}. Prefer spaces for consistency.`);
  }
}

function validateHtml() {
  const html = readFileSync(path.join(rootDir, "index.html"), "utf8");

  const requiredPatterns = [
    { label: "description meta tag", regex: /<meta\s+name="description"/i },
    { label: "main landmark", regex: /<main>/i },
    { label: "booking form", regex: /<form[^>]*id="appointment-form"/i },
    { label: "stylesheet reference", regex: /href="styles\.css"/i },
    { label: "script reference", regex: /src="script\.js"/i },
    { label: "site config reference", regex: /src="site-config\.js"/i }
  ];

  for (const check of requiredPatterns) {
    if (!check.regex.test(html)) {
      addError(`HTML validation failed: missing ${check.label}.`);
    }
  }
}

function validateCss() {
  const cssPath = path.join(rootDir, "styles.css");
  const css = readFileSync(cssPath, "utf8");
  const tokensCss = readFileSync(path.join(rootDir, "styles", "tokens.css"), "utf8");
  const responsiveCss = readFileSync(path.join(rootDir, "styles", "responsive.css"), "utf8");

  if (!css.includes('@import url("./styles/tokens.css");')) {
    addError("CSS validation failed: styles.css should import the modular CSS files.");
  }

  if (!tokensCss.includes(":root")) {
    addError("CSS validation failed: expected :root variables block.");
  }

  if (!responsiveCss.includes("@media")) {
    addError("CSS validation failed: expected at least one responsive media query.");
  }
}

function validateBuildOutput() {
  const buildScriptPath = path.join(rootDir, "scripts", "build-static.mjs");

  try {
    execFileSync(process.execPath, [buildScriptPath], {
      cwd: rootDir,
      stdio: "pipe"
    });
  } catch (error) {
    const output = error.stderr?.toString().trim() || error.message;
    addError(`Static build failed:\n${output}`);
    return;
  }

  const distFiles = [
    "dist/index.html",
    "dist/styles.css",
    "dist/script.js",
    "dist/site-config.js",
    "dist/_headers",
    "dist/app/main.js",
    "dist/styles/base.css"
  ];

  for (const file of distFiles) {
    if (!existsSync(path.join(rootDir, file))) {
      addError(`Missing build output file: ${file}`);
    }
  }
}

function validateJavaScript() {
  const jsPath = path.join(rootDir, "script.js");
  const js = readFileSync(jsPath, "utf8");

  if (!js.includes("initSite")) {
    addError("JavaScript validation failed: script entry should initialize the site.");
  }

  const filesToCheck = [
    "script.js",
    "site-config.js",
    "app/config.js",
    "app/dom.js",
    "app/main.js",
    "app/utils/calendar.js",
    "app/utils/whatsapp.js",
    "app/features/appointment-form.js",
    "app/features/booking-mode.js",
    "app/features/branding.js",
    "app/features/faq.js",
    "app/features/whatsapp-links.js",
    "app/utils/links.js",
    "server/formatting.js",
    "server/runtime-config.js",
    "server/calcom.js",
    "server/twilio.js",
    "functions/api/webhooks/calcom.js",
    "functions/api/webhooks/twilio/inbound.js"
  ];

  for (const filePath of filesToCheck) {
    try {
      execFileSync(process.execPath, ["--check", filePath], {
        cwd: rootDir,
        stdio: "pipe"
      });
    } catch (error) {
      const output = error.stderr?.toString().trim() || error.message;
      addError(`JavaScript syntax check failed for ${filePath}:\n${output}`);
    }
  }
}

function validateGitTrackedFiles() {
  try {
    const tracked = execFileSync("git", ["ls-files"], {
      cwd: rootDir,
      encoding: "utf8"
    })
      .split(/\r?\n/)
      .filter(Boolean);

    for (const file of tracked) {
      const basename = path.basename(file);

      if (basename === ".env" || basename.startsWith(".env.")) {
        addError(`Tracked environment file detected: ${file}`);
      }
    }
  } catch (error) {
    addWarning(`Unable to inspect tracked files with git: ${error.message}`);
  }
}

function validateFileSizes() {
  for (const filePath of ["index.html", "styles.css", "script.js"]) {
    const absolutePath = path.join(rootDir, filePath);
    const stats = statSync(absolutePath);

    if (stats.size === 0) {
      addError(`File is empty: ${filePath}`);
    }
  }
}

for (const file of requiredFiles) {
  ensureFile(file);
}

if (errors.length === 0) {
  validateHtml();
  validateCss();
  validateJavaScript();
  validateBuildOutput();
  validateGitTrackedFiles();
  validateFileSizes();
  walk(rootDir);
}

if (warnings.length > 0) {
  console.log("Warnings:");
  for (const warning of warnings) {
    console.log(`- ${warning}`);
  }
  console.log("");
}

if (errors.length > 0) {
  console.error("Repository validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Repository validation passed.");