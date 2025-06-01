
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Meetup = () => {
 const [title, setTitle] = useState('');
 const [location, setLocation] = useState('');
 const [time,setTime] = useState('');
 const [participants, setParticipants] = useState('');
 const [meetup, setMeetup] = useState([]);
 const [message, setMessage] = useState('');

 useEffect(()=>{
    const fetchMeetup = async () => {
     try {
        const response = await axios.get('http://localhost:3000/meetups');
        setMeetup(response.data);
     } catch (error) {
        setMessage('Error:'+ error.response.data.message);
     }
    };
    fetchMeetup();
 },[])
 const handleCreateMeetup = async (e) =>{
    e.preventDefault();
    try {
        const response = await axios.post('http://localhost:3000/meetups', {
            title,
             location,
              time : new Date(),
               participants
        });
        setMessage('Meetup created successfully!');
        setTitle('');
        setLocation('');
        setTime('');
        setParticipants('');
    } catch (error) {
        setMessage('Error:'+ error.response.data.message);
    }
 }
 return(
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
          placeholder="Location"
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
        <input
          type="text"
          value={participants}
          onChange={(e) => setParticipants(e.target.value)}
          placeholder="Participant IDs (comma-separated)"
          className="border p-2 mb-4 w-full"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 w-full rounded">Create Meetup</button>
        {message && <p className="mt-4">{message}</p>}
      </form>
      <h2 className="text-2xl mb-4">Meetups</h2>
      <ul>
        {meetup.map(meetup => (
          <li key={meetup._id} className="border p-4 mb-2">
            <h3>{meetup.title}</h3>
            <p>Location: {meetup.location}</p>
            <p>Time: {new Date(meetup.time).toLocaleString()}</p>
            <p>Participants: {meetup.participants.map(p => p.name).join(', ')}</p>
          </li>
        ))}
      </ul>
    </div>
  );
 
};
export default Meetup;