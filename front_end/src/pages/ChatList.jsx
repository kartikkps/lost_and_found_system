import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { itemService } from '../services/api'; // getChats is now in itemService
import { MessageCircle, User, Clock, ArrowRight } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';

const ChatList = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedChat, setSelectedChat] = useState(null);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await itemService.getChats();
                setChats(response.data);
            } catch (err) {
                console.error("Error fetching chats:", err);
                setError("Failed to load conversations.");
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <MessageCircle className="mr-2 h-6 w-6 text-brand" />
                    Your Conversations
                </h1>

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
                        {error}
                    </div>
                )}

                {chats.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <MessageCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No messages yet</h3>
                        <p className="mt-2 text-gray-500">Start browsing items and contact sellers to begin chatting.</p>
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {chats.map((chat) => (
                                <li key={chat.room}>
                                    <button
                                        onClick={() => setSelectedChat(chat)}
                                        className="w-full block hover:bg-gray-50 transition duration-150 ease-in-out text-left"
                                    >
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex items-center mb-2 sm:mb-0">
                                                    <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2">
                                                        <User className="h-5 w-5 text-indigo-600" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <p className="text-sm font-medium text-indigo-600 truncate">{chat.other_user}</p>
                                                        <p className="text-sm text-gray-500">Item: <span className="font-medium text-gray-900">{chat.item_title}</span></p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-row sm:flex-col justify-between sm:items-end w-full sm:w-auto mt-2 sm:mt-0 pl-14 sm:pl-0">
                                                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Active
                                                    </p>
                                                    {chat.timestamp && (
                                                        <div className="flex items-center text-xs text-gray-500 sm:mt-2">
                                                            <Clock className="flex-shrink-0 mr-1.5 h-3 w-3 text-gray-400" />
                                                            {chat.timestamp}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-2 sm:flex sm:justify-between">
                                                <div className="sm:flex">
                                                    <p className="flex items-center text-sm text-gray-500">
                                                        {chat.last_message ? (
                                                            <span className="truncate max-w-md">"{chat.last_message}"</span>
                                                        ) : (
                                                            <span className="italic text-gray-400">No messages yet</span>
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                    <ArrowRight className="h-4 w-4 text-gray-400" />
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {selectedChat && (
                <ChatWindow
                    roomId={selectedChat.room}
                    itemName={`${selectedChat.item_title} (${selectedChat.other_user})`}
                    onClose={() => setSelectedChat(null)}
                />
            )}
        </div>
    );
};

export default ChatList;
