import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { MapPin, Calendar, Camera, ArrowLeft, MessageCircle, AlertCircle } from 'lucide-react';
import { itemService, API_BASE_URL } from '../services/api';
import ChatWindow from '../components/ChatWindow';

const ItemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const response = await itemService.getItemById(id);
                setItem(response.data);
            } catch (err) {
                console.error("Error fetching item details:", err);
                setError("Item not found or could not be loaded.");
            } finally {
                setLoading(false);
            }
        };

        fetchItem();
    }, [id]);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        const baseUrl = API_BASE_URL.replace('/api', '');
        return `${baseUrl}/${imagePath}`;
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (error) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
                <p className="mt-1 text-sm text-gray-500">{error}</p>
            </div>
        </div>
    );
    if (!item) return <div className="text-center py-20">Item not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 mr-1" />
                    Back to browse
                </button>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="relative h-64 sm:h-80 w-full bg-gray-200">
                        {item.image ? (
                            <img src={getImageUrl(item.image)} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Camera className="h-16 w-16 text-gray-300" />
                            </div>
                        )}
                        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide shadow-sm ${item.type === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                            {item.type}
                        </div>
                    </div>

                    <div className="px-6 py-6 border-b border-gray-200">
                        <div className="md:flex md:items-center md:justify-between">
                            <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
                            <span className="flex items-center text-sm text-gray-500 mt-2 md:mt-0">
                                <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                Reported on {item.date}
                            </span>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                            <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {item.location}
                        </div>
                    </div>

                    <div className="px-6 py-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                        <p className="text-gray-600 leading-relaxed mb-6">
                            {item.description}
                        </p>

                        <div className="border-t border-gray-200 pt-6 mt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                            <div className="bg-indigo-50 rounded-lg p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Posted by {item.user_name}</p>
                                    <p className="text-sm text-gray-500">Member since {item.user_joined}</p>
                                    <p className="text-xs text-gray-400 mt-1">{item.contact}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <a
                                        href={item.contact.includes('@') ? `mailto:${item.contact}` : `tel:${item.contact}`}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand"
                                    >
                                        Contact
                                    </a>
                                    <button
                                        onClick={() => setShowChat(!showChat)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-brand-foreground bg-brand hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand"
                                    >
                                        <MessageCircle className="h-5 w-5 mr-2" />
                                        Chat
                                    </button>
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-gray-400 text-center">
                                Always meet in a public place for transactions. Safety first!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {showChat && (
                <ChatWindow
                    itemId={id}
                    itemName={item.title}
                    onClose={() => setShowChat(false)}
                />
            )}
        </div>
    );
};

export default ItemDetails;
