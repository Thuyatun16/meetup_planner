import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Friends = () => {
    const [friendEmail, setFriendEmail] = useState('');
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [friendToRemove, setFriendToRemove] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [activeTab, setActiveTab] = useState('friends');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFriendsData = async () => {
            try {
                setIsLoading(true);
                const [friendsRes, pendingRes, sentRes] = await Promise.all([
                    axios.get('http://localhost:3000/friend/friends', { withCredentials: true }),
                    axios.get('http://localhost:3000/friend/pending', { withCredentials: true }),
                    axios.get('http://localhost:3000/friend/sent', { withCredentials: true }),
                ]);
                setFriends(friendsRes.data);
                setPendingRequests(pendingRes.data);
                setSentRequests(sentRes.data);
            } catch (error) {
                toast.error('Error fetching friends data: ' + (error.response?.data?.message || error.message));
            } finally {
                setIsLoading(false);
            }
        };
        fetchFriendsData();
    }, []);

    const handleAddFriend = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                'http://localhost:3000/friend/request',
                { email: friendEmail },
                { withCredentials: true }
            );
            toast.success('Friend request sent successfully');
            const sentRes = await axios.get('http://localhost:3000/friend/sent', { withCredentials: true });
            setSentRequests(sentRes.data);
            setFriendEmail('');
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const handleRespond = async (requesterId, response) => {
        try {
            await axios.post(
                'http://localhost:3000/friend/respond',
                { requesterId, response },
                { withCredentials: true }
            );
            toast.success(`Request ${response === 'accept' ? 'accepted' : 'rejected'}`);
            const [friendsRes, pendingRes] = await Promise.all([
                axios.get('http://localhost:3000/friend/friends', { withCredentials: true }),
                axios.get('http://localhost:3000/friend/pending', { withCredentials: true }),
            ]);
            setFriends(friendsRes.data);
            setPendingRequests(pendingRes.data);
        } catch (error) {
            toast.error('Error responding to request: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleRemoveFriend = async () => {
        try {
            await axios.delete(`http://localhost:3000/friend/${friendToRemove._id}`, { withCredentials: true });
            toast.success('Friend removed successfully');
            const friendsRes = await axios.get('http://localhost:3000/friend/friends', { withCredentials: true });
            setFriends(friendsRes.data);
        } catch (error) {
            toast.error('Error removing friend: ' + (error.response?.data?.message || error.message));
        } finally {
            setShowConfirmation(false);
            setFriendToRemove(null);
        }
    };

    const confirmRemoveFriend = (friend) => {
        setFriendToRemove(friend);
        setShowConfirmation(true);
    };

    const cancelRequest = async (recipientId) => {
        try {
            await axios.delete(`http://localhost:3000/friend/request/${recipientId}`, { withCredentials: true });
            toast.success('Request canceled');
            const sentRes = await axios.get('http://localhost:3000/friend/sent', { withCredentials: true });
            setSentRequests(sentRes.data);
        } catch (error) {
            toast.error('Error canceling request: ' + (error.response?.data?.message || error.message));
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
      <>
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12 px-4 sm:px-6'>
        <div className="p-6 max-w-4xl mx-auto mt-8 ">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Friends</h1>
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Add Friend</h2>
                <form onSubmit={handleAddFriend} className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="email"
                        name="email"
                        value={friendEmail}
                        onChange={(e) => setFriendEmail(e.target.value)}
                        placeholder="Enter friend's email"
                        className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
                    >
                        Send Request
                    </button>
                </form>
            </div>
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    className={`py-3 px-6 font-medium rounded-t-lg transition-colors ${
                        activeTab === 'friends'
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('friends')}
                >
                    Friends ({friends.length})
                </button>
                <button
                    className={`py-3 px-6 font-medium rounded-t-lg transition-colors ${
                        activeTab === 'pending'
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending Requests ({pendingRequests.length})
                </button>
                <button
                    className={`py-3 px-6 font-medium rounded-t-lg transition-colors ${
                        activeTab === 'sent'
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('sent')}
                >
                    Sent Requests ({sentRequests.length})
                </button>
            </div>
            {activeTab === 'friends' && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {friends.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="text-gray-400 mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-16 w-16 mx-auto"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </div>
                            <p className="text-gray-600 mb-6">You haven't added any friends yet.</p>
                            <button
                                onClick={() => setActiveTab('sent')}
                                className="text-blue-600 font-medium hover:text-blue-800"
                            >
                                Send a friend request to get started
                            </button>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {friends.map(friend => (
                                <li
                                    key={friend._id}
                                    className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 flex items-center justify-center mr-4">
                                            <span className="text-gray-600 font-medium">
                                                {friend.name?.charAt(0) || friend.email?.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{friend.name || 'No name'}</h3>
                                            <p className="text-sm text-gray-500">{friend.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => confirmRemoveFriend(friend)}
                                        className="text-red-500 hover:text-red-700 flex items-center"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 mr-1"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Unfriend
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
            {activeTab === 'pending' && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {pendingRequests.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="text-gray-400 mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-16 w-16 mx-auto"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                            <p className="text-gray-600">You don't have any pending friend requests.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {pendingRequests.map(request => (
                                <li
                                    key={request._id}
                                    className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 flex items-center justify-center mr-4">
                                            <span className="text-gray-600 font-medium">
                                                {request.name?.charAt(0) || request.email?.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{request.name || 'No name'}</h3>
                                            <p className="text-sm text-gray-500">{request.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleRespond(request._id, 'accept')}
                                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 mr-1"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleRespond(request._id, 'reject')}
                                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 mr-1"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            Reject
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
            {activeTab === 'sent' && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {sentRequests.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="text-gray-400 mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-16 w-16 mx-auto"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                </svg>
                            </div>
                            <p className="text-gray-600">You haven't sent any friend requests yet.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {sentRequests.map(request => (
                                <li
                                    key={request._id}
                                    className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 flex items-center justify-center mr-4">
                                            <span className="text-gray-600 font-medium">
                                                {request.name?.charAt(0) || request.email?.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{request.name || 'No name'}</h3>
                                            <p className="text-sm text-gray-500">{request.email}</p>
                                            <span className="inline-block px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full mt-1">
                                                Pending
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => cancelRequest(request._id)}
                                        className="text-gray-500 hover:text-gray-700 flex items-center"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 mr-1"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Cancel
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full mx-4">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Unfriend</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to remove{' '}
                            <span className="font-medium">{friendToRemove?.name || friendToRemove?.email}</span> from
                            your friends?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowConfirmation(false);
                                    setFriendToRemove(null);
                                }}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRemoveFriend}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </div></>
    );
};

export default Friends;