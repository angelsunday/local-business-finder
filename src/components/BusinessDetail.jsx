// Deatail panel shown when a business is selected.
//receives the selected business and a function to close the panel
function BusinessDetail({ business, onClose }) {
  // Nothing selected - render nothing at all
  if (!business) return null;

  return (
    <aside className="business-detail">
      <button className="close-button" onClick={onClose}>
        X
      </button>

      <h2>{business.name}</h2>
      <p className="category">{business.category}</p>

      <dl>
        <dt>Address</dt>
        <dd>{business.address}</dd>

        {/* Each field only renders if OSM actually has the data for it */}
        {business.hours && (
          <>
            <dt>Hours</dt>
            <dd>{business.hours}</dd>
          </>
        )}

        {business.phone && (
          <>
            <dt>Phone</dt>
            {/* tel: link lets mobile users tap to call */}
            <dd>
              <a href={`tel:${business.phone}`}>{business.phone}</a>
            </dd>
          </>
        )}

        {business.website && (
          <>
            <dt>Website</dt>
            {/* noopener noreferrer is a security best practice for target="_blank" */}
            <dd>
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {business.website}
              </a>
            </dd>
          </>
        )}
      </dl>

      {/* Let the user know why the panel looks sparse */}
      {!business.hours && !business.phone && !business.website && (
        <p className="no-details">
          No further details listed in OpenStreetMap.
        </p>
      )}
    </aside>
  );
}

export default BusinessDetail;
