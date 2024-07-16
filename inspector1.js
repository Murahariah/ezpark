import React, { useState, useEffect } from 'eact';
import L from 'leaflet';
import firebase from 'firebase/app';
import 'firebase/database';

function InspectorMap() {
  const [inspectorMap, setInspectorMap] = useState(null);
  const [markers, setMarkers] = useState({});
  const [inspectors, setInspectors] = useState({});

  useEffect(() => {
    initInspectorMap();
  }, []);

  const initInspectorMap = () => {
    const parkingIcon = L.icon({
      iconUrl: 'green-marker.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    const inspectorIcon = L.icon({
      iconUrl: 'location-marker.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    const mapInstance = L.map("inspector-map");
    setInspectorMap(mapInstance);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapInstance.setView([latitude, longitude], 15);
          const userMarker = L.marker([latitude, longitude], { icon: inspectorIcon }).addTo(mapInstance);
          userMarker.bindPopup('Your Location').openPopup();
        },
        (error) => {
          console.error(error.message);
        }
      );
    } else {
      console.error('Geolocation is not supported by your browser.');
    }

    const dbRef = firebase.database().ref("inspectorLocations");
    dbRef.on("value", (snapshot) => {
      mapInspectors(snapshot.val());
    });

    const mapInspectors = (locations) => {
      for (const inspectorId in inspectors) {
        mapInstance.removeLayer(inspectors[inspectorId]);
      }

      if (locations) {
        for (const inspectorId in locations) {
          const { latitude, longitude } = locations[inspectorId];
          inspectors[inspectorId] = L.marker([latitude, longitude], { icon: inspectorIcon }).addTo(mapInstance);
          inspectors[inspectorId].bindPopup(`Inspector ${inspectorId}`).openPopup();
        }
      }
    };

    mapInstance.on('layeradd', (event) => {
      const marker = event.layer;

      marker.on('dblclick', () => {
        const markerId = marker.options.markerId;
        promptRemoveMarker(markerId);
      });
    });

    mapInstance.on('mousedown', (event) => {
      const longPressTimer = setTimeout(() => {
        const confirmAddParking = confirm('Do you want to add this location as a parking spot?');
        if (confirmAddParking) {
          const { lat, lng } = event.latlng;
          markParkingLocation(lat, lng);
        }
      }, 1000);
    });

    mapInstance.on('mouseup', () => {
      clearTimeout(longPressTimer);
    });

    const locateParking = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            saveParkingLocation(latitude, longitude);
          },
          (error) => {
            console.error(error.message);
          }
        );
      } else {
        console.error('Geolocation is not supported by your browser.');
      }
    };

    const markParkingLocation = (latitude, longitude) => {
      const parkingLocationsRef = firebase.database().ref('parkingLocations');
      const parkingKey = parkingLocationsRef.push().key;

      parkingLocationsRef.child(parkingKey).set({
        latitude: latitude,
        longitude: longitude,
        available: true,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      });

      alert("Parking spot located successfully!");

      const parkingMarker = L.marker([latitude, longitude], { icon: parkingIcon, markerId: parkingKey }).addTo(mapInstance);
      parkingMarker.bindPopup('Parking Spot').openPopup();
      markers[parkingKey] = parkingMarker;

      parkingLocationsRef.child(parkingKey).child('available').on('value', (snapshot) => {
        const isAvailable = snapshot.val();
        updateMarkerColor(parkingMarker, isAvailable);
      });
    };

    const updateMarkerColor = (marker, isAvailable) => {
      if (isAvailable) {
        marker.setIcon(L.icon({ iconUrl: 'green-marker.png', iconSize: [32, 32], iconAnchor: [16, 32] }));
      } else {
        marker.setIcon(L.icon({ iconUrl: 'ed-marker.png', iconSize: [32, 32], iconAnchor: [16, 32] }));
      }
    };

    const promptRemoveMarker = (markerId) => {
      const confirmRemove = confirm(`Do you want to remove this marker with ID ${markerId}?`);

      if (confirmRemove) {
        removeMarker(markerId);
      }
    };

    const removeMarker = (markerId) => {
      const marker = markers[markerId];

      if (marker) {
        const parkingLocationsRef = firebase.database().ref('parkingLocations');

        parkingLocationsRef.child(markerId).remove()
          .then(() => {
            mapInstance.removeLayer(marker);
            delete markers[markerId];
            alert(`Marker with ID ${markerId} removed successfully!`);
          })
          .catch((error) => {
            console.error("Error removing marker:", error);
            alert(`Failed to remove marker with ID ${markerId}. Please try again.`);
          });
      }
    };

    const parkingLocationsRef = firebase.database().ref('parkingLocations');
    parkingLocationsRef.on('child_added', (snapshot) => {
      const { latitude, longitude, available } = snapshot.val();
      const parkingMarker = L.marker([latitude, longitude], { icon: parkingIcon, markerId: snapshot.key }).addTo(mapInstance);
      parkingMarker.bindPopup('Parking Spot').openPopup();
      updateMarkerColor(parkingMarker, available);
      markers[snapshot.key] = parkingMarker;
    });
  };

  // Assume the existence of saveParkingLocation function
  // function saveParkingLocation(latitude, longitude) {
  //     // Implement the function to save parking location to the database
  // }

  return (
    <div id="inspector-map-container">
      <div id="inspector-map" style={{ height: 1000 }} />
    </div>
  );
}

export default InspectorMap;
