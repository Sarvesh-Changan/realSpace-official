import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";

const sourceRoot = path.resolve("_reference/ArnavProperties/www.arnavproperties.com");
const sources = [
  "libraries/lib.css",
  "css/plugins.css",
  "css/navigation-menu.css",
  "style.css",
  "css/shortcodes.css",
];
const scope = ".realspace-property-site";

function splitSelectors(selector) {
  const parts = [];
  let start = 0;
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = 0; index < selector.length; index += 1) {
    const character = selector[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (character === "\\") {
      escaped = true;
      continue;
    }
    if (quote) {
      if (character === quote) quote = "";
      continue;
    }
    if (character === "\"" || character === "'") quote = character;
    else if (character === "(" || character === "[") depth += 1;
    else if (character === ")" || character === "]") depth -= 1;
    else if (character === "," && depth === 0) {
      parts.push(selector.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(selector.slice(start).trim());
  return parts.filter(Boolean);
}

function scopedSelector(selector) {
  if (/^(?:html|body)(?:\s|$)/i.test(selector)) {
    return selector.replace(/^(?:html\s+body|html|body)/i, scope);
  }
  if (selector.startsWith(":root")) return selector.replace(/^:root/, scope);
  return `${scope} ${selector}`;
}

function absolutizeUrls(css, relativeFile) {
  return css.replace(/url\(\s*(['"]?)([^'"\s)]+)\1\s*\)/gi, (match, quote, value) => {
    if (/^(?:data:|https?:|\/|#)/i.test(value)) return match;
    const absolute = path.posix.normalize(path.posix.join(path.posix.dirname(relativeFile.replaceAll(path.sep, "/")), value));
    return `url('${`/arnav/${absolute}`.replaceAll("\\", "/")}')`;
  });
}

const output = [];
for (const source of sources) {
  const relativeFile = source.replaceAll(path.sep, "/");
  const css = absolutizeUrls(fs.readFileSync(path.join(sourceRoot, source), "utf8"), relativeFile);
  const root = postcss.parse(css, { from: source });
  root.walkRules((rule) => {
    let parent = rule.parent;
    while (parent && parent.type !== "root") {
      if (parent.type === "atrule" && /keyframes$/i.test(parent.name)) return;
      parent = parent.parent;
    }
    rule.selector = splitSelectors(rule.selector).map(scopedSelector).join(", ");
  });
  let compiled = root.toString()
    .replace(/#e8a222/gi, "#FECC00")
    .replace(/#eaa629/gi, "#FECC00")
    .replace(/#a90000/gi, "#990000");
  output.push(`/* Source: ${source} */\n${compiled}`);
}

fs.writeFileSync(path.resolve("app/(public)/reference.css"), `${output.join("\n\n")}\n`, "utf8");
