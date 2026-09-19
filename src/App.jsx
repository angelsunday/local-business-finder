import { useState, useEffect } from "react";
import "./utils/fixLeafletIcons"; //side-effect import - fixes broken marker icons
import { businesses } from "./data/businesses";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Circle,
} from "react-leaflet";
import "./App.css";
import BusinessDetail from "./components/BusinessDetail";

// Center the map on Chania, Crete [latitude, longitude]
const CHANIA_CENTER = [35.5138, 24.018];

//Helper component that must live inside <MapContainer> to use the useMap hook.
// Whenever the 'center' changes, it smoothly moves the map to that position.

function MapController({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, 16); //16 = zoom level, closer than the default 14.
    }
    // Dependency array: re-run only if center or map changes.
    // center is an array, so we pass its values individually -
    // otherwise React sees a "new" array every render and re-runs endlessly.
  }, [center?.[0], center?.[1], map]);

  return null; //renders nothing - it exists purely for the side effect
}

function App() {
  //Holds whatever the user has typed into the search box.
  const [searchTerm, setSearchTerm] = useState("");
  // Which category is currently selected. 'All' means no category filter.
  const [selectedCategory, setSelectedCategory] = useState("All");

  //The business the user last clicked - used to pan the map
  const [activeBusiness, setActiveBusiness] = useState(null);

  // The user;s coordinates once they grant permission, otherwise null
  const [userLocation, setUserLocation] = useState(null);

  //Error message if location fails or is denied - shown to the user
  const [locationError, setLocationError] = useState(null);

  // Build the button list from the data itself, so adding a new category
  // to businesses.js automatically add a button - no manual updating.
  // Set removes duplicates; spreading it back into an array lets up map over it.
  const categories = ["All", ...new Set(businesses.map((b) => b.category))];

  //Filter the businesses down to ones mathcing the search term.
  // toLowerCase() on both sides makes the search case-insensitive.
  // We check name, category and address so any of them can match

  const filterBusinesses = businesses.filter((business) => {
    const term = searchTerm.toLowerCase();
    //Does it match what was typed?
    const matchesSearch =
      business.name.toLowerCase().includes(term) ||
      business.category.toLowerCase().includes(term) ||
      business.address.toLowerCase().includes(term);

    //Does it match the selected category? 'All' always passes.
    const matchesCategory =
      selectedCategory === "All" || business.category === selectedCategory;

    //must satisfy both filiters to show up
    return matchesSearch && matchesCategory;
  });
  //Ask the browser for the user's location
  //This triggers the browser's own permmission prompt the first time.
  function findMyLocation() {
    //navigator.geolocation doesn't exist in very old or non-secure contexts
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      // Success callback - receives a position object
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]); //Leaflet wants[lat, lng]
      },
      //Error callback -  most commonly the user denying permission
      (error) => {
        setLocationError("Could not get your location: " + error.message);
      },
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Chania Business Finder</h1>
      </header>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search businesses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // update state on every keystroke
        />
      </div>

      <div className="category-filters">
        {categories.map((category) => (
          <button
            key={category}
            // 'active' class highlights the currently selected button.
            className={selectedCategory === category ? "active" : ""}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="location-bar">
        <button onClick={findMyLocation}>Find businesses near me</button>
        {/* Only renders the error paragraph if there is one */}
        {locationError && <p className="location-error">{locationError}</p>}
      </div>

      <main className="app-main">
        <section className="business-list">
          {/* Loop over each business and render a card. */}
          {/* key is required by React so it can track list items efficiently */}

          {filterBusinesses.map((business) => (
            <article
              key={business.id}
              className="business-card"
              onClick={() => setActiveBusiness(business)} //when clicked, set this business as the active one
            >
              {/* Display the business info */}
              <h2>{business.name}</h2>
              <p className="category">{business.category}</p>
              <p className="adreess">{business.address}</p>
            </article>
          ))}
        </section>

        <section className="map-container">
          {/* center= where the map opens, zoom = how close in (higher = closer)*/}
          <MapContainer center={CHANIA_CENTER} zoom={14} className="map">
            {/* TileLayer = the actual map images. This one is free OpenStreetMap */}
            {/* attribution is required by OSM's licence - dont remove it!*/}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            <MapController center={activeBusiness?.coords || userLocation} />
            {/* One marker per business, potitioned by its coords */}
            {filterBusinesses.map((business) => (
              <Marker key={business.id} position={business.coords}>
                {/* Popup opens when the marker is clicked */}
                <Popup>
                  <strong>{business.name}</strong>
                  <br />
                  {business.category}
                  <br />
                  {business.address}
                </Popup>
              </Marker>
            ))}

            {/* Blue dot showing the user's own position - only if we have it */}
            {userLocation && (
              <Circle
                center={userLocation}
                radius={50} //metres - scales with the map's zoom
                pathOptions={{
                  color: "#1a73e8",
                  fillColor: "#1a73e8",
                  fillOpacity: 0.5,
                }}
              >
                <Popup>You are here</Popup>
              </Circle>
            )}
          </MapContainer>
        </section>

        {/* Detail panel - only renders when a business is selected */}
        <BusinessDetail
          business={activeBusiness}
          onClose={() => setActiveBusiness(null)}
        />
      </main>
    </div>
  );
}

export default App;
