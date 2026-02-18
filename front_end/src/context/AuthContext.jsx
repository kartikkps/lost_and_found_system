import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            try {
                const response = await authService.getCurrentUser();
                if (response.data.user) {
                    setUser(response.data.user);
                    localStorage.setItem('user', JSON.stringify(response.data.user)); 
                }
            } catch (error) {
                
                setUser(null);
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };
        checkUserLoggedIn();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await authService.login({ email, password });
            const { user } = response.data;

            setUser(user);
            localStorage.setItem('user', JSON.stringify(user));
            return { success: true };
        } catch (error) {
            console.error("Login error:", error);
            return {
                success: false,
                message: error.response?.data?.error || 'Login failed' 
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authService.register(userData);
          
            return { success: true };
        } catch (error) {
            console.error("Registration error:", error);
            return {
                success: false,
                message: error.response?.data?.error || 'Registration failed'
            };
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
            localStorage.removeItem('user');
            window.location.href = '/'; 
        } catch (error) {
            console.error("Logout failed", error);
            
            setUser(null);
            localStorage.removeItem('user');
            window.location.href = '/';
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
