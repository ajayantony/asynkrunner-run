const peaks = [
  {
    name:       "Spruce Peak",
    type:       "summit",
    location:   "Stowe, VT",
    lat:        44.473,
    lng:        -72.719,
    elevation:  "3,339 ft",
    gain:       "1,512 ft",
    difficulty: "Hard",
    date:       "May 11, 2024",
    companion:  "Friends",
    alltrails:  "https://www.alltrails.com/trail/us/vermont/spruce-peak-via-sterling-trail",
  },
  {
    name:       "Eternal Flame Falls",
    type:       "hike",
    location:   "Orchard Park, NY",
    lat:        42.703,
    lng:        -78.748,
    elevation:  null,
    gain:       null,
    difficulty: "Moderate",
    date:       "May 25, 2024",
    companion:  "Family",
    alltrails:  "https://www.alltrails.com/trail/us/new-york/eternal-flame-falls-trail",
  },
  {
    name:       "First & Second Flatiron",
    type:       "summit",
    location:   "Boulder, CO",
    lat:        39.984,
    lng:        -105.294,
    elevation:  "7,100 ft",
    gain:       "1,391 ft",
    difficulty: "Hard",
    date:       "Aug 4, 2024",
    companion:  "Wife",
    alltrails:  "https://www.alltrails.com/trail/us/colorado/first-and-second-flatiron-loop",
  },
  {
    name:       "Perkins Central Garden Trail",
    type:       "hike",
    location:   "Colorado Springs, CO",
    lat:        38.878,
    lng:        -104.870,
    elevation:  null,
    gain:       null,
    difficulty: "Easy",
    date:       "Aug 4, 2024",
    companion:  "Family",
    alltrails:  "https://www.alltrails.com/trail/us/colorado/perkins-central-garden-trail",
  },
  {
    name:       "Canyon Overlook Trail",
    type:       "hike",
    location:   "Zion, UT",
    lat:        37.213,
    lng:        -112.941,
    elevation:  "5,257 ft",
    gain:       "194 ft",
    difficulty: "Easy",
    date:       "Apr 12, 2025",
    companion:  "Family",
    alltrails:  "https://www.alltrails.com/trail/us/utah/canyon-overlook-trail",
  },
  {
    name:       "Queens Garden & Navajo Loop",
    type:       "hike",
    location:   "Bryce Canyon, UT",
    lat:        37.623,
    lng:        -112.167,
    elevation:  "8,000 ft",
    gain:       "673 ft",
    difficulty: "Moderate",
    date:       "Apr 13, 2025",
    companion:  "Friends",
    alltrails:  "https://www.alltrails.com/trail/us/utah/navajo-loop-and-queens-garden-trail",
  },
  {
    name:       "Riverside Walk (Zion Narrows)",
    type:       "hike",
    location:   "Zion, UT",
    lat:        37.279,
    lng:        -112.948,
    elevation:  null,
    gain:       "151 ft",
    difficulty: "Easy",
    date:       "Apr 14, 2025",
    companion:  "Family",
    alltrails:  "https://www.alltrails.com/trail/us/utah/the-zion-narrows-riverside-walk",
  },
  {
    name:       "Pa'rus Trail",
    type:       "hike",
    location:   "Zion, UT",
    lat:        37.199,
    lng:        -112.988,
    elevation:  null,
    gain:       null,
    difficulty: "Easy",
    date:       "Apr 14, 2025",
    companion:  "Friends",
    alltrails:  "https://www.alltrails.com/trail/us/utah/parus-trail",
  },
  {
    name:       "Sentinel Dome Trail",
    type:       "summit",
    location:   "Yosemite, CA",
    lat:        37.723,
    lng:        -119.584,
    elevation:  "8,127 ft",
    gain:       "550 ft",
    difficulty: "Moderate",
    date:       "Jul 29, 2026",
    companion:  "Family",
    alltrails:  "https://www.alltrails.com/trail/us/california/sentinel-dome-trail",
  },
  {
    name:       "Grotto Falls via Trillium Gap Trail",
    type:       "hike",
    location:   "Gatlinburg, TN",
    lat:        35.680,
    lng:        -83.462,
    elevation:  null,
    gain:       "564 ft",
    difficulty: "Moderate",
    date:       "Aug 27, 2026",
    companion:  "Friends",
    alltrails:  "https://www.alltrails.com/trail/us/tennessee/grotto-falls-trail",
  },
  {
    name:       "Kuwohi Observation Tower Trail",
    type:       "state-highpoint",
    location:   "Great Smoky Mountains, TN",
    lat:        35.563,
    lng:        -83.499,
    elevation:  "6,643 ft",
    gain:       "318 ft",
    difficulty: "Moderate",
    date:       "Aug 29, 2026",
    companion:  "Friends",
    alltrails:  "https://www.alltrails.com/trail/us/north-carolina/clingmans-dome-observation-tower-trail",
  },
];

const COLORS = {
  summit:          "#f0884a",
  hike:            "#4da8da",
  "state-highpoint": "#3dba7e",
};

const ICONS = {
  summit:          "▲",
  hike:            "◉",
  "state-highpoint": "★",
};

const usBounds = L.latLngBounds([24.0, -125.5], [49.5, -66.5]);
const map = L.map("peaks-map", {
  maxBounds:          usBounds,
  maxBoundsViscosity: 1.0,
  minZoom:            4,
}).fitBounds(usBounds);

L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
  maxZoom:     19,
  attribution: '© <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics',
}).addTo(map);

const markerStore = {};

peaks.forEach(p => {
  const icon = L.divIcon({
    className: "",
    html: `<div class="peaks-marker peaks-marker--${p.type}" title="${p.name}"></div>`,
    iconSize:   [14, 14],
    iconAnchor: [7, 7],
  });

  const lines = [
    `<div class="pm-name">${p.name}</div>`,
    `<div class="pm-type pm-type--${p.type}">${p.type === "state-highpoint" ? "State High Point" : p.type.charAt(0).toUpperCase() + p.type.slice(1)}</div>`,
    `<div class="pm-loc">${p.location}</div>`,
    p.elevation ? `<div class="pm-detail"><span class="pm-label">Elevation</span> ${p.elevation}</div>` : "",
    p.gain      ? `<div class="pm-detail"><span class="pm-label">Gain</span> ${p.gain}</div>`      : "",
    `<div class="pm-detail"><span class="pm-label">Difficulty</span> ${p.difficulty}</div>`,
    `<div class="pm-detail"><span class="pm-label">Date</span> ${p.date}</div>`,
    p.companion ? `<div class="pm-detail"><span class="pm-label">With</span> ${p.companion}</div>` : "",
    p.alltrails ? `<div class="pm-detail" style="margin-top:0.4rem"><a href="${p.alltrails}" target="_blank" rel="noopener" style="color:#4da8da;font-weight:600;text-decoration:none;font-size:0.78rem">View on AllTrails →</a></div>` : "",
  ].filter(Boolean).join("");

  const marker = L.marker([p.lat, p.lng], { icon })
    .addTo(map)
    .bindPopup(`<div class="peaks-popup">${lines}</div>`, {
      maxWidth: 220,
      autoPanPadding: [20, 160],
    });

  markerStore[`${p.lat},${p.lng}`] = marker;
});

// Click-to-zoom: any element with data-lat / data-lng flies to that peak
document.querySelectorAll("[data-lat]").forEach(el => {
  el.addEventListener("click", () => {
    const lat    = parseFloat(el.dataset.lat);
    const lng    = parseFloat(el.dataset.lng);
    const marker = markerStore[`${lat},${lng}`];
    map.flyTo([lat + 0.012, lng], 14, { duration: 1.5 });
    if (marker) setTimeout(() => marker.openPopup(), 1300);
    document.getElementById("peaks-map").scrollIntoView({ behavior: "smooth", block: "center" });
  });
});
