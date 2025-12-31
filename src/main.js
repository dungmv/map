import "./style.css";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

const mapEl = document.getElementById("map");

// Set the options for loading the API.
setOptions({ key: "AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg" });
await importLibrary("maps");
await importLibrary("marker");
await importLibrary("geometry");

let polylineTracking = null;
const loading = document.getElementById("loading");

const map = new google.maps.Map(mapEl, {
  zoom: 15,
  center: { lat: 21.036809, lng: 105.782771 },
  mapTypeId: google.maps.MapTypeId.ROADMAP,
  mapId: "DEMO_MAP_ID",
});

const startImg = new google.maps.marker.PinElement({
  glyphColor: "white",
  background: "green",
  borderColor: "black",
});
const startMarker = new google.maps.marker.AdvancedMarkerElement({
  title: "Điểm đón khách",
  position: { lat: 21.029245, lng: 105.777964 },
});
startMarker.append(startImg);

const endMarker = new google.maps.marker.AdvancedMarkerElement({
  title: "Điểm trả",
  position: { lat: 21.036809, lng: 105.782771 },
});

const infoWindow = new google.maps.InfoWindow({
  size: new google.maps.Size(360, 180),
});

function drawTracking(encodedPolyline, startPoint, endPoint, distance) {
  clearMap();
  startMarker.position = startPoint;
  endMarker.position = endPoint;
  startMarker.setMap(map);
  endMarker.setMap(map);

  // Decode the polyline
  const decodedPath = google.maps.geometry.encoding.decodePath(encodedPolyline);

  polylineTracking = new google.maps.Polyline({
    path: decodedPath,
    geodesic: true,
    strokeColor: "blue",
    strokeOpacity: 1,
    strokeWeight: 4,
  });

  polylineTracking.setMap(map);

  // set center map
  const centerPoint = new google.maps.LatLng(
    parseFloat((startPoint.lat() + endPoint.lat()) / 2),
    parseFloat((startPoint.lng() + endPoint.lng()) / 2),
  );
  map.setCenter(centerPoint);

  const bounds = new google.maps.LatLngBounds();
  bounds.extend(startPoint);
  bounds.extend(endPoint);
  map.fitBounds(bounds);

  infoWindow.setContent(distance);
  infoWindow.setPosition(centerPoint);
  infoWindow.open(map);
}

function clearMap() {
  startMarker.setMap(null);
  startMarker.setMap(null);
  if (polylineTracking) polylineTracking.setMap(null);
  polylineTracking = null;
}

/**
 *
 * @param {string} point
 * @returns
 */
function toLatLng(point) {
  const latlng = point.split(",");
  return new google.maps.LatLng(parseFloat(latlng[0]), parseFloat(latlng[1]));
}

document.getElementById("btn_search").addEventListener("click", function () {
  loading.style.display = "flex";
  const mapUrl = document.getElementById("map-url").value;
  const origin = document.getElementById("origin").value.replace(/\s+/g, "");
  const waypoints = document.getElementById("waypoints").value.replace(/\s+/g, "");
  const destination = document.getElementById("destination").value.replace(/\s+/g, "");

  const url = new URL(`${mapUrl}/maps/api/directions/json`);
  url.searchParams.append("origin", origin);
  url.searchParams.append("destination", destination);
  url.searchParams.append("waypoints", waypoints);

  fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((response) => {
      const startPoint = toLatLng(origin);
      const endPoint = toLatLng(destination);

      const polyline = response.routes[0].overview_polyline.points;
      const distance = response.routes[0].legs[0].distance.text;
      drawTracking(polyline, startPoint, endPoint, distance);
      // render route choices into #routes
      const routesDiv = document.getElementById("routes");
      // clear previous entries
      routesDiv.innerHTML = "";
      routesDiv.style.display = "block";

      response.routes.forEach((route, idx) => {
        const id = Math.random().toString(36).slice(2, 9);
        const wrapper = document.createElement("div");
        wrapper.className = "flex items-center space-x-2";

        const input = document.createElement("input");
        input.type = "radio";
        input.id = id;
        input.name = "route";
        input.value = idx;
        input.className = "w-4 h-4";
        if (idx === 0) input.checked = true; // default first

        const label = document.createElement("label");
        label.htmlFor = id;
        label.className = "text-sm font-medium cursor-pointer";
        // use route.summary if available, otherwise fall back to index
        label.textContent =
          `${route.summary} | ${route.legs[0].distance.text}, ${route.legs[0].duration.text}` || `Route ${idx + 1}`;

        wrapper.appendChild(input);
        wrapper.appendChild(label);
        routesDiv.appendChild(wrapper);

        // when radio selection changes, redraw that route
        input.addEventListener("change", () => {
          if (input.checked) {
            const poly = route.overview_polyline && route.overview_polyline.points;
            const dist = route.legs && route.legs[0] && route.legs[0].distance && route.legs[0].distance.text;
            if (poly) {
              drawTracking(poly, startPoint, endPoint, dist || "");
            }
          }
        });
      });
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      loading.style.display = "none";
    });
});

map.addListener("click", function (event) {
  const lat = event.latLng.lat();
  const lng = event.latLng.lng();
  let marker = null;
  let input = null;
  if (!startMarker.map) {
    marker = startMarker;
    input = document.getElementById("origin");
  } else if (!endMarker.map) {
    marker = endMarker;
    input = document.getElementById("destination");
  }

  if (marker) {
    marker.map = map;
    marker.position = event.latLng;
    input.value = `${lat},${lng}`;
    marker.addListener("click", function () {
      marker.map = null; // Remove marker when clicked
      input.value = ""; // Clear the input field
    });
  }
});
