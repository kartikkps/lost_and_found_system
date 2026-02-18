import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, LogOut, User, Flag } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                        <span className="text-2xl font-bold text-brand">
                            Lost & Found
                        </span>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/browse" className="text-gray-600 hover:text-brand transition-colors flex items-center gap-2">
                            <Search size={18} />
                            Browse Items
                        </Link>

                        {user ? (
                            <>
                                <Link to="/report" className="text-gray-600 hover:text-brand transition-colors flex items-center gap-2">
                                    <Flag size={18} />
                                    Report Item
                                </Link>
                                <Link to="/dashboard" className="text-gray-600 hover:text-brand transition-colors flex items-center gap-2">
                                    <User size={18} />
                                    Dashboard
                                </Link>
                                <button
                                    onClick={logout}
                                    className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-gray-600 hover:text-brand font-medium">
                                    Log in
                                </Link>
                                <Link to="/register" className="px-5 py-2.5 rounded-full bg-brand text-brand-foreground font-medium hover:bg-brand-hover transition-shadow shadow-md hover:shadow-lg">
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
