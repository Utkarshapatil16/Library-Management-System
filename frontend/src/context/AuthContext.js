import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { login as loginAPI, logout as logoutAPI } from '../api/auth';

// Create context
const AuthContext = createContext();

// Auth Provider
export const AuthProvider = ({ children }) => {
    const [user, setUser]     = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on app start
    useEffect(() => {
        const token = localStorage.getItem('access');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check if token is expired
                if (decoded.exp * 1000 > Date.now()) {
                    setUser(decoded);
                } else {
                    localStorage.clear();
                }
            } catch (err) {
                localStorage.clear();
            }
        }
        setLoading(false);
    }, []);

    // Login function
    const login = async (email, password) => {
        const res = await loginAPI({ email, password });
        localStorage.setItem('access',  res.data.access);
        localStorage.setItem('refresh', res.data.refresh);
        const decoded = jwtDecode(res.data.access);
        setUser(decoded);
        return res.data;
    };

    // Logout function
    const logout = async () => {
        try {
            const refresh = localStorage.getItem('refresh');
            await logoutAPI({ refresh });
        } catch (err) {
            console.log(err);
        }
        localStorage.clear();
        setUser(null);
    };

    // Check if user is admin or librarian
    const isLibrarian = () => {
        return user?.role in ['admin', 'librarian'];
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            isLibrarian,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth
export const useAuth = () => {
    return useContext(AuthContext);
};

export default AuthContext;