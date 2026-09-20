// Overpass API — free, public endpoint for querying OpenStreetMap data.
// No API key needed, but it's a shared community resource: keep queries
// narrow and don't hammer it with requests.
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// Bounding box for central Chania: [south, west, north, east]
// Overpass wants these four corners to limit the search area.
const CHANIA_BBOX = [35.495, 23.99, 35.53, 24.04];

// Maps OSM's raw tag values to the friendlier category names we display.
// OSM uses 'amenity' for services and 'shop' for retail.
const CATEGORY_LABELS = {
  restaurant: "Restaurant",
  cafe: "Cafe",
  bar: "Bar",
  bakery: "Bakery",
  pharmacy: "Pharmacy",
  supermarket: "Supermarket",
};

export async function fetchChaniaBusinesses() {
  const [south, west, north, east] = CHANIA_BBOX;
  const bbox = `${south},${west},${north},${east}`;

  // Overpass QL:
  //   [out:json]     — return JSON instead of XML
  //   [timeout:25]   — give up after 25 seconds
  //   node[...]      — find map points carrying these tags
  //   out body;      — return the full data for each match
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="restaurant"](${bbox});
      node["amenity"="cafe"](${bbox});
      node["amenity"="bar"](${bbox});
      node["amenity"="pharmacy"](${bbox});
      node["shop"="bakery"](${bbox});
      node["shop"="supermarket"](${bbox});
    );
    out body;
  `;

  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    body: query, // Overpass accepts the raw query as the POST body
  });

  if (!response.ok) {
    throw new Error(`Overpass request failed: ${response.status}`);
  }

  const data = await response.json();

  // Reshape OSM's format into the same shape our components already expect,
  // so nothing downstream has to change.
  return data.elements
    .filter((el) => el.tags?.name) // skip unnamed points — nothing to display
    .map((el) => {
      const rawCategory = el.tags.amenity || el.tags.shop;
      return {
        id: el.id,
        name: el.tags.name,
        category: CATEGORY_LABELS[rawCategory] || "Other",
        // OSM splits addresses across tags; join what's available
        address:
          [el.tags["addr:street"], el.tags["addr:housenumber"]]
            .filter(Boolean)
            .join(" ") || "Address not listed",
        coords: [el.lat, el.lon],
        phone: el.tags.phone || el.tags["contact:phone"] || null,
        website: el.tags.website || el.tags["contact:website"] || null,
        hours: el.tags.opening_hours || null,
      };
    });
}
