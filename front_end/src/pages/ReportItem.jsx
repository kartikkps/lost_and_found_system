import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Upload, MapPin, Calendar, Type, AlertCircle } from 'lucide-react';
import { itemService } from '../services/api';

const ReportItem = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        type: 'lost',
        title: '',
        description: '',
        category: 'electronics',
        date: '',
        location: '',
        contact: '',
        image: null
    });


    useEffect(() => {
        if (!user) {

        }
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            setFormData({ ...formData, image: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'image' && formData[key]) {
                    data.append(key, formData[key]);
                } else if (key !== 'image') {
                    data.append(key, formData[key]);
                }
            });


            await itemService.createItem(data);
            navigate('/dashboard');

        } catch (error) {
            console.error("Error creating report:", error);
            setError("Failed to create report. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Report an Item</h1>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <form onSubmit={handleSubmit} className="p-6 space-y-8">
                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">Submission Error</h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <p>{error}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        { }
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">What are you reporting?</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    onClick={() => setFormData({ ...formData, type: 'lost' })}
                                    className={`cursor-pointer border-2 rounded-lg p-4 text-center transition-all ${formData.type === 'lost'
                                        ? 'border-red-500 bg-red-50 text-red-700'
                                        : 'border-gray-200 hover:border-red-200'
                                        }`}
                                >
                                    <span className="block font-bold text-lg">I Lost Something</span>
                                </div>
                                <div
                                    onClick={() => setFormData({ ...formData, type: 'found' })}
                                    className={`cursor-pointer border-2 rounded-lg p-4 text-center transition-all ${formData.type === 'found'
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-200 hover:border-green-200'
                                        }`}
                                >
                                    <span className="block font-bold text-lg">I Found Something</span>
                                </div>
                            </div>
                        </div>

                        { }
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <div className="sm:col-span-4">
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                    Item Name / Title
                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        name="title"
                                        id="title"
                                        required
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300 border py-2 px-3"
                                        placeholder="e.g. Blue iPhone 13"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                    Category
                                </label>
                                <div className="mt-1">
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                                    >
                                        <option value="electronics">Electronics</option>
                                        <option value="documents">Documents</option>
                                        <option value="clothing">Clothing</option>
                                        <option value="accessories">Accessories</option>
                                        <option value="others">Others</option>
                                    </select>
                                </div>
                            </div>

                            <div className="sm:col-span-6">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <div className="mt-1">
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={3}
                                        required
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="shadow-sm focus:ring-brand focus:border-brand block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                                        placeholder="Provide details like color, size, distinct marks..."
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                                    Location {formData.type === 'lost' ? 'Lost' : 'Found'}
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MapPin className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="location"
                                        id="location"
                                        required
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="focus:ring-brand focus:border-brand block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                                        placeholder="e.g. Central Park"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
                                    Contact Information
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        name="contact"
                                        id="contact"
                                        required
                                        value={formData.contact}
                                        onChange={handleChange}
                                        className="focus:ring-brand focus:border-brand block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                                        placeholder="Phone or Email"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                                Date
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="date"
                                    name="date"
                                    id="date"
                                    required
                                    max={new Date().toISOString().split("T")[0]}
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="focus:ring-brand focus:border-brand block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label className="block text-sm font-medium text-gray-700">Upload Image</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    {formData.image ? (
                                        <div className="mb-4">
                                            <img
                                                src={URL.createObjectURL(formData.image)}
                                                alt="Preview"
                                                className="mx-auto h-48 object-contain rounded-md"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, image: null })}
                                                className="mt-2 text-sm text-red-600 hover:text-red-800"
                                            >
                                                Remove Image
                                            </button>
                                        </div>
                                    ) : (
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    )}
                                    <div className="flex text-sm text-gray-600 justify-center">
                                        <label
                                            htmlFor="image-upload"
                                            className="relative cursor-pointer bg-white rounded-md font-medium text-brand hover:text-brand-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand"
                                        >
                                            <span>Upload a file</span>
                                            <input id="image-upload" name="image" type="file" className="sr-only" onChange={handleChange} accept="image/*" />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                </div>
                            </div>
                        </div>



                        <div className="pt-5 border-t border-gray-200">
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-brand-foreground bg-brand hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand"
                                >
                                    {loading ? 'Submitting...' : 'Submit Report'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div >
        </div >
    );
};

export default ReportItem;
