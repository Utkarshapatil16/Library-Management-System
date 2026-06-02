import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import PrivateRoute     from './components/PrivateRoute';
import Navbar           from './components/Navbar';

import Login     from './pages/Login';
import Register  from './pages/Register';
import Dashboard from './pages/Dashboard';
import Books     from './pages/Books';
import Issues    from './pages/Issues';
import Profile   from './pages/Profile';

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login"    element={<Login />}    />
                    <Route path="/register" element={<Register />} />

                    {/* Private Routes */}
                    <Route path="/dashboard" element={
                        <PrivateRoute>
                            <Navbar />
                            <Dashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/books" element={
                        <PrivateRoute>
                            <Navbar />
                            <Books />
                        </PrivateRoute>
                    } />
                    <Route path="/issues" element={
                        <PrivateRoute>
                            <Navbar />
                            <Issues />
                        </PrivateRoute>
                    } />
                    <Route path="/profile" element={
                        <PrivateRoute>
                            <Navbar />
                            <Profile />
                        </PrivateRoute>
                    } />

                    {/* Default Route */}
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>

                {/* Toast Notifications */}
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    pauseOnHover
                />
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;