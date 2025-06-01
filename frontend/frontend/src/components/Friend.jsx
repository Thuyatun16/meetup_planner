import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Friends = () => {
  const [friendEmail, setFriendEmail] = useState('');
  const [friends, setFriends] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get('http://localhost:3000/friend', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setFriends(response.data);
      } catch (error) {
        setMessage('Error fetching friends');
      }
    };
    fetchFriends();
  }, []);

  const handleAddFriend = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:3000/friend',
        { friendEmail },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setMessage('Friend added!');
      const response = await axios.get('http://localhost:3000/friend', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setFriends(response.data);
      setFriendEmail('');
    } catch (error) {
      setMessage('Error: ' + error.response.data.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Manage Friends</h2>
      <form onSubmit={handleAddFriend} className="bg-white p-6 rounded shadow-md mb-6">
        <input
          type="email"
          value={friendEmail}
          onChange={(e) => setFriendEmail(e.target.value)}
          placeholder="Friend's Email"
          className="border p-2 mb-4 w-full"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 w-full rounded">Add Friend</button>
        {message && <p className="mt-4">{message}</p>}
      </form>
      <h2 className="text-2xl mb-4">Your Friends</h2>
      <ul>
        {friends.map(friendship => (
          <li key={friendship._id} className="border p-4 mb-2">
            <p>{friendship.friend.name} ({friendship.friend.email})</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Friends;