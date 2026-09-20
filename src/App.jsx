import { useState, useEffect } from "react";
import "./utils/fixLeafletIcons"; //side-effect import - fixes broken marker icons
import { fetchChaniaBusinesses } from "./api/overpass";
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
import { getDistanceKm, formatDistance } from "./utils/distance";

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

  // Businesses fetched from Overpass. Starts empty, fills after the request
  const [businesses, setBusinesses] = useState([]);

  // True while the request is in flight - used to show a loading message
  const [isLoading, setIsLoading] = useState(true);

  // Holds an error message if the fetch fails
  const [fetchError, setFetchError] = useState(null);

  // Fetch Businesses once when the component first mounts.
  //The empty dependency array [] means "run this only on mount"
  useEffect(() => {
    fetchChaniaBusinesses()
      .then((data) => {
        setBusinesses(data);
        setFetchError(null);
      })
      .catch((error) => {
        setFetchError("Could not load businesses: " + error.message);
      })
      //Finaly runs wheter the request succeeded of failed
      .finally(() => setIsLoading(false));
  }, []);

  // Build the button list from the data itself, so adding a new category
  // to businesses.js automatically add a button - no manual updating.
  // Set removes duplicates; spreading it back into an array lets up map over it.
  const categories = ["All", ...new Set(businesses.map((b) => b.category))];

  //Filter the businesses down to ones mathcing the search term.
  // toLowerCase() on both sides makes the search case-insensitive.
  // We check name, category and address so any of them can match

  const filterBusinesses = businesses
    .filter((business) => {
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
    })
    //Attach a distance to each business. Spread copies the original fields
    // so we dont mutate the source data in businesses.js
    .map((business) => ({
      ...business,
      distance: userLocation
        ? getDistanceKm(userLocation, business.coords)
        : null, // no location yet - no distance to show
    }))
    // Sort nearest first, but only once we actually have the user's location
    .sort((a, b) => {
      if (a.distance === null || b.distance === null) return 0;
      return a.distance - b.distance;
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
          {isLoading && <p className="list-message">Loading businesses...</p>}
          {fetchError && <p className="list-message error">{fetchError}</p>}
          {/* Only show "no results" once loading has finishe */}
          {!isLoading && !fetchError && filterBusinesses.length === 0 && (
            <p className="list-message">No businesses match your search</p>
          )}

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
              {/* Only shows once the user has shared their location */}
              {business.distance !== null && (
                <p className="distance">
                  {formatDistance(business.distance)} away
                </p>
              )}
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
