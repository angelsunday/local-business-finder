import { businesses } from "./data/businesses";
import { MapContainer, TileLayer } from "react-leaflet";
import "./App.css";

// Center the map on Chania, Crete [latitude, longitude]
const CHANIA_CENTER = [35.5138, 24.018];

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Chania Business Finder</h1>
      </header>

      <div className="search-bar">
        <input type="text" placeholder="Search businesses..." />
      </div>

      <main className="app-main">
        <section className="business-list">
          {/* Loop over each business and render a card. */}
          {/* key is required by React so it can track list items efficiently */}

          {businesses.map((business) => (
            <article key={business.id} className="business-card">
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
          </MapContainer>
        </section>
      </main>
    </div>
  );
}

export default App;
