const width = 960,
      height = 960;

const detailsDiv = document.getElementsByClassName('details')[0];
const defaultDetails = `<p>Hover over a country.</p>`

// set up
detailsDiv.innerHTML = defaultDetails;

const projection = d3.geo.mercator()
  .scale((width + 1) / 2 / Math.PI)
  .translate([width / 2, height / 2])
  .precision(.1);

const path = d3.geo.path().projection(projection);
const graticule = d3.geo.graticule();

const svg = d3.select('body')
  .append('svg')
  .attr({ width, height })
  .append('g');
  
const filter = svg.append('defs')
  .append('filter')
  .attr({
    'x': 0,
    'y': 0,
    'width': 1,
    'height': 1,
    'id': 'gray-background'
  });

filter.append('feFlood')
  .attr('flood-color', '#f2f2f2')
  .attr('result', 'COLOR');

d3.json('data.json', (error, data) => {
  if (error) return console.error(error);
  draw(data)
});


const draw = (data) => {
  d3.json('world.json', (error, world) => {
    if (error) return console.error(error);
    processWorld(world, data);
  });
}

const processWorld = (world, data) => {
  const worldMapBuckets = data.aggregations.world_map.buckets;
  for (let idx = 0; idx < worldMapBuckets.length; idx++) {
    const cCode = worldMapBuckets[idx].key.toUpperCase();
    const freedom = worldMapBuckets[idx].freedom;
    const geometries = world.objects.subunits.geometries;
    for (let wdx = 0; wdx < geometries.length; wdx++) {
      const cName = geometries[wdx].id.toUpperCase();
      if (cCode === cName) {
        geometries[wdx].properties.freedom = freedom;
      }
    }
  }
  const subunits = topojson.feature(world, world.objects.subunits);
  let freedoms = subunits.features.map((d) => d.properties.freedom);
  freedoms = freedoms.filter((d) => d).sort(d3.ascending);
  const countries = svg.selectAll('path.subunit')
    .data(subunits.features).enter();
  countries.insert('path', '.graticule')
    .attr('class', (d) => 'subunit ca' + d.id)
    .style('fill', heatColor)
    .attr('d', path)
    .on('mouseover', mouseoverHandler).on('mouseout', mouseoutHandler)

  countries.append('svg:text')
    .attr('class', (d) => 'subunit-label la' + d.id + d.properties.name.replace(/[ \.#']+/g, ''))
    .attr('transform', (d) => 'translate(' + (width - (5 * d.properties.name.length)) + ',' + (15) + ')')
    .attr('dy', '.35em')
    .attr('filter', 'url(#gray-background)')
    .append('svg:tspan')
    .attr('x', 0)
    .attr('dy', 5)
    .text((d) => d.properties.name)
    .append('svg:tspan')
    .attr('x', 0)
    .attr('dy', 20)
    .text((d) => d.properties.freedom ? d.properties.freedom : '');
}

mouseoverHandler = ({ properties: {name, freedom} }) => {
  detailsDiv.innerHTML = `
    <p class="details--name">${name}</p>
    <p class="details--freedom">Freedom: <b>${freedom}</b></p>
  `
}

mouseoutHandler = () => {
  detailsDiv.innerHTML = defaultDetails;
}

heatColor = (d) => {
  const num = d.properties.freedom * 100;
  return `hsl(100, 100%, ${num}%)`;
}