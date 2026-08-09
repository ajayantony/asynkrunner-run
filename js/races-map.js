const halfStates     = new Set(["NY","MA","DE","AZ","NC","CO","CT","FL","UT","TX","OK","PA","RI","CA"]);
const marathonStates = new Set(["NY","VT"]);

const stateRaces = {
  NY: {
    half:     ["Rochester Half","United Airlines NYC Half","Flower City Half","Buffalo Half","Gorges Ithaca Half","Shoreline Half ★ PR","Syracuse Half"],
    marathon: ["Wineglass Marathon"],
  },
  VT: { marathon: ["Vermont City Marathon"] },
  MA: { half: ["Cambridge Half Marathon"] },
  DE: { half: ["Rehoboth Beach Half"] },
  AZ: { half: ["Saguaro Half Marathon"] },
  NC: { half: ["Coast Guard Half"] },
  CO: { half: ["Boulder Rez Half Marathon"] },
  CT: { half: ["New Haven Road Race"] },
  FL: { half: ["Space Coast Half Marathon"] },
  UT: { half: ["Zion Ultras & Trail Half"] },
  TX: { half: ["Dragons Den Half Marathon"] },
  OK: { half: ["Williams Route 66 Half"] },
  PA: { half: ["BIH Half Marathon (Bird in Hand)"] },
  RI: { half: ["Amica Newport Half Marathon"] },
  CA: { half: ["Napa to Sonoma Half Marathon"] },
};

const COLORS = {
  half:     "#4da8da",
  marathon: "#f0884a",
  both:     "#3dba7e",
  none:     "#2d3b50",
  ocean:    "#141e2c",
};

function getStateColor(abbr) {
  const h = halfStates.has(abbr), m = marathonStates.has(abbr);
  if (h && m) return COLORS.both;
  if (h)      return COLORS.half;
  if (m)      return COLORS.marathon;
  return COLORS.none;
}

const fipsToAbbr = {
  "01":"AL","02":"AK","04":"AZ","05":"AR","06":"CA",
  "08":"CO","09":"CT","10":"DE","11":"DC","12":"FL",
  "13":"GA","15":"HI","16":"ID","17":"IL","18":"IN",
  "19":"IA","20":"KS","21":"KY","22":"LA","23":"ME",
  "24":"MD","25":"MA","26":"MI","27":"MN","28":"MS",
  "29":"MO","30":"MT","31":"NE","32":"NV","33":"NH",
  "34":"NJ","35":"NM","36":"NY","37":"NC","38":"ND",
  "39":"OH","40":"OK","41":"OR","42":"PA","44":"RI",
  "45":"SC","46":"SD","47":"TN","48":"TX","49":"UT",
  "50":"VT","51":"VA","53":"WA","54":"WV","55":"WI",
  "56":"WY"
};

// Small NE states get external leader-line labels
const externalLabels = {
  MA: { lx: 928, ly: 132 },
  RI: { lx: 928, ly: 155 },
  CT: { lx: 928, ly: 178 },
  DE: { lx: 928, ly: 210 },
};

// States where path.centroid() lands in a bad spot
const labelOffsets = {
  FL: { dx: 20, dy: 40 },
};

const width = 960, height = 580;

const svg = d3.select("#us-map")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet");

const defs = svg.append("defs");
const filter = defs.append("filter")
  .attr("id", "state-shadow")
  .attr("x", "-30%").attr("y", "-30%")
  .attr("width", "160%").attr("height", "160%");
filter.append("feDropShadow")
  .attr("dx", 0).attr("dy", 3)
  .attr("stdDeviation", 5)
  .attr("flood-color", "rgba(0,0,0,0.55)");

svg.append("rect")
  .attr("width", width).attr("height", height)
  .attr("fill", COLORS.ocean).attr("rx", 14);

const projection = d3.geoAlbersUsa()
  .scale(1280).translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);

const tooltip = d3.select("body").append("div").attr("class", "map-tooltip");

d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3.0.1/states-10m.json")
  .catch(() => { document.getElementById("us-map-container").textContent = "Map could not be loaded."; })
  .then(us => { if (!us) return;
  const states = topojson.feature(us, us.objects.states).features;

  // Unvisited states
  svg.append("g").selectAll("path")
    .data(states.filter(d => {
      const a = fipsToAbbr[String(d.id).padStart(2,"0")];
      return !halfStates.has(a) && !marathonStates.has(a);
    }))
    .join("path").attr("d", path)
    .attr("fill", COLORS.none).attr("stroke","#1a2840").attr("stroke-width", 0.6)
    .on("mouseover", function(event, d) {
      const abbr = fipsToAbbr[String(d.id).padStart(2,"0")];
      tooltip.html("");
      tooltip.append("div").attr("class","tt-state").text(abbr);
      tooltip.style("opacity",1)
        .style("left",(event.clientX+14)+"px")
        .style("top",(event.clientY-44)+"px");
      d3.select(this).attr("stroke-width", 2).attr("stroke","#4a5a70");
    })
    .on("mousemove", function(event) {
      tooltip.style("left",(event.clientX+14)+"px").style("top",(event.clientY-44)+"px");
    })
    .on("mouseout", function() {
      tooltip.style("opacity",0);
      d3.select(this).attr("stroke-width",0.6).attr("stroke","#1a2840");
    });

  // Highlighted states
  svg.append("g").selectAll("path")
    .data(states.filter(d => {
      const a = fipsToAbbr[String(d.id).padStart(2,"0")];
      return halfStates.has(a) || marathonStates.has(a);
    }))
    .join("path").attr("d", path)
    .attr("fill", d => getStateColor(fipsToAbbr[String(d.id).padStart(2,"0")]))
    .attr("stroke","#fff").attr("stroke-width", 1)
    .attr("filter","url(#state-shadow)")
    .on("mouseover", function(event, d) {
      const abbr = fipsToAbbr[String(d.id).padStart(2,"0")];
      const data = stateRaces[abbr] || {};
      const h = halfStates.has(abbr), m = marathonStates.has(abbr);
      const both = h && m;
      // Build tooltip using DOM methods (avoids innerHTML/XSS risk)
      tooltip.html(""); // clear
      tooltip.append("div").attr("class","tt-state").text(abbr);
      if (both) {
        if (data.marathon?.length) {
          tooltip.append("div").attr("class","tt-section tt-section--marathon").text("Full Marathon");
          data.marathon.forEach(r => tooltip.append("div").attr("class","tt-race").text(r));
        }
        if (data.half?.length) {
          tooltip.append("div").attr("class","tt-section tt-section--half").text("Half Marathons");
          data.half.forEach(r => tooltip.append("div").attr("class","tt-race").text(r));
        }
      } else if (m && data.marathon?.length) {
        data.marathon.forEach(r => tooltip.append("div").attr("class","tt-race").text(r));
      } else if (h && data.half?.length) {
        data.half.forEach(r => tooltip.append("div").attr("class","tt-race").text(r));
      }
      tooltip.style("opacity",1)
        .style("left",(event.clientX+14)+"px")
        .style("top",(event.clientY-44)+"px");
      d3.select(this).attr("stroke-width", 2.5);
    })
    .on("mousemove", function(event) {
      tooltip.style("left",(event.clientX+14)+"px").style("top",(event.clientY-44)+"px");
    })
    .on("mouseout", function() {
      tooltip.style("opacity",0);
      d3.select(this).attr("stroke-width",1);
    });

  // Border mesh
  svg.append("path")
    .datum(topojson.mesh(us, us.objects.states, (a,b) => a !== b))
    .attr("fill","none").attr("stroke","#1a2840").attr("stroke-width",0.6).attr("d",path);

  const labelGroup = svg.append("g").attr("pointer-events","none");

  // Internal labels
  states.filter(d => {
    const a = fipsToAbbr[String(d.id).padStart(2,"0")];
    return (halfStates.has(a)||marathonStates.has(a)) && !externalLabels[a];
  }).forEach(d => {
    const abbr = fipsToAbbr[String(d.id).padStart(2,"0")];
    const [cx,cy] = path.centroid(d);
    const off = labelOffsets[abbr] || {dx:0,dy:0};
    labelGroup.append("text")
      .attr("x",cx+off.dx).attr("y",cy+off.dy)
      .attr("text-anchor","middle").attr("dominant-baseline","central")
      .attr("font-size","12").attr("font-family","Inter,system-ui,sans-serif")
      .attr("font-weight","800").attr("fill","#fff")
      .attr("paint-order","stroke").attr("stroke","rgba(0,0,0,0.4)")
      .attr("stroke-width","3").attr("stroke-linejoin","round")
      .text(abbr);
  });

  // External leader-line labels
  states.filter(d => {
    const a = fipsToAbbr[String(d.id).padStart(2,"0")];
    return externalLabels[a] && (halfStates.has(a)||marathonStates.has(a));
  }).forEach(d => {
    const abbr = fipsToAbbr[String(d.id).padStart(2,"0")];
    const [cx,cy] = path.centroid(d);
    const {lx,ly} = externalLabels[abbr];
    const elbowX = lx - 52;
    labelGroup.append("polyline")
      .attr("points",`${cx},${cy} ${elbowX},${cy} ${elbowX},${ly} ${lx-8},${ly}`)
      .attr("fill","none").attr("stroke","rgba(255,255,255,0.55)").attr("stroke-width",1);
    labelGroup.append("circle")
      .attr("cx",cx).attr("cy",cy).attr("r",3).attr("fill","#fff").attr("opacity",0.9);
    labelGroup.append("text")
      .attr("x",lx).attr("y",ly)
      .attr("text-anchor","start").attr("dominant-baseline","central")
      .attr("font-size","12").attr("font-family","Inter,system-ui,sans-serif")
      .attr("font-weight","800").attr("fill","#fff")
      .attr("paint-order","stroke").attr("stroke","rgba(0,0,0,0.4)")
      .attr("stroke-width","3").attr("stroke-linejoin","round")
      .text(abbr);
  });
});
