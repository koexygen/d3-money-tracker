const dims = { width: 330, height: 330, radius: 165 };
const center = { x: dims.width / 2 + 5, y: dims.height / 2 + 5 };

const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", dims.width + 50)
  .attr("height", dims.height + 50);

const graph = svg
  .append("g")
  .attr("transform", `translate(${center.x}, ${center.y})`);

const pie = d3.pie().value((d) => d.cost);

const arcPath = d3
  .arc()
  .outerRadius(dims.radius)
  .innerRadius(dims.radius / 2);

const color = d3.scaleOrdinal(d3["schemeSet3"]);

const update = (data) => {
  const paths = graph.selectAll("path").data(pie(data));
  color.domain(data.map((x) => x.name));
  paths.exit().remove();

  paths
    .attr("class", "arc")
    .attr("stroke", "#424242")
    .attr("stroke-width", 3)
    .attr("fill", (d) => color(d.data.name))
    .transition()
    .duration(1000)
    .attrTween("d", arcTween);

  paths
    .enter()
    .append("path")
    .attr("class", "arc")
    .attr("stroke", "#424242")
    .attr("stroke-width", 3)
    .attr("fill", (d) => color(d.data.name))
    .transition()
    .duration(1000)
    .attrTween("d", arcTween);
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

const arcTween = (d) => {
  const int = d3.interpolate(d.endAngle, d.startAngle);

  return function (tick) {
    d.startAngle = int(tick);
    return arcPath(d);
  };
};
