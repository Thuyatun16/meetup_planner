import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('');
  const [participants, setParticipants] = useState([]);
  const [meetups, setMeetups] = useState([]);
  const [message, setMessage] = useState('');
  const [mapPosition, setMapPosition] = useState([51.505, -0.09]); // Default: London
  
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Configure axios to send cookies with requests
  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  // Only fetch meetups if user is authenticated
  useEffect(() => {
    const fetchMeetups = async () => {
      if (!user) return; // Don't fetch if not authenticated
      
      try {
        const response = await axios.get('http://localhost:3000/meetups');
        setMeetups(response.data);
      } catch (error) {
        console.error('Error fetching meetups:', error);
        setMessage('Error fetching meetups: ' + (error.response?.data?.message || error.message));
        
        // If we get a 401, redirect to login
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    };
    
    fetchMeetups();
  }, [user, navigate]);

  const handleCreateMeetup = async (e) => {
    e.preventDefault();
    try {
      console.log('Creating meeting', {
        title,
        location, 
        time: new Date(time),
        participants
      });
      
      await axios.post(
        'http://localhost:3000/meetups',
        { title, location, time: new Date(time), participants }
      );
      
      setMessage('Meetup created!');
      
      // Refresh the meetups list
      const response = await axios.get('http://localhost:3000/meetups');
      setMeetups(response.data);
      
      // Clear the form
      setTitle('');
      setLocation('');
      setTime('');
      setParticipants([]);
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || error.message));
      
      // If we get a 401, redirect to login
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setMapPosition([e.latlng.lat, e.latlng.lng]);
        setLocation(`${e.latlng.lat}, ${e.latlng.lng}`);
      },
    });
    return null;
  };

  // Show loading state while checking authentication
  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  // Don't render the main content if not authenticated
  if (!user) {
    return null; // This shouldn't be visible due to the redirect in useEffect
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Create Meetup</h2>
      <form onSubmit={handleCreateMeetup} className="bg-white p-6 rounded shadow-md mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Meetup Title"
          className="border p-2 mb-4 w-full"
          required
        />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location (click map to select)"
          className="border p-2 mb-4 w-full"
          required
        />
        <input
          type="datetime-local"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="border p-2 mb-4 w-full"
          required
        />
        <select
          multiple
          value={participants}
          onChange={(e) => setParticipants(Array.from(e.target.selectedOptions, option => option.value))}
          className="border p-2 mb-4 w-full"
        >
          {/* Populate with friends from Friends component */}
          <option value="friend_id_1">Friend 1</option> {/* Replace with dynamic friends list */}
        </select>
        
        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Create Meetup
        </button>
      </form>

      {message && <div className="bg-yellow-100 p-3 mb-4 rounded">{message}</div>}

      <div className="mb-6" style={{ height: '300px' }}>
        <MapContainer center={mapPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={mapPosition} />
          <MapClickHandler />
        </MapContainer>
      </div>

      <h2 className="text-2xl mb-4">Your Meetups</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meetups.map((meetup) => (
          <div key={meetup._id} className="bg-white p-4 rounded shadow">
            <h3 className="text-xl font-bold">{meetup.title}</h3>
            <p>Location: {meetup.location}</p>
            <p>Time: {new Date(meetup.time).toLocaleString()}</p>
            <p>Participants: {meetup.participants.length}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;