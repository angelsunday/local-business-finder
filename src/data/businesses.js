//Sample business data - hardcoded for now, so we can build the UI
// Later we can swap this for real API or database
// coords are [latitude, longitude] - the format Leaflet expects.

export const businesses = [
  {
    id: 1,
    name: "Tamam Restaurant",
    category: "Restaurant",
    address: "Zampeliou 49, Chania",
    coords: [35.5156, 24.0175],
  },
  {
    id: 2,
    name: "Bougatsa Iordanis",
    category: "Cafe",
    address: "Apokoronou 24, Chania",
    coords: [35.5142, 24.0231],
  },
  {
    id: 3,
    name: "To Stachi",
    category: "Shop",
    address: "Dimokratias 5, Chania",
    coords: [35.5127, 24.0203],
  },
  {
    id: 4,
    name: "Koukouvaya",
    category: "Cafe",
    address: "Venizelos Graves, Chania",
    coords: [35.5063, 24.0089],
  },
];
