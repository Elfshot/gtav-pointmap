import "./css/style.css";
import "./css/leaflet@1.7.1.css";
import "./contzoom";
import * as L from "leaflet";
import plot from "./plot";

L.CRS.Kebab = L.extend({}, L.CRS.Simple, {
  projection: {
    project: latlng => new L.Point(latlng.lat, latlng.lng),
    unproject: point => new L.LatLng(point.x, point.y),
    bounds: new L.Bounds([-180, -90], [180, 90])
  },
  transformation: new L.Transformation(
    0.005175,
    34.38,
    -0.005173,
    46.79355),
});

const div_map = document.getElementById("map");
div_map.style.height = window.innerHeight + "px";
window.onresize = () => {
  div_map.style.height = window.innerHeight + "px";
};

const map = L.map("map", {
  renderer: L.canvas(),
  zoomControl: false,
  zooms: [1,2,3,4,5,6,7,8,9],
  minZoom : 1,
  maxZoom : 8,
  fadeAnimation: true,
  zoomAnimation: true,
  crs: L.CRS.Kebab
}).setView([0,0], 5);

L.control.zoom({
  position: "topright"
}).addTo(map);

L.tileLayer("images/maps/color-mode-tiles/{z}_{x}_{y}.jpg",{
  tileSize: 288,
  nativeZooms: [3,4,5,6,7],
  noWrap: true,
  bounds: [{ lat: -6566, lng: -4735 }, { lat: 7166, lng: 8906 }],
  reuseTiles : true
}).addTo(map);

window.map = map;


plot();