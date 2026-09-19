// Leaflet's default marker icons break with bundlers like Vite.
// We delete Leaflet's internal path-guessing method first, otherwise it
// prepends its own base path to our imported URLs and doubles them up.
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Remove Leaflet's automatic icon-path detection
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});
