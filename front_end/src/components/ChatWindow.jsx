import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { X, Send, MessageCircle, Check, CheckCheck } from 'lucide-react';
import { API_BASE_URL } from '../services/api';



const getSocketUrl = () => {
    const hostname = window.location.hostname;
    return `http://${hostname}:5000`;
};

const SOCKET_URL = getSocketUrl();

const ChatWindow = ({ roomId, itemName, onClose }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {

        socketRef.current = io(SOCKET_URL, {
            withCredentials: true,
        });

        socketRef.current.emit('join', {
            username: user.username,
            room: roomId
        });

        socketRef.current.on('history', (history) => {
            setMessages(history);
        });

        socketRef.current.on('message', (message) => {
            setMessages((prev) => [...prev, message]);
        });
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [roomId, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageData = {
            room: roomId,
            sender_id: user.id, // Send user ID
            user: user.username,
            text: newMessage.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        socketRef.current.emit('message', messageData);
        setNewMessage('');
    };

    return (
        <div className="fixed bottom-0 right-0 w-full h-[80vh] md:bottom-4 md:right-4 md:w-96 md:h-[500px] bg-white md:rounded-lg rounded-t-lg shadow-2xl overflow-hidden border border-gray-200 z-50 flex flex-col">
            { }
            <div className="bg-brand p-4 flex justify-between items-center text-brand-foreground">
                <div className="flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    <h3 className="font-bold truncate max-w-[200px]">{itemName}</h3>
                </div>
                <button
                    onClick={onClose}
                    className="text-brand-foreground hover:bg-brand-hover p-1 rounded-full transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            { }
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                        <p>Start the conversation!</p>
                        <p className="text-xs">Messages are live.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {messages.map((msg, index) => {
                            const isMe = msg.sender_id === user.id;
                            return (
                                <div
                                    key={index}
                                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${isMe
                                            ? 'bg-brand text-brand-foreground rounded-br-none shadow-md'
                                            : 'bg-gray-100 border border-gray-300 text-gray-900 rounded-bl-none shadow-sm'
                                            }`}
                                    >
                                        <p className="font-bold text-xs opacity-75 mb-1">{msg.user}</p>
                                        <p>{msg.text}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                                        {msg.timestamp}
                                    </span>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            { }
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 focus:ring-brand focus:border-brand block w-full sm:text-sm border-gray-300 rounded-full py-2 px-4 border"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2 rounded-full bg-brand text-brand-foreground hover:bg-brand-hover disabled:opacity-50 transition-colors"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;
