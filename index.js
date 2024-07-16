import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import './styles.css';
import firebase from 'firebase/app';
import 'firebase/database';

function App() {
  const [map, setMap] = useState(null);
  const [inspectionButtonVisible, setInspectionButtonVisible] = useState(true);

  useEffect(() => {
    initMap();
  }, []);

  const initMap = () => {
    // Initialize the map
    const map = new window.L.Map('map', {
      center: [51.505, -0.09],
      zoom: 13,
    });

    // Add a tile layer
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      subdomains: ['a', 'b', 'c'],
    }).addTo(map);

    setMap(map);
  };

  const promptForInspectionDetails = () => {
    // Handle inspection details prompt
    alert('WhatsApp +91 7550000805 to add new parking slots');
  };

  return (
    <div id="map-container">
      <img id="site-logo" src="sitelogo.png" alt="Site Logo" />
      <MapContainer id="map" style={{ height: 1000 }} center={[51.505, -0.09]} zoom={13}>
        <TileLayer
          attribution="&copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a>"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          subdomains={['a', 'b', 'c']}
        />
        {map && (
          <Marker position={[51.505, -0.09]}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        )}
      </MapContainer>
      {inspectionButtonVisible && (
        <button id="inspectionButton" onClick={promptForInspectionDetails}>
          WhatsApp +91 7550000805 to add new parking slots
        </button>
      )}
    </div>
  );
}

export default App;
