import React, { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import L from 'leaflet';

function App() {
  const [userName, setUserName] = useState('');
  const [userPhoneNumber, setUserPhoneNumber] = useState('');
  const [map, setMap] = useState(null);

  useEffect(() => {
    // Load Firebase configuration
    const firebaseConfig = firebase.app().options;

    // Initialize Firebase using the loaded configuration
    firebase.initializeApp(firebaseConfig);
  }, []);

  const handleSubmitUserDetails = () => {
    // Retrieve user details from the form
    const userNameValue = document.getElementById('userName').value;
    const userPhoneNumberValue = document.getElementById('userPhoneNumber').value;

    // You can now save the user details to Firebase or perform other actions as needed

    // Initialize Leaflet map
    initMap();
  };

  const initMap = () => {
    const mapElement = document.getElementById('map');
    const mapInstance = L.map(mapElement).setView([0, 0], 2); // Set the initial view to your desired location and zoom level

    // Add a simple tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance);

    // Add a marker or perform other map-related actions as needed
    // For example: L.marker([0, 0]).addTo(mapInstance);

    setMap(mapInstance);
  };

  return (
    <div>
      <h1>Inspection Request</h1>
      <div id="userDetailsForm">
        <label htmlFor="userName">Name:</label>
        <input
          type="text"
          id="userName"
          required
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <br />
        <label htmlFor="userPhoneNumber">Phone Number:</label>
        <input
          type="tel"
          id="userPhoneNumber"
          required
          value={userPhoneNumber}
          onChange={(e) => setUserPhoneNumber(e.target.value)}
        />
        <br />
        <button id="submitUserDetails" onClick={handleSubmitUserDetails}>
          Submit
        </button>
      </div>
      <div id="map" style={{ height: 700 }} ref={(element) => element && initMap()} />
    </div>
  );
}

export default App;
