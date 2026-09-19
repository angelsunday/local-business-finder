import "./App.css";

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
          <p>Business list will go here</p>
        </section>

        <section className="map-container">
          <p>Map will go here</p>
        </section>
      </main>
    </div>
  );
}

export default App;
