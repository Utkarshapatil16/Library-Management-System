import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isLibrarian = user?.role === 'admin' || user?.role === 'librarian';

    return (
        <nav style={styles.nav}>
            <div style={styles.logo}>
                📚 Library Management
            </div>

            <div style={styles.links}>
                <Link to="/dashboard" style={styles.link}>
                    Dashboard
                </Link>
                <Link to="/books" style={styles.link}>
                    Books
                </Link>
                {isLibrarian && (
                    <Link to="/issues" style={styles.link}>
                        Issues
                    </Link>
                )}
                <Link to="/profile" style={styles.link}>
                    Profile
                </Link>
            </div>

            <div style={styles.userSection}>
                <span style={styles.userName}>
                    👤 {user?.full_name}
                </span>
                <span style={styles.role}>
                    ({user?.role})
                </span>
                <button
                    onClick={handleLogout}
                    style={styles.logoutBtn}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

const styles = {
    nav: {
        display:         'flex',
        justifyContent:  'space-between',
        alignItems:      'center',
        backgroundColor: '#2c3e50',
        padding:         '15px 30px',
        color:           'white',
    },
    logo: {
        fontSize:   '20px',
        fontWeight: 'bold',
        color:      'white',
    },
    links: {
        display: 'flex',
        gap:     '20px',
    },
    link: {
        color:          'white',
        textDecoration: 'none',
        fontSize:       '16px',
        padding:        '5px 10px',
        borderRadius:   '5px',
    },
    userSection: {
        display:    'flex',
        alignItems: 'center',
        gap:        '10px',
    },
    userName: {
        color:    'white',
        fontSize: '14px',
    },
    role: {
        color:    '#95a5a6',
        fontSize: '12px',
    },
    logoutBtn: {
        backgroundColor: '#e74c3c',
        color:           'white',
        border:          'none',
        padding:         '8px 15px',
        borderRadius:    '5px',
        cursor:          'pointer',
        fontSize:        '14px',
    },
};

export default Navbar;