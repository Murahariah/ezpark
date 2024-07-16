import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';

const MapComponent = () => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState({});
  const [currentUserBooking, setCurrentUserBooking] = useState(null);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  useEffect(() => {
    const initMap = () => {
      const mapInstance = L.map('map').setView([13.003065, 79.970555], 10);
      setMap(mapInstance);

      const userLocationIcon = L.icon({
        iconUrl: 'location-marker.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLatitude(latitude);
            setLongitude(longitude);

            mapInstance.setView([latitude, longitude], 14);
            const userMarker = L.marker([latitude, longitude], { icon: userLocationIcon }).addTo(mapInstance);
            userMarker.bindPopup('Your Location').openPopup();
          },
          (error) => {
            console.error(error.message);
          }
        );
      } else {
        console.error('Geolocation is not supported by your browser.');
      }

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance);

      const navigateButton = L.control({ position: 'topleft' });
      navigateButton.onAdd = function () {
        const div = L.DomUtil.create('div', 'navigate-button');
        div.innerHTML = '<button onclick="navigateToParkingSlot()">Navigate</button>';
        return div;
      };
      navigateButton.addTo(mapInstance);

      window.navigateToParkingSlot = function () {
        alert('Tap and hold on the map to select a parking slot for navigation.');

        let pressTimer;
        let longPress = false;

        mapInstance.on('mousedown', function () {
          pressTimer = setTimeout(function () {
            longPress = true;
          }, 500);
        });

        mapInstance.on('mouseup', function () {
          clearTimeout(pressTimer);
          if (longPress) {
            longPress = false;
            const destination = mapInstance.mouseEventToLatLng(event);

            navigator.geolocation.getCurrentPosition(
              (position) => {
                const origin = L.latLng(
                  position.coords.latitude,
                  position.coords.longitude
                );

                const control = L.Routing.control({
                  waypoints: [origin, destination],
                  routeWhileDragging: true,
                }).addTo(mapInstance);

                mapInstance.on('routingstart', () => {
                  if (control._plan) {
                    control._plan.hide();
                  }
                });
              },
              (error) => {
                console.error(error.message);
              }
            );
          }
        });
      };

      const reloadButton = L.control({ position: 'topright' });
      reloadButton.onAdd = function () {
        const div = L.DomUtil.create('div', 'reload-button');
        div.innerHTML = '<button onclick="reloadPage()">🔄</button>';
        return div;
      };
      reloadButton.addTo(mapInstance);
    };

    initMap();
  }, []);

  useEffect(() => {
    const availableIcon = L.icon({
      iconUrl: 'green-marker.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    const bookedIcon = L.icon({
      iconUrl: 'red-marker.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    const mapMarkers = (locations) => {
      for (const storeName in markers) {
        map.removeLayer(markers[storeName]);
      }

      if (locations) {
        for (const storeName in locations) {
          const { latitude, longitude, bookedBy, bookedUntil, carNumber } = locations[storeName];
          const isBooked = bookedBy && bookedUntil && bookedUntil > Date.now();
          const isBookingExpired = bookedUntil && bookedUntil < Date.now();
          const icon = isBooked ? (isBookingExpired ? availableIcon : bookedIcon) : availableIcon;

          const marker = L.marker([latitude, longitude], { icon }).addTo(map);
          let popupContent = `Parking at ${storeName}`;

          if (isBooked) {
            popupContent = `Parking at ${storeName} is booked by ${bookedBy}.`;
            if (carNumber) {
              popupContent += ` Car Number: ${carNumber}`;
            }
            if (isBookingExpired) {
              popupContent += `\nBooking Expired`;
            }
          }

          marker.bindPopup(popupContent).openPopup();

          marker.on('click', function () {
            if (!isBooked) {
              if (!currentUserBooking) {
                promptBookingConfirmation(storeName);
              } else {
                alert("You can only book one slot at a time.");
              }
            } else {
              alert(`This parking slot at ${storeName} is already booked by ${bookedBy}. Car Number: ${carNumber}`);
            }
          });

          markers[storeName] = marker;
        }
      }

      setMarkers(markers);
    };

    const dbRef = db.ref("parkingLocations");
    dbRef.on("value", (snapshot) => {
      mapMarkers(snapshot.val());
    });
  }, [map]);

  const reloadPage = () => {
    location.reload();
  };

  const promptBookingConfirmation = (storeName) => {
    const userName = prompt('Enter your name:');
    if (userName) {
      const confirmBooking = confirm(`Hi ${userName}! Do you want to book the parking slot at ${storeName}?`);
      if (confirmBooking) {
        promptCarNumber(storeName, userName);
      }
    } else {
      alert('Name cannot be empty. Please try again.');
    }
  };

  const promptCarNumber = (storeName, userName) => {
    if (currentUserBooking) {
      alert("You already have a booking. You can only book one slot at a time.");
    } else {
      const carNumber = prompt(`Hi ${userName}! Enter your car number for parking at ${storeName}:`);
      if (carNumber) {
        promptBookingDuration(storeName, userName, carNumber);
      } else {
        alert('Car number cannot be empty. Please try again.');
      }
    }
  };

  const promptBookingDuration = (storeName, userName, carNumber) => {
    const durationOptions = ['5 mins', '15 mins', '45 mins', '1 hr', '2 hrs', '4 hrs', '6 hrs'];
    const selectedDuration = prompt(`Hi ${userName}! Select booking duration for ${storeName}:\n${durationOptions.join('\n')}`);

    if (durationOptions.includes(selectedDuration)) {
      checkCarNumberUniqueness(storeName, userName, carNumber, selectedDuration);
    } else {
      alert('Invalid duration selected. Please try again.');
    }
  };

  const bookParkingSlot = (storeName, userName, carNumber, selectedDuration) => {
    const parkingLocationsRef = db.ref('parkingLocations');
    const bookingEndTime = Date.now() + getDurationInMilliseconds(selectedDuration);

    const bookingDetails = {
      bookedBy: userName,
      bookedUntil: bookingEndTime,
      carNumber: carNumber,
    };

    parkingLocationsRef.child(storeName).update(bookingDetails);

    alert(`Parking slot at ${storeName} booked for ${selectedDuration}.`);

    const booking = {
      storeName,
      bookedUntil: bookingEndTime,
      carNumber,
      storeLocation: { latitude, longitude },
    };

    setCurrentUserBooking(booking);

    db.ref('users').child(userName).update({
      currentBooking: booking,
    });

    setTimeout(removeBookingData, getDurationInMilliseconds(selectedDuration), storeName, userName, parkingLocationsRef);
  };

  const getDurationInMilliseconds = (selectedDuration) => {
    switch (selectedDuration) {
      case '5 mins':
        return 5 * 60 * 1000;
      case '15 mins':
        return 15 * 60 * 1000;
      case '45 mins':
        return 45 * 60 * 1000;
      case '1 hr':
        return 60 * 60 * 1000;
      case '2 hrs':
        return 2 * 60 * 60 * 1000;
      case '4 hrs':
        return 4 * 60 * 60 * 1000;
      case '6 hrs':
        return 6 * 60 * 60 * 1000;
      default:
        return 0;
    }
  };

  const checkCarNumberUniqueness = (storeName, userName, carNumber, selectedDuration) => {
    db.ref('parkingLocations').once('value', (snapshot) => {
      const parkingLocations = snapshot.val();

      const isCarNumberUnique = Object.values(parkingLocations)
        .every(location => !location || !location.carNumber || location.carNumber !== carNumber);

      if (isCarNumberUnique) {
        bookParkingSlot(storeName, userName, carNumber, selectedDuration);
      } else {
        alert('Car number already in use. Please try a different car number.');
      }
    });
  };

  const removeBookingData = (storeName, userName, parkingLocationsRef) => {
    parkingLocationsRef.child(storeName).update({
      bookedBy: null,
      bookedUntil: null,
      carNumber: null,
    });

    db.ref('users').child(userName).update({
      currentBooking: null,
    });

    map.removeLayer(markers[storeName]);
    setCurrentUserBooking(null);

    alert(`Booking at ${storeName} has ended.`);
  };

  return (
    <div id="map" style={{ height: '100vh' }} />
  );
};

export default MapComponent;
