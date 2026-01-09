// 1️⃣ connect socket
const socket = io();

// 2️⃣ ask username
const username = prompt("Enter your name") || "Anonymous";
socket.emit("join", username);

// 3️⃣ create map
const map = L.map("map").setView([25.5941, 85.1376], 7);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// 4️⃣ variables
let myMarker;
const otherUsers = {};

// 5️⃣ watch YOUR location
navigator.geolocation.watchPosition(
  (position) => {
    const { latitude, longitude } = position.coords;

    if (!myMarker) {
      myMarker = L.circleMarker([latitude, longitude], {
        radius: 10,
        color: "blue",
        fillColor: "cyan",
        fillOpacity: 0.9
      })
        .addTo(map)
        .bindPopup(`You: ${username}`);
    } else {
      myMarker.setLatLng([latitude, longitude]);
    }

    socket.emit("location", { latitude, longitude });
  },
  (err) => console.error(err),
  { enableHighAccuracy: true }
);

// 6️⃣ LISTEN: other users moving
socket.on("user-location", ({ id, username, latitude, longitude }) => {
  if (!otherUsers[id]) {
    otherUsers[id] = L.circleMarker([latitude, longitude], {
      radius: 8,
      color: "red",
      fillColor: "orange",
      fillOpacity: 0.8
    })
      .addTo(map)
      .bindTooltip(username, { permanent: true, direction: "top" });
  } else {
    otherUsers[id].setLatLng([latitude, longitude]);
  }
});

// 7️⃣ LISTEN: user disconnected  ✅ THIS ONE
socket.on("user-disconnected", (id) => {
  if (otherUsers[id]) {
    map.removeLayer(otherUsers[id]);
    delete otherUsers[id];
  }
});
