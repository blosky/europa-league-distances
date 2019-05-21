import * as d3B from 'd3'
import * as d3geo from 'd3-geo'
import * as d3Select from 'd3-selection'	
import * as topojson from 'topojson'
import distancesRaw from 'raw-loader!./../assets/Europa League Data - Distance Travel.csv'
import eu28 from '../assets/eu28.json'

let d3 = Object.assign({}, d3B, d3Select, d3geo);


let svg = d3.select('.interactive-wrapper')
.append('svg')
.attr('width', 860)
.attr('height', 900)


const parsed = d3.csvParse(distancesRaw)
const distances = parsed;


console.log(distances)

let projection = d3.geoMercator()

let path = d3.geoPath()
.projection(projection)


projection.fitSize([860, 900], topojson.feature(eu28, eu28.objects.eu28));

let carto = svg.append('g').selectAll('path')
.data(topojson.feature(eu28, eu28.objects.eu28).features)
.enter()
.append('path')
.attr('d', path)


let stadiums = svg.append('g').selectAll('circle')
.data(distances)
.enter()
.append('circle')
.attr('r', 3)
.attr('fill', 'red')
.attr('cx', d => projection([+d.StadiumLat, +d.StadiumLong])[0] + 'px')
.attr('cy', d => projection([+d.StadiumLat, +d.StadiumLong])[1] + 'px')


let teams = svg.append('g').selectAll('circle')
.data(distances)
.enter()
.append('circle')
.attr('r', 3)
.attr('fill', 'green')
.attr('cx', d => projection([+d.TeamLat, +d.TeamLong])[0] + 'px')
.attr('cy', d => projection([+d.TeamLat, +d.TeamLong])[1] + 'px')

let paths = svg.append('g').selectAll('path')
.data(distances)
.enter()
.append('path')
.attr('class', 'line')
.attr('d', d => {
	let path = {"from":[],"to":[]}

	path.from[0] = d.TeamLat;
	path.from[1] = d.TeamLong;

	path.to[0] = d.StadiumLat;
	path.to[1] = d.StadiumLong;

	return lngLatToArc(path, 'from', 'to', 100)
})
.style('fill', 'none')
.style('stroke', 'yellow')


	function lngLatToArc(d, sourceName, targetName, bend){
		// If no bend is supplied, then do the plain square root
		bend = bend || 1;
		// `d[sourceName]` and `d[targetname]` are arrays of `[lng, lat]`
		// Note, people often put these in lat then lng, but mathematically we want x then y which is `lng,lat`

		var sourceLngLat = d[sourceName],
		targetLngLat = d[targetName];

		if (targetLngLat && sourceLngLat) {
			var sourceXY = projection( sourceLngLat ),
			targetXY = projection( targetLngLat );

			// Uncomment this for testing, useful to see if you have any null lng/lat values
			// if (!targetXY) console.log(d, targetLngLat, targetXY)
			var sourceX = sourceXY[0],
			sourceY = sourceXY[1];

			var targetX = targetXY[0],
			targetY = targetXY[1];

			var dx = targetX - sourceX,
			dy = targetY - sourceY,
			dr = Math.sqrt(dx * dx + dy * dy)*bend;

			// To avoid a whirlpool effect, make the bend direction consistent regardless of whether the source is east or west of the target
			var west_of_source = (targetX - sourceX) < 0;
			if (west_of_source) return "M" + targetX + "," + targetY + "A" + dr + "," + dr + " 0 0,1 " + sourceX + "," + sourceY;
			return "M" + sourceX + "," + sourceY + "A" + dr + "," + dr + " 0 0,1 " + targetX + "," + targetY;
			
		} else {
			return "M0,0,l0,0z";
		}
	}
