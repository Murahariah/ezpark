import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import firebase from 'firebase/app';
import 'firebase/database';

function InspectorDashboard() {
  const [map, setMap] = useState(null);

  useEffect(() => {
    initInspectorMap();
  }, []);

  const initInspectorMap = () => {
    const mapElement = document.getElementById('inspector-map');
    const mapInstance = L.map(mapElement).setView([0, 0], 2); // Set the initial view to your desired location and zoom level

    // Add a simple tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance);

    setMap(mapInstance);
  };

  const locateParking = () => {
    // Implement locate parking spot logic here
  };

  return (
    <div id="inspector-map-container">
      <div id="inspector-map" style={{ height: 1000 }} />
      <button onClick={locateParking}>Locate Parking Spot</button>
    </div>
  );
}

export default InspectorDashboard;
