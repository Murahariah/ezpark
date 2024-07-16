// Import React and Firebase modules
import React, { useState, useEffect } from 'eact';
import firebase from 'firebase/app';
import 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKuoLKspUfEKdkexgO7HD9yb0C32lFI9I",
  authDomain: "esp-location-56ece.firebaseapp.com",
  databaseURL: "https://esp-location-56ece-default-rtdb.firebaseio.com",
  projectId: "esp-location-56ece",
  storageBucket: "esp-location-56ece.appspot.com",
  messagingSenderId: "415169225788",
  appId: "1:415169225788:web:0780c061338be738b8cf39",
  measurementId: "G-NP5SHD0WWD"
};

// Initialize Firebase app
firebase.initializeApp(firebaseConfig);

// Get a reference to the Firebase Realtime Database
const db = firebase.database();
