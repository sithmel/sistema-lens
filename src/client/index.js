import * as d3 from "d3";

const LENS_DEFAULT_OPTIONS = {
  SVGDOMnode: "#lens-graph",
  helpDOMNode: "#lens-help",
  width: 650,
  height: 650,
  linkDistance: 100,
  refX: 15,
  refY: -1.5,
  markerWidth: 6,
  markerHeight: 6,
  nodeRadius: 8,
  textPositionX: 12,
  textPositionY: ".31em",
};

function linkArc(d) {
  var dx = d.target.x - d.source.x;
  var dy = d.target.y - d.source.y;
  var dr = Math.sqrt(dx * dx + dy * dy);
  return (
    "M" +
    d.source.x +
    "," +
    d.source.y +
    "A" +
    dr +
    "," +
    dr +
    " 0 0,1 " +
    d.target.x +
    "," +
    d.target.y
  );
}

function transform(d) {
  return "translate(" + d.x + "," + d.y + ")";
}

class Lens {
  constructor(opts) {
    this.opts = { ...LENS_DEFAULT_OPTIONS, ...opts };
    this.path = undefined;
    this.circle = undefined;
    this.text = undefined;

    const {
      SVGDOMnode,
      helpDOMNode,
      width,
      height,
      refX,
      refY,
      markerWidth,
      markerHeight,
    } = this.opts;

    this.$SVGDOMnode = d3.select(SVGDOMnode);
    this.$helpDOMnode = d3.select(helpDOMNode);

    this.simulation = d3
      .forceSimulation()
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(height / 2, width / 2))
      .alphaTarget(1)
      .on("tick", () => {
        // // Use elliptical arc path segments to doubly-encode directionality.
        this.path.attr("d", linkArc);
        this.circle.attr("transform", transform);
        this.text.attr("transform", transform);
      });

    // render
    this.svg = this.$SVGDOMnode
      .append("svg")
      .attr("viewBox", "0 0 " + width + " " + height)
      .classed("dlens-graph", true);

    // Per-type markers, as they don't inherit styles.
    this.svg
      .append("defs")
      .selectAll("marker")
      .data(["linked"])
      .enter()
      .append("marker")
      .attr("id", (d) => d)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", refX)
      .attr("refY", refY)
      .attr("markerWidth", markerWidth)
      .attr("markerHeight", markerHeight)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5");

    this.groupPath = this.svg.append("g");
    this.groupCircle = this.svg.append("g");
    this.groupText = this.svg.append("g");
  }
  // Reheat the simulation when drag starts, and fix the subject position.
  _dragStarted(event) {
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  // Update the subject (dragged node) position during drag.
  _dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  // Restore the target alpha so the simulation cools after dragging ends.
  // Unfix the subject position now that it’s no longer being dragged.
  _dragEnded(event) {
    if (!event.active) this.simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }
  render(nodes, links) {
    const { linkDistance, nodeRadius, textPositionX, textPositionY } =
      this.opts;
    // init force simulation
    const forceLinks = d3
      .forceLink()
      .links(links)
      .distance(linkDistance)
      .id((d) => d.name);

    const pathUpdate = this.groupPath
      .selectAll("path")
      .data(links, (d) => d.id);

    this.path = pathUpdate
      .enter()
      .append("path")
      .classed("dlens-graph__link", true)
      .attr("marker-end", (d) => "url(#linked)")
      .merge(pathUpdate);

    const circleUpdate = this.groupCircle
      .selectAll("circle")
      .data(nodes, (d) => d.name);

    this.circle = circleUpdate
      .enter()
      .append("circle")
      .attr("data-name", (node) => node.name)
      .attr("data-info", (node) => node.info)
      .classed("dlens-graph__node", true)
      .classed(
        "dlens-graph__node__resource",
        (node) => node.isResourceDependency
      )
      .attr("r", nodeRadius)
      .on("focus", (event, node) => {
        document.body.classList.add("lens-help-show");
        this.$helpDOMnode.html(
          `<h3>${
            node.isResourceDependency ? "ResourceDependency" : "Dependency"
          } - ${node.name}</h3><pre>${node.info}</pre>`
        );
      })
      .on("blur", (node) => {
        document.body.classList.remove("lens-help-show");
      })
      .call(
        d3
          .drag()
          .on("start", (e) => this._dragStarted(e))
          .on("drag", (e) => this._dragged(e))
          .on("end", (e) => this._dragEnded(e))
      )
      .merge(circleUpdate);

    const textUpdate = this.groupText
      .selectAll("text")
      .data(nodes, (d) => d.name);

    this.text = textUpdate
      .enter()
      .append("text")
      .classed("dlens-graph__label", true)
      .attr("x", textPositionX)
      .attr("y", textPositionY)
      .text((d) => d.name)
      .merge(textUpdate);

    pathUpdate.exit().remove();
    circleUpdate.exit().remove();
    textUpdate.exit().remove();

    this.simulation
      .nodes(nodes)
      .force("links", forceLinks)
      .alphaTarget(1)
      .restart();
  }
}
window.Lens = Lens;
