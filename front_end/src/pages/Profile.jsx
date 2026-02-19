import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services/api';
import axios from 'axios';
import { User, Mail, Camera, Save, Loader } from 'lucide-react';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [name, setName] = useState(user?.username || '');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(user?.profile_image ? `${API_BASE_URL.replace('/api', '')}/${user.profile_image}` : null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('username', name);
        if (image) {
            formData.append('profile_image', image);
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/user/profile`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });

            if (response.data.user) {
                updateUser(response.data.user);
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
            }
        } catch (error) {
            console.error("Profile update error:", error);
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="text-center mt-20">Please log in to view this page.</div>;

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-indigo-50 to-purple-50 py-10 px-4">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-indigo-600 h-32 relative">
                    <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                                {preview ? (
                                    <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={48} className="text-gray-400" />
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-indigo-500 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-indigo-600 transition-colors">
                                <Camera size={18} />
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="pt-20 pb-8 px-8">
                    <h1 className="text-2xl font-bold text-center text-gray-800 mb-1">{user.username}</h1>
                    <p className="text-center text-gray-500 text-sm mb-6">{user.email}</p>

                    {message && (
                        <div className={`mb-4 p-3 rounded-lg text-sm text-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <User size={16} /> Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                                placeholder="Your Name"
                                required
                            />
                        </div>

                        <div className="space-y-2 opacity-60 pointer-events-none">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Mail size={16} /> Email Address
                            </label>
                            <input
                                type="email"
                                value={user.email}
                                disabled
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                            Save Changes
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
