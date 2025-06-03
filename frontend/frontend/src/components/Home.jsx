import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [friends, setFriends] = useState([]);
  const [time, setTime] = useState('');
  const [participants, setParticipants] = useState([]);
  const [meetups, setMeetups] = useState([]);
  const [message, setMessage] = useState('');
  const [mapPosition, setMapPosition] = useState([51.505, -0.09]);
  const [editMeetup, setEditMeetup] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editParticipants, setEditParticipants] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  useEffect(() => {
    const fetchMeetups = async () => {
      if (!user) return;
      try {
        const response = await axios.get('http://localhost:3000/meetups', { withCredentials: true });
        const friendResponse = await axios.get('http://localhost:3000/friend', { withCredentials: true });
        setMeetups(response.data);
        setFriends(friendResponse.data);
      } catch (error) {
        setMessage('Error fetching data: ' + (error.response?.data?.message || error.message));
        if (error.response?.status === 401) navigate('/login');
      }
    };
    fetchMeetups();
  }, [user, navigate]);

  useEffect(() => {
    if (editMeetup) {
      setEditTitle(editMeetup.title);
      setEditLocation(editMeetup.location);
      setEditTime(new Date(editMeetup.time).toISOString().slice(0, 16));
      setEditParticipants(Array.isArray(editMeetup.participants) ? editMeetup.participants.map(p => p._id) : []);
    }
  }, [editMeetup]);

  const handleCreateMeetup = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:3000/meetups',
        { title, location, time: new Date(time), participants },
        { withCredentials: true }
      );
      setMessage('Meetup created!');
      const response = await axios.get('http://localhost:3000/meetups', { withCredentials: true });
      setMeetups(response.data);
      setTitle('');
      setLocation('');
      setTime('');
      setParticipants([]);
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || error.message));
      if (error.response?.status === 401) navigate('/login');
    }
  };

  const handleEditMeetup = (meetup) => {
    setEditMeetup(meetup);
    setShowEditModal(true);
  };

  const handleUpdateMeetup = async (e) => {
    e.preventDefault();
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await axios.put(
        `http://localhost:3000/meetups/${editMeetup._id}`,
        { title: editTitle, location: editLocation, time: new Date(editTime), participants: editParticipants },
        { withCredentials: true }
      );
      setMessage('Meetup updated successfully');
      setShowEditModal(false);
      const response = await axios.get('http://localhost:3000/meetups', { withCredentials: true });
      setMeetups(response.data);
    } catch (error) {
      setMessage('Error updating meetup: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteMeetup = async (id) => {
    if (window.confirm('Are you sure you want to delete this meetup?')) {
      try {
        await axios.delete(`http://localhost:3000/meetups/${id}`, { withCredentials: true });
        setMessage('Meetup deleted successfully');
        const response = await axios.get('http://localhost:3000/meetups', { withCredentials: true });
        setMeetups(response.data);
      } catch (error) {
        setMessage('Error deleting meetup: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (!showEditModal) {
          setMapPosition([e.latlng.lat, e.latlng.lng]);
          setLocation(`${e.latlng.lat}, ${e.latlng.lng}`);
        }
      },
    });
    return null;
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return null;

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
          {friends.length > 0 ? (
            friends.map((friend) => (
              <option key={friend._id} value={friend._id}>
                {friend.name || friend.email}
              </option>
            ))
          ) : (
            <option disabled>No friends found</option>
          )}
        </select>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Create Meetup
        </button>
      </form>

      {message && <div className="bg-yellow-100 p-3 mb-4 rounded">{message}</div>}

      <div className="mb-6" style={{ height: '300px', zIndex: 10 }}>
        <MapContainer center={mapPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
            <p>
              Participants:{' '}
              {Array.isArray(meetup.participants) && meetup.participants.length > 0
                ? `${meetup.participants.length} participant(s): ${meetup.participants.map(p => p.name || p.email).join(', ')}`
                : 'No participants'}
            </p>
            {meetup.creator._id === user._id && (
              <div className="mt-2">
                <button
                  onClick={() => handleEditMeetup(meetup)}
                  className="bg-yellow-500 text-white p-2 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteMeetup(meetup._id)}
                  className="bg-red-500 text-white p-2 rounded"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showEditModal && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50"
          style={{ zIndex: 400 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
            }
          }}
        >
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md overflow-y-auto" style={{ maxHeight: '80vh' }}>
            <h2 className="text-2xl mb-4">Edit Meetup</h2>
            <form onSubmit={handleUpdateMeetup}>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Meetup Title"
                className="border p-2 mb-4 w-full"
                required
              />
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="Location"
                className="border p-2 mb-4 w-full"
                required
              />
              <input
                type="datetime-local"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="border p-2 mb-4 w-full"
                required
              />
              <select
                multiple
                value={editParticipants}
                onChange={(e) => setEditParticipants(Array.from(e.target.selectedOptions, option => option.value))}
                className="border p-2 mb-4 w-full"
              >
                {friends.map((friend) => (
                  <option key={friend._id} value={friend._id}>
                    {friend.name || friend.email}
                  </option>
                ))}
              </select>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-500 text-white p-2 rounded mr-2"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white p-2 rounded" disabled={isUpdating}>
                  {isUpdating ? 'Updating...' : 'Update Meetup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;