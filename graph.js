const dims = { width: 400, height: 400, radius: 200 };
const center = { x: dims.width / 2 + 10, y: dims.height / 2 + 10 };

const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", dims.width + 25)
  .attr("height", dims.height + 25);

const graph = svg
  .append("g")
  .attr("transform", `translate(${center.x}, ${center.y})`);

const pie = d3
  .pie()
  .value((d) => d.cost)
  .sort(null)
  .padAngle(0.05);

const arcPath = d3
  .arc()
  .outerRadius(dims.radius)
  .innerRadius(dims.radius / 2);

const color = d3.scaleOrdinal(d3.schemeAccent);

//legends
const legendGroup = svg
  .append("g")
  .attr("transform", `translate(${dims.width + 30}, -100)`);

const legend = d3.legendColor().shape("circle").scale(color).shapePadding(5);

let defs = svg.append("defs");
let filter = defs.append("filter").attr("id", "glow");
filter
  .append("feGaussianBlur")
  .attr("stdDeviation", "2.5")
  .attr("result", "coloredBlur");
let feMerge = filter.append("feMerge");
feMerge.append("feMergeNode").attr("in", "coloredBlur");
feMerge.append("feMergeNode").attr("in", "SourceGraphic");

const update = (data) => {
  const paths = graph.selectAll("path").data(pie(data));
  color.domain(data.map((x) => x.name));

  let legendsList = legendGroup.call(legend);

  legendsList
    .selectAll("circle")
    .attr("stroke", (d) => color(d))
    .attr("stroke-width", 1)
    .attr("fill", (d) => color(d))
    .attr("fill-opacity", 0.2)
    .style("filter", "url(#glow)");

  legendsList
    .selectAll("text")
    .attr("fill", (d) => color(d))
    .style("filter", "url(#glow)");

  paths
    .exit()
    .transition()
    .duration(2000)
    .attrTween("d", arcExitTween)
    .remove();

  paths
    .attr("d", arcPath)
    .transition()
    .duration(2000)
    .attrTween("d", arcUpdateTween);

  paths
    .enter()
    .append("path")
    .attr("class", "arc")
    .attr("stroke", (d) => color(d.data.name))
    .attr("stroke-width", 3)
    .attr("fill", (d) => color(d.data.name))
    .attr("fill-opacity", 0.2)
    .style("filter", "url(#glow)")
    .each(function (d) {
      this.currentData = d;
    })
    .transition()
    .duration(2000)
    .attrTween("d", arcEnterTween);
};

let data = [];

db.collection("expenses").onSnapshot((res) => {
  res.docChanges().forEach((change) => {
    const doc = { ...change.doc.data(), id: change.doc.id };

    switch (change.type) {
      case "added":
        data.push(doc);
        break;

      case "modified":
        const idx = data.findIndex((item) => item.id === doc.id);
        data[idx] = doc;
        break;

      case "removed":
        data = data.filter((item) => item.id !== doc.id);
        break;

      default:
        break;
    }
  });
  update(data);
});

const arcEnterTween = (d) => {
  let int = d3.interpolate(d.endAngle, d.startAngle);

  return function (tick) {
    d.startAngle = int(tick);
    return arcPath(d);
  };
};

const arcExitTween = (d) => {
  let int = d3.interpolate(d.startAngle, d.endAngle);

  return function (tick) {
    d.startAngle = int(tick);
    return arcPath(d);
  };
};

function arcUpdateTween(d) {
  let itp = d3.interpolate(this.currentData, d);

  this.currentData = d;

  return function (tick) {
    return arcPath(itp(tick));
  };
}
