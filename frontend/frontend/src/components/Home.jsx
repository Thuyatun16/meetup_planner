import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/api';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'leaflet/dist/leaflet.css';
import io from 'socket.io-client';
import L from 'leaflet'; // Import Leaflet library
import { Link } from 'react-router-dom';

// Define custom icons
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const meetupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const friendIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const Home = () => {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    time: '',
    participants: []
  });
  const [friends, setFriends] = useState([]);
  const [meetups, setMeetups] = useState([]);
  const [mapPosition, setMapPosition] = useState([13.761394982589062, 100.5238723754883]); // Default to London
  const [userLocation, setUserLocation] = useState(null);
  const [friendsLocations, setFriendsLocations] = useState([]);
  const [selectedMeetupLocation, setSelectedMeetupLocation] = useState(null); // New state for selected meetup location
  const [editData, setEditData] = useState({
    id: null,
    title: '',
    location: '',
    time: '',
    participants: []
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const { user, loading } = useAuth();
  const navigate = useNavigate();


  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const [meetupsResponse, friendsResponse] = await Promise.all([
        api.get('/meetups'),
        api.get('/friend/friends')
      ]);
      setMeetups(meetupsResponse.data);
      setFriends(friendsResponse.data);
    } catch (error) {
      toast.error('Error fetching data');
      if (error.response?.status === 401) navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapPosition([latitude, longitude]); // Center map on user
        },
        (error) => {
          toast.error('Unable to retrieve your location. Please enable location services.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  }, []);

  // Check for near meetings and fetch friends' locations
  useEffect(() => {
    const checkMeetings = async () => {
      const now = new Date();
      const nearMeetings = meetups.filter(meetup => {
        const meetingTime = new Date(meetup.time);
        const timeDiff = meetingTime - now;
        return timeDiff > 0 && timeDiff < 30 * 60 * 1000; // Within 30 minutes
      });

      if (nearMeetings.length > 0) {
        try {
          const response = await api.get('/friend/locations', {
            params: { meetingId: nearMeetings[0]._id }
          });
          setFriendsLocations(response.data);
        } catch (error) {
          toast.error('Error fetching friends\' locations');
        }
      } else {
        setFriendsLocations([]); // Clear friends' locations if no meeting is near
      }
    };

    checkMeetings();
    const interval = setInterval(checkMeetings, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [meetups]);
  useEffect(() => {
    if (navigator.geolocation && user) {
      const sendLocation = async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          await api.post('/users/location', 
            { latitude, longitude }
          );
        } catch (error) {
          console.error('Error updating location:', error);
        }
      };
  
      // Send location immediately
      navigator.geolocation.getCurrentPosition(sendLocation);
  
      // Set up periodic location updates
      const watchId = navigator.geolocation.watchPosition(sendLocation);
  
      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [user]);
  // Optional: Real-time updates with WebSockets
  useEffect(() => {
    const socket = io('http://localhost:3000');
    socket.on('locationUpdate', (data) => {
      setFriendsLocations(prev => prev.map(friend => 
        friend._id === data._id ? { ...friend, location: data.location } : friend
      ));
    });
    return () => socket.disconnect();
  }, []);

  const filteredMeetups = meetups.filter(meetup => {
    const now = new Date();
    const meetupTime = new Date(meetup.time);
    if (activeTab === 'upcoming') return meetupTime > now;
    if (activeTab === 'past') return meetupTime < now;
    return true;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleParticipantChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, participants: selected }));
  };

  const handleCreateMeetup = async (e) => {
    e.preventDefault();
    try {
      if(!formData.title || !formData.location || !formData.time || formData.participants.length === 0) {
        toast.warning('Please fill in all fields');
        return;
      }
      await api.post('/meetups', {
        ...formData,
        time: new Date(formData.time),
      });
      toast.success('Meetup created successfully');
      await fetchData();
      setFormData({ title: '', location: '', time: '', participants: [] });
    } catch (error) {
      toast.error('Error creating meetup');
      if (error.response?.status === 401) navigate('/login');
    }
  };

  const openEditModal = (meetup) => {
    setEditData({
      id: meetup._id,
      title: meetup.title,
      location: meetup.location,
      time: new Date(meetup.time).toISOString().slice(0, 16),
      participants: Array.isArray(meetup.participants) ? meetup.participants.map(p => p._id) : []
    });
    setIsModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditParticipants = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setEditData(prev => ({ ...prev, participants: selected }));
  };

  const handleUpdateMeetup = async (e) => {
    e.preventDefault();
    try {
      await api.put(`meetups/${editData.id}`, {
        ...editData,
        time: new Date(editData.time),
      });
      toast.success('Meetup updated successfully');
      setIsModalOpen(false);
      await fetchData();
    } catch (error) {
      toast.error('Error updating meetup');
      if (error.response?.status === 401) navigate('/login');
    }
  };

  const handleDeleteMeetup = async (id) => {
    if (window.confirm('Are you sure you want to delete this meetup?')) {
      try {
        await api.delete(`/meetups/${id}`);
        toast.success('Meetup deleted successfully');
        await fetchData();
      } catch (error) {
        toast.error('Error deleting meetup');
        if (error.response?.status === 401) navigate('/login');
      }
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (!isModalOpen) {
          // Removed setMapPosition to prevent recentering
          setSelectedMeetupLocation([e.latlng.lat, e.latlng.lng]); // Set selected meetup location
          setFormData(prev => ({ ...prev, location: `${e.latlng.lat}, ${e.latlng.lng}` }));
        }
      },
    });
    return null;
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto mt-24">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-800 mb-2">Meetup Planner</h1>
          <p className="text-gray-600">Plan and manage your meetups with friends</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">Create New Meetup</h2>
              <div>
                <div className="mb-5">
                  <label className="block text-gray-700 mb-2 font-medium">Meetup Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Brunch at Cafe"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-gray-700 mb-2 font-medium">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Click map to select location"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-gray-700 mb-2 font-medium">Date & Time</label>
                  <input
                    type="datetime-local"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2 font-medium">Participants</label>
                  <select
                    multiple
                    value={formData.participants}
                    onChange={handleParticipantChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
                  >
                    {friends.map((friend) => (
                      <option key={friend._id} value={friend._id} className="py-2">
                        {friend.name || friend.email}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                </div>
                <button
                  onClick={handleCreateMeetup}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md"
                >
                  Create Meetup
                </button>
              
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Your Location & Friends</h2>
                <p className="text-gray-600 text-sm">Your location is shown always; friends appear when a meeting is near.</p>
              </div>
              <div className="h-72 relative">
                <MapContainer center={mapPosition} zoom={13} style={{ height: '100%', width: '100%' }} className="z-0">
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {userLocation && <Marker position={userLocation} icon={userIcon} />}
                  {selectedMeetupLocation && <Marker position={selectedMeetupLocation} icon={meetupIcon} />}
                  {friendsLocations.map((friend, index) => (
                    friend.location && friend.location.coordinates && friend.location.coordinates.length === 2 &&
                    typeof friend.location.coordinates[0] === 'number' && typeof friend.location.coordinates[1] === 'number' ?
                    <Marker key={index} position={[friend.location.coordinates[1], friend.location.coordinates[0]]} icon={friendIcon}>
                      <Popup>{friend.name || friend.email}</Popup>
                    </Marker> : null
                  ))}
                  <MapClickHandler />
                </MapContainer>
                <div className="absolute bottom-4 left-4 bg-white px-3 py-1.5 rounded-lg shadow-md text-sm">
                  <span className="font-medium">Current:</span> {formData.location || 'Click map'}
                </div>
              </div>
            </div>
          </div>  
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Your Meetups</h2>
                <div className="flex space-x-2">
                  <button onClick={() => setActiveTab('all')} className={`px-3 py-1 rounded-full text-sm font-medium ${activeTab === 'all' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>All</button>
                  <button onClick={() => setActiveTab('upcoming')} className={`px-3 py-1 rounded-full text-sm font-medium ${activeTab === 'upcoming' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`}>Upcoming</button>
                  <button onClick={() => setActiveTab('past')} className={`px-3 py-1 rounded-full text-sm font-medium ${activeTab === 'past' ? 'bg-amber-100 text-amber-700' : 'text-gray-600 hover:bg-gray-100'}`}>Past</button>
                </div>
              </div>
              {isLoading ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div></div>
              ) : filteredMeetups.length === 0 ? (
                <div className="text-center py-10">
                  <div className="mx-auto bg-indigo-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No meetups yet</h3>
                  <p className="text-gray-500">{activeTab === 'all' ? "Create your first meetup to get started!" : activeTab === 'upcoming' ? "You don't have any upcoming meetups" : "You don't have any past meetups"}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMeetups.map((meetup) => {
                    const meetupTime = new Date(meetup.time);
                    const now = new Date();
                    const isPast = meetupTime < now;
                    return (
                      <Link to={`/meetup/${meetup._id}`} key ={meetup._id} className='block'>
                      <div key={meetup._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{meetup.title}</h3>
                            <div className="flex items-center mt-1 text-gray-600">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="text-sm">{meetup.location}</span>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${isPast ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                            {isPast ? 'Past' : 'Upcoming'}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm">{meetupTime.toLocaleString()}</span>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center text-gray-600 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="text-sm font-medium">Participants:</span>
                          </div>
                          <div className="text-sm text-gray-700 pl-5">
                            {Array.isArray(meetup.participants) && meetup.participants.length > 0 ? meetup.participants.map(p => p.name || p.email).join(', ') : 'No participants'}
                          </div>
                        </div>
                        {meetup.creator.email === user.email && (
                          <div className="mt-4 flex space-x-2">
                            <button onClick={(e) => {e.preventDefault(); openEditModal(meetup);}} className="flex-1 bg-indigo-100 text-indigo-700 py-1.5 rounded-lg font-medium hover:bg-indigo-200 transition-colors flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button onClick={(e) => {e.preventDefault(); handleDeleteMeetup(meetup._id)}} className="flex-1 bg-red-100 text-red-700 py-1.5 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Edit Meetup</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editData.title}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={editData.location}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Date & Time</label>
                  <input
                    type="datetime-local"
                    name="time"
                    value={editData.time}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Participants</label>
                  <select
                    multiple
                    value={editData.participants}
                    onChange={handleEditParticipants}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
                  >
                    {friends.map((friend) => (
                      <option key={friend._id} value={friend._id} className="py-2">
                        {friend.name || friend.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors">Cancel</button>
                  <button onClick={handleUpdateMeetup} className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity">Update Meetup</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

// Add this effect to send location updates
