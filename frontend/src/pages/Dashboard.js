import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBookStats } from '../api/books';
import { getIssueStats } from '../api/issues';
import { toast } from 'react-toastify';

const Dashboard = () => {
    const { user }                        = useAuth();
    const [bookStats, setBookStats]       = useState(null);
    const [issueStats, setIssueStats]     = useState(null);
    const [loading, setLoading]           = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [bookRes, issueRes] = await Promise.all([
                getBookStats(),
                getIssueStats(),
            ]);
            setBookStats(bookRes.data);
            setIssueStats(issueRes.data);
        } catch (err) {
            toast.error('Failed to load statistics.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.loading}>
                <h2>Loading Dashboard...</h2>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Welcome Message */}
            <div style={styles.welcome}>
                <h1 style={styles.welcomeTitle}>
                    Welcome, {user?.full_name}! 👋
                </h1>
                <p style={styles.welcomeSubtitle}>
                    Role: {user?.role}
                </p>
            </div>

            {/* Book Statistics */}
            <h2 style={styles.sectionTitle}>📚 Book Statistics</h2>
            <div style={styles.statsGrid}>
                <div style={{...styles.statCard, backgroundColor: '#3498db'}}>
                    <h3 style={styles.statNumber}>
                        {bookStats?.total_books}
                    </h3>
                    <p style={styles.statLabel}>Total Books</p>
                </div>
                <div style={{...styles.statCard, backgroundColor: '#2ecc71'}}>
                    <h3 style={styles.statNumber}>
                        {bookStats?.available_books}
                    </h3>
                    <p style={styles.statLabel}>Available Books</p>
                </div>
                <div style={{...styles.statCard, backgroundColor: '#e74c3c'}}>
                    <h3 style={styles.statNumber}>
                        {bookStats?.borrowed_copies}
                    </h3>
                    <p style={styles.statLabel}>Borrowed Books</p>
                </div>
                <div style={{...styles.statCard, backgroundColor: '#9b59b6'}}>
                    <h3 style={styles.statNumber}>
                        {bookStats?.total_categories}
                    </h3>
                    <p style={styles.statLabel}>Categories</p>
                </div>
            </div>

            {/* Issue Statistics */}
            <h2 style={styles.sectionTitle}>📋 Issue Statistics</h2>
            <div style={styles.statsGrid}>
                <div style={{...styles.statCard, backgroundColor: '#f39c12'}}>
                    <h3 style={styles.statNumber}>
                        {issueStats?.total_issues}
                    </h3>
                    <p style={styles.statLabel}>Total Issues</p>
                </div>
                <div style={{...styles.statCard, backgroundColor: '#1abc9c'}}>
                    <h3 style={styles.statNumber}>
                        {issueStats?.active_issues}
                    </h3>
                    <p style={styles.statLabel}>Active Issues</p>
                </div>
                <div style={{...styles.statCard, backgroundColor: '#e74c3c'}}>
                    <h3 style={styles.statNumber}>
                        {issueStats?.overdue_issues}
                    </h3>
                    <p style={styles.statLabel}>Overdue Issues</p>
                </div>
                <div style={{...styles.statCard, backgroundColor: '#2ecc71'}}>
                    <h3 style={styles.statNumber}>
                        {issueStats?.returned_today}
                    </h3>
                    <p style={styles.statLabel}>Returned Today</p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding:   '30px',
        maxWidth:  '1200px',
        margin:    '0 auto',
    },
    loading: {
        display:        'flex',
        justifyContent: 'center',
        alignItems:     'center',
        height:         '80vh',
        color:          '#2c3e50',
    },
    welcome: {
        backgroundColor: '#2c3e50',
        color:           'white',
        padding:         '30px',
        borderRadius:    '10px',
        marginBottom:    '30px',
    },
    welcomeTitle: {
        fontSize: '28px',
        margin:   '0 0 10px 0',
    },
    welcomeSubtitle: {
        fontSize: '16px',
        margin:   '0',
        opacity:  '0.8',
    },
    sectionTitle: {
        fontSize:     '20px',
        color:        '#2c3e50',
        marginBottom: '15px',
    },
    statsGrid: {
        display:             'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap:                 '20px',
        marginBottom:        '30px',
    },
    statCard: {
        padding:      '25px',
        borderRadius: '10px',
        color:        'white',
        textAlign:    'center',
        boxShadow:    '0 4px 15px rgba(0,0,0,0.1)',
    },
    statNumber: {
        fontSize: '40px',
        margin:   '0 0 10px 0',
    },
    statLabel: {
        fontSize: '14px',
        margin:   '0',
        opacity:  '0.9',
    },
};

export default Dashboard;