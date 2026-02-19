import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services/api';
import { Search, LogOut, User, Flag, MessageCircle, Menu, X, Settings } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                        <span className="text-2xl font-bold text-brand">
                            Lost & Found
                        </span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/browse" className="text-gray-600 hover:text-brand transition-colors flex items-center gap-2">
                            <Search size={18} />
                            Browse Items
                        </Link>
                          <Link to="/dashboard" className="text-gray-600 hover:text-brand transition-colors flex items-center gap-2">
                                    <MessageCircle size={18} className="transform rotate-90" /> {/* Using a different icon or explicit Dashboard icon */}
                                    Dashboard
                                </Link>

                        {user ? (
                            <>
                                <Link to="/report" className="text-gray-600 hover:text-brand transition-colors flex items-center gap-2">
                                    <Flag size={18} />
                                    Report Item
                                </Link>
                                <Link to="/chats" className="text-gray-600 hover:text-brand transition-colors flex items-center gap-2">
                                    <MessageCircle size={18} />
                                    Chats
                                </Link>
                         
                              
                                       <Link to="/profile" className="text-gray-600 hover:text-brand transition-colors flex items-center gap-2">
                                    {user.profile_image ? (
                                        <img
                                            src={`${API_BASE_URL.replace('/api', '')}/${user.profile_image}`}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                        />
                                    ) : (
                                        <User size={18} />
                                    )}
                                    Profile
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

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMenu}
                            className="text-gray-600 hover:text-brand focus:outline-none"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-lg">
                    <div className="px-4 pt-2 pb-4 space-y-2">
                        <Link
                            to="/browse"
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand hover:bg-gray-50"
                        >
                            <div className="flex items-center gap-2">
                                <Search size={18} />
                                Browse Items
                            </div>
                        </Link>

                        {user ? (
                            <>
                                <Link
                                    to="/report"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand hover:bg-gray-50"
                                >
                                    <div className="flex items-center gap-2">
                                        <Flag size={18} />
                                        Report Item
                                    </div>
                                </Link>
                                <Link
                                    to="/chats"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand hover:bg-gray-50"
                                >
                                    <div className="flex items-center gap-2">
                                        <MessageCircle size={18} />
                                        Chats
                                    </div>
                                </Link>
                                <Link
                                    to="/profile"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand hover:bg-gray-50"
                                >
                                    <div className="flex items-center gap-2">
                                        <User size={18} />
                                        Profile
                                    </div>
                                </Link>
                                <Link
                                    to="/dashboard"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand hover:bg-gray-50"
                                >
                                    <div className="flex items-center gap-2">
                                        <User size={18} />
                                        Dashboard
                                    </div>
                                </Link>
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand hover:bg-gray-50"
                                >
                                    <div className="flex items-center gap-2">
                                        <LogOut size={18} />
                                        Logout
                                    </div>
                                </button>
                            </>
                        ) : (
                            <div className="mt-4 flex flex-col space-y-2">
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block w-full text-center px-4 py-2 border border-transparent rounded-md bg-brand text-brand-foreground font-medium hover:bg-brand-hover shadow-md"
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
