const fs = require("fs");
const path = require("path");
const { ResourceDependency } = require("sistema");

const CSS_PATH = path.join(__dirname, "../../build/lens.css");
const JS_PATH = path.join(__dirname, "../../build/lens.js");

const cssStr = fs.readFileSync(CSS_PATH, "utf8");
const jsStr = fs.readFileSync(JS_PATH, "utf8");

function getName(d) {
  return d.name ?? "unknown";
}

function lens(adjacencyList, info = new Map(), { title }) {
  const nodes = [];
  const links = [];

  for (const target of adjacencyList) {
    nodes.push({
      name: getName(target),
      info: info.get(target),
      isResourceDependency: target instanceof ResourceDependency,
    });
    for (const source of target.getEdges()) {
      links.push({
        source: getName(source),
        target: getName(target),
        id: `${getName(target)}-${getName(source)}`,
      });
    }
  }

  return `<!DOCTYPE html>
    <head>
      <title>${title ?? "Sistema lens"}</title>
      <meta charset="utf-8">
      <style>${cssStr}</style>
    </head>
    <body>
      <div>
        <div class="lens-header">${title ?? "Sistema lens"}</div>
        <div class="lens-graph" id="lens-graph"></div>
        <div class="lens-help" id="lens-help"></div>
      </div>
      <script>${jsStr}</script>
      <script>
        const lens = new window.Lens()
        lens.render(${JSON.stringify(nodes)}, ${JSON.stringify(links)})
      </script>
    </body>`;
}

module.exports = lens;
