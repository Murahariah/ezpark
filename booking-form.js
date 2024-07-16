import React, { useState } from 'react';

function ParkingSlotBookingForm() {
  const [selectedDuration, setSelectedDuration] = useState('');

  const handleBookParkingSlot = () => {
    // Perform any additional validation or processing as needed

    // Redirect back to the home page after booking
    alert(`Parking slot at ${localStorage.getItem('tempUserDetails').storeName} booked for ${selectedDuration}.`);
    window.location.href = '/'; // Change to your home page route
  };

  const handleBackToHome = () => {
    // Redirect back to the home page without booking
    window.location.href = '/'; // Change to your home page route
  };

  return (
    <div>
      <h2>Parking Slot Booking Form</h2>

      <form id="bookingForm">
        <label for="timing">Select Booking Duration:</label>
        <select
          id="timing"
          name="timing"
          value={selectedDuration}
          onChange={(e) => setSelectedDuration(e.target.value)}
        >
          <option value="5 mins">5 mins</option>
          <option value="15 mins">15 mins</option>
          <option value="45 mins">45 mins</option>
          <option value="1 hr">1 hr</option>
          <option value="2 hrs">2 hrs</option>
          <option value="4 hrs">4 hrs</option>
          <option value="6 hrs">6 hrs</option>
        </select>

        {/* Add any additional fields as needed */}

        <button type="button" onClick={handleBookParkingSlot}>
          Book Slot
        </button>
        <button type="button" onClick={handleBackToHome}>
          Back to Home
        </button>
      </form>
    </div>
  );
}

export default ParkingSlotBookingForm;
