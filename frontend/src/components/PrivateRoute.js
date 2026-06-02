import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    // Show loading while checking auth
    if (loading) {
        return (
            <div style={styles.loading}>
                <h2>Loading...</h2>
            </div>
        );
    }

    // If not logged in redirect to login page
    if (!user) {
        return <Navigate to="/login" />;
    }

    // If logged in show the page
    return children;
};

const styles = {
    loading: {
        display:        'flex',
        justifyContent: 'center',
        alignItems:     'center',
        height:         '100vh',
        fontSize:       '20px',
        color:          '#2c3e50',
    },
};

export default PrivateRoute;