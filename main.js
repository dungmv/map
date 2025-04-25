
document.addEventListener("DOMContentLoaded", function() {
  let polylineTracking = null;
  const setMapOptions = {
    zoom: 15,
    center: new google.maps.LatLng(21.036809, 105.782771),
    gestureHandling: "greedy",
    styles: [
      {
        featureType: "transit",
        elementType: "labels.icon",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "transit.station",
        elementType: "geometry",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "poi.business",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "poi",
        elementType: "geometry",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "landscape.natural",
        elementType: "geometry",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "poi.business",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "poi.government",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "poi.medical",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "poi.park",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "poi.place_of_worship",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "poi.school",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "poi.sports_complex",
        stylers: [{ visibility: "off" }],
      },
    ],
    mapTypeId: google.maps.MapTypeId.ROADMAP,
  };

  const map = new google.maps.Map(
    document.getElementById("map"),
    setMapOptions
  );

  const circleSelectDevice = new google.maps.Circle({
    id: "circle_select_device_id",
    map: map,
    strokeColor: "#FF0000",
    strokeOpacity: 0.5,
    strokeWeight: 1,
    fillColor: "#AA0000",
    fillOpacity: 0.2,
    radius: 30,
  });

  circleSelectDevice.setMap(map);

  const startMarker = new google.maps.Marker({
    title: "Điểm đón khách",
    icon: "https://s3-ap-southeast-1.amazonaws.com/image-emd/defaults/map-marker-1-32x32.png",
  });

  const endMarker = new google.maps.Marker({
    title: "Điểm trả",
    icon: "https://s3-ap-southeast-1.amazonaws.com/image-emd/defaults/map-marker-2-32x32.png",
  });

  const infoWindow = new google.maps.InfoWindow({
    size: new google.maps.Size(360, 180),
  });

  function drawTracking(encodedPolyline, startPoint, endPoint, distance) {
    clearMap();
    startMarker.setPosition(startPoint);
    endMarker.setPosition(endPoint);
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
      parseFloat((startMarker.getPosition().lat() + endMarker.getPosition().lat()) / 2),
      parseFloat((startMarker.getPosition().lng() + endMarker.getPosition().lng()) / 2)
    );
    map.setCenter(centerPoint);

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(startMarker.getPosition());
    bounds.extend(endMarker.getPosition());
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
    return {
      lat: parseFloat(latlng[0]),
      lng: parseFloat(latlng[1]),
    };
  }

  function getJourney(appcode, origin, destination) {
    origin = origin.replace(/\s+/g, "");
    destination = destination.replace(/\s+/g, "");
    fetch(`http://localhost:8082/maps/api/directions/json?origin=${origin}&destination=${destination}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "App-Code": appcode,
      },
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
      })
      .catch((err) => {
        console.log(err);
      });
  }

  document.getElementById("btn_tracking").addEventListener("click", function () {
    const origin = document.getElementById("origin").value;
    const destination = document.getElementById("destination").value;
    const appcode = document.getElementById("app-code").value;

    getJourney(appcode, origin, destination);
  });

  map.addListener("click", function(event) {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    let marker = null;
    let input = null;
    if (!startMarker.getMap()) {
      marker = startMarker;
      input = document.getElementById("origin");
    } else if (!endMarker.getMap()) {
      marker = endMarker;
      input = document.getElementById("destination");
    }

    if (marker) {
      input.value = `${lat},${lng}`;
      marker.setPosition(event.latLng);
      marker.setMap(map);
      marker.addListener("click", function() {
        marker.setMap(null); // Remove marker when clicked
        input.value = ""; // Clear the input field
      });
    }

    console.log("Picked point:", lat, lng);
  });
});
