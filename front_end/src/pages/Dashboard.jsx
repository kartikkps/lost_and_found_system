import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { itemService } from '../services/api';
import { Link } from 'react-router-dom';
import { PlusCircle, Clock, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchItems = async () => {
            try {

                const response = await itemService.getUserItems();
                setItems(response.data);
            } catch (err) {
                console.error("Failed to fetch items", err);
                setError("Could not connect to the server. Please check your connection.");
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [user]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
            try {
                await itemService.deleteItem(id);
                // Remove item from state
                setItems(items.filter(item => item.id !== id));
            } catch (err) {
                console.error("Failed to delete item", err);
                alert("Failed to delete item. Please try again.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                            Welcome back, {user?.name || 'User'}
                        </h2>
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4">
                        <Link
                            to="/report"
                            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-brand-foreground bg-brand hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand"
                        >
                            <PlusCircle className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                            New Report
                        </Link>
                    </div>
                </div>

                { }
                {error && (
                    <div className="rounded-md bg-red-50 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Your Reports</h3>
                    </div>
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">Loading...</div>
                    ) : items.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {items.map((item) => (
                                <li key={item.id}>
                                    <Link to={`/items/${item.id}`} className="block hover:bg-gray-50">
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-brand truncate">{item.title}</p>
                                                <div className="ml-2 flex-shrink-0 flex">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.type === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                        }`}>
                                                        {item.type.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-2 sm:flex sm:justify-between">
                                                <div className="sm:flex">
                                                    <p className="flex items-center text-sm text-gray-500">
                                                        {item.status === 'open' ? (
                                                            <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                                        ) : (
                                                            <CheckCircle className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-400" />
                                                        )}
                                                        {item.status}
                                                    </p>
                                                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                        Location: {item.location}
                                                    </p>
                                                </div>
                                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                    <p>
                                                        Reported on <time dateTime={item.date}>{item.date}</time>
                                                    </p>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault(); // Prevent link navigation
                                                            handleDelete(item.id);
                                                        }}
                                                        className="ml-4 text-red-600 hover:text-red-900 flex items-center gap-1"
                                                    >
                                                        <Trash2 size={16} />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            <p>No reports found. Start by reporting a lost or found item.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
