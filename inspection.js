import React, { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import 'firebase/database';

function App() {
  const [userName, setUserName] = useState('');
  const [userPhoneNumber, setUserPhoneNumber] = useState('');

  useEffect(() => {
    // Initialize Firebase
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      databaseURL: "YOUR_DATABASE_URL",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID",
      measurementId: "YOUR_MEASUREMENT_ID"
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();
  }, []);

  const handleSubmitUserDetails = () => {
    // Handle user details submission
    console.log(`Name: ${userName}, Phone Number: ${userPhoneNumber}`);
  };

  return (
    <div>
      <h1>Inspection Request</h1>
      <div id="userDetailsForm">
        <label for="userName">Name:</label>
        <input type="text" id="userName" required value={userName} onChange={(e) => setUserName(e.target.value)}><br>
        <label for="userPhoneNumber">Phone Number:</label>
        <input type="tel" id="userPhoneNumber" required value={userPhoneNumber} onChange={(e) => setUserPhoneNumber(e.target.value)}><br>
        <button id="submitUserDetails" onClick={handleSubmitUserDetails}>Submit</button>
      </div>
      <div id="map" style={{ height: 700 }}></div>
    </div>
  );
}

export default App;
