const dims = { width: 300, height: 300, radius: 150 };
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

const update = (data) => {
  const paths = graph.selectAll("path").data(pie(data));

  paths
    .attr("class", "arc")
    .attr("d", arcPath)
    .attr("stroke", "white")
    .attr("stroke-width", 2);

  paths
    .enter()
    .append("path")
    .attr("class", "arc")
    .attr("d", arcPath)
    .attr("stroke", "white")
    .attr("stroke-width", 2);
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
