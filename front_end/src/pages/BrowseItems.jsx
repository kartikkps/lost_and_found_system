import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, Calendar, Camera, AlertCircle } from 'lucide-react';
import { itemService, API_BASE_URL } from '../services/api';

const BrowseItems = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); 
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                setLoading(true);
                const response = await itemService.getAllItems();
                setItems(response.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching items:", err);
                setError("Failed to load items. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        
        const baseUrl = API_BASE_URL.replace('/api', '');
        return `${baseUrl}/${imagePath}`;
    };

    const filteredItems = items.filter(item => {
        const matchesFilter = filter === 'all' || item.type === filter;
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.location.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="rounded-md bg-red-50 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="md:flex md:items-center md:justify-between space-y-4 md:space-y-0">
                        <div className="flex-1 min-w-0 md:mr-6">
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    type="text"
                                    className="focus:ring-brand focus:border-brand block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                                    placeholder="Search by item name or location..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex bg-gray-100 p-1 rounded-md">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilter('lost')}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === 'lost' ? 'bg-white shadow text-red-600' : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    Lost
                                </button>
                                <button
                                    onClick={() => setFilter('found')}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === 'found' ? 'bg-white shadow text-green-600' : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    Found
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
                    </div>
                ) : (
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredItems.map((item) => (
                            <Link key={item.id} to={`/items/${item.id}`} className="group">
                                <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
                                    <div className="h-48 w-full bg-gray-200 relative overflow-hidden">
                                        {item.image ? (
                                            <img src={getImageUrl(item.image)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                <Camera className="h-12 w-12 text-gray-300" />
                                            </div>
                                        )}
                                        <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold uppercase tracking-wide rounded ${item.type === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {item.type}
                                        </div>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-brand transition-colors">
                                            {item.title}
                                        </h3>
                                        <div className="mt-2 flex items-center text-sm text-gray-500">
                                            <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                            <span className="truncate">{item.location}</span>
                                        </div>
                                        <div className="mt-2 flex items-center text-sm text-gray-500">
                                            <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                            <span>{item.date}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrowseItems;
