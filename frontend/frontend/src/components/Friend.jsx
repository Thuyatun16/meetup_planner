import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Friends = () => {
  const [friendEmail, setFriendEmail] = useState('');
  const [friends, setFriends] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get('http://localhost:3000/friend', { withCredentials: true });
        setFriends(response.data);
      } catch (error) {
        setMessage('Error fetching friends: ' + (error.response?.data?.message || error.message));
      }
    };
    fetchFriends();
  }, []);

  const handleAddFriend = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:3000/friend',
        { email: friendEmail }, 
        { withCredentials: true }
      );
      setMessage('Friend added!');
      const response = await axios.get('http://localhost:3000/friend', { withCredentials: true });
      setFriends(response.data);
      setFriendEmail('');
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Manage Friends</h2>
      <form onSubmit={handleAddFriend} className="bg-white p-6 rounded shadow-md mb-6">
        <input
          type="email"
          name="email"
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
        {friends.map(friend => (
          <li key={friend._id} className="border p-4 mb-2">
            <p>{friend.name || 'No name'} ({friend.email})</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Friends;