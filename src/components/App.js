import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { Provider, useDispatch, useSelector } from 'react-redux';
import './../styles/App.css';

const flightSlice = createSlice({
  name: 'flights',
  initialState: {
    tripType: 'one-way',
    source: '',
    destination: '',
    date: '',
    flightsList: [
      { id: 1, source: 'New York', destination: 'London', date: '2026-06-01', price: '$500', tripType: 'one-way' },
      { id: 2, source: 'Los Angeles', destination: 'Tokyo', date: '2026-06-05', price: '$800', tripType: 'round-trip' },
    ],
    selectedFlight: null,
    bookingDetails: { name: '', email: '', phone: '' },
    isConfirmed: false,
  },
  reducers: {
    setSearchParams: (state, action) => {
      state.tripType = action.payload.tripType;
      state.source = action.payload.source;
      state.destination = action.payload.destination;
      state.date = action.payload.date;
    },
    setSelectedFlight: (state, action) => {
      state.selectedFlight = action.payload;
    },
    setBookingDetails: (state, action) => {
      state.bookingDetails = action.payload;
      state.isConfirmed = true;
    },
    resetBooking: (state) => {
      state.selectedFlight = null;
      state.bookingDetails = { name: '', email: '', phone: '' };
      state.isConfirmed = false;
    }
  }
});

const { setSearchParams, setSelectedFlight, setBookingDetails, resetBooking } = flightSlice.actions;

const store = configureStore({
  reducer: {
    flights: flightSlice.reducer
  }
});

function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="landing-page">
      <h1>Welcome to Phoenix Airlines</h1>
      <button onClick={() => navigate('/flight-search')}>Go to Flight Search</button>
    </div>
  );
}

function FlightSearchPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const stateData = useSelector((state) => state.flights);

  const [tripType, setTripType] = useState(stateData.tripType);
  const [source, setSource] = useState(stateData.source);
  const [destination, setDestination] = useState(stateData.destination);
  const [date, setDate] = useState(stateData.date);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setSearchParams({ tripType, source, destination, date }));
    setSearched(true);
  };

  const handleBookFlight = (flight) => {
    dispatch(setSelectedFlight(flight));
    navigate('/flight-booking');
  };

  return (
    <div className="flight-search-page">
      <h2>Flight Search</h2>
      <form onSubmit={handleSearch}>
        <div>
          <label>
            <input 
              type="radio" 
              name="tripType" 
              value="one-way" 
              checked={tripType === 'one-way'} 
              onChange={() => setTripType('one-way')} 
            /> One-way
          </label>
          <label>
            <input 
              type="radio" 
              name="tripType" 
              value="round-trip" 
              checked={tripType === 'round-trip'} 
              onChange={() => setTripType('round-trip')} 
            /> Round-trip
          </label>
        </div>
        <div>
          <input 
            type="text" 
            placeholder="Source City" 
            value={source} 
            onChange={(e) => setSource(e.target.value)} 
            required 
          />
          <input 
            type="text" 
            placeholder="Destination City" 
            value={destination} 
            onChange={(e) => setDestination(e.target.value)} 
            required 
          />
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Search</button>
      </form>

      {searched && (
        <div className="search-results">
          <h3>Available Flights</h3>
          {stateData.flightsList.map((flight) => (
            <div key={flight.id} className="flight-item" style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
              <p>{flight.source} to {flight.destination} | Date: {flight.date} | {flight.price}</p>
              <button className="book-flight" onClick={() => handleBookFlight(flight)}>
                Book Flight
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FlightBookingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedFlight } = useSelector((state) => state.flights);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError('All fields are required.');
      return;
    }
    setError('');
    dispatch(setBookingDetails({ name, email, phone }));
    navigate('/confirmation');
  };

  return (
    <div className="flight-booking-page">
      <h2>Flight Booking Details</h2>
      {selectedFlight && (
        <p>Selected: {selectedFlight.source} ➔ {selectedFlight.destination} ({selectedFlight.tripType})</p>
      )}
      {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmitBooking}>
        <div>
          <input 
            type="text" 
            placeholder="Full Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
        </div>
        <div>
          <input 
            type="text" 
            placeholder="Email Address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
        <div>
          <input 
            type="text" 
            placeholder="Phone Number" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
          />
        </div>
        <button type="submit">Confirm Booking</button>
      </form>
    </div>
  );
}

function ConfirmationPage() {
  const navigate = useNavigate();
  const { bookingDetails, selectedFlight } = useSelector((state) => state.flights);

  const handleReturnHome = () => {
    navigate('/');
  };

  return (
    <div className="confirmation-page">
      <h2>Booking Confirmation Status</h2>
      {bookingDetails.name ? (
        <div>
          <p><strong>Status:</strong> Confirmed Successfully!</p>
          <p><strong>Passenger Name:</strong> {bookingDetails.name}</p>
          <p><strong>Email:</strong> {bookingDetails.email}</p>
          <p><strong>Phone:</strong> {bookingDetails.phone}</p>
          {selectedFlight && (
            <div>
              <p><strong>Flight Details:</strong></p>
              <p><strong>Source:</strong> {selectedFlight.source}</p>
              <p><strong>Destination:</strong> {selectedFlight.destination}</p>
              <p><strong>Date:</strong> {selectedFlight.date}</p>
              <p><strong>Trip Type:</strong> {selectedFlight.tripType}</p>
            </div>
          )}
        </div>
      ) : (
        <p>No booking found.</p>
      )}
      <button className="confirmation" onClick={handleReturnHome}>
        Return to Home
      </button>
    </div>
  );
}

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div id="main">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/flight-search" element={<FlightSearchPage />} />
            <Route path="/flight-booking" element={<FlightBookingPage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
