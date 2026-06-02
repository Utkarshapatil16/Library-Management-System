import React, { useState, useEffect } from 'react';
import { getIssues, returnBook, renewBook } from '../api/issues';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Issues = () => {
    const { user }              = useAuth();
    const [issues, setIssues]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter]   = useState('');

    useEffect(() => {
        loadIssues();
    }, []);

    const loadIssues = async () => {
        try {
            const res = await getIssues();
            setIssues(res.data.results || res.data);
        } catch (err) {
            toast.error('Failed to load issues.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = async (status) => {
        setFilter(status);
        try {
            const res = await getIssues(status ? { status } : {});
            setIssues(res.data.results || res.data);
        } catch (err) {
            toast.error('Filter failed.');
        }
    };

    const handleReturn = async (id) => {
        if (!window.confirm('Confirm book return?')) return;
        try {
            await returnBook(id, { fine_paid: false });
            toast.success('Book returned successfully!');
            loadIssues();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to return book.');
        }
    };

    const handleRenew = async (id) => {
        try {
            await renewBook(id, { days: 14 });
            toast.success('Book renewed for 14 more days!');
            loadIssues();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to renew book.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'issued':   return '#3498db';
            case 'returned': return '#2ecc71';
            case 'overdue':  return '#e74c3c';
            case 'renewed':  return '#f39c12';
            default:         return '#95a5a6';
        }
    };

    if (loading) {
        return (
            <div style={styles.loading}>
                <h2>Loading Issues...</h2>
            </div>
        );
    }

    const isLibrarian = user?.role === 'admin' || user?.role === 'librarian';

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>📋 Issues</h1>
            </div>

            <div style={styles.filters}>
                {['', 'issued', 'returned', 'overdue', 'renewed'].map((status) => (
                    <button
                        key={status}
                        style={{
                            ...styles.filterBtn,
                            backgroundColor: filter === status ? '#2c3e50' : '#ecf0f1',
                            color: filter === status ? 'white' : '#2c3e50',
                        }}
                        onClick={() => handleFilter(status)}
                    >
                        {status === '' ? 'All' : status}
                    </button>
                ))}
            </div>

            <p style={styles.count}>Total: {issues.length} issues</p>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>Student</th>
                            <th style={styles.th}>Book</th>
                            <th style={styles.th}>Issue Date</th>
                            <th style={styles.th}>Due Date</th>
                            <th style={styles.th}>Return Date</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Fine</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {issues.map((issue) => (
                            <tr key={issue.id} style={styles.tableRow}>
                                <td style={styles.td}>
                                    {issue.student_detail?.full_name}
                                    <br />
                                    <small style={styles.small}>
                                        {issue.student_detail?.roll_number}
                                    </small>
                                </td>
                                <td style={styles.td}>
                                    <strong>{issue.book_detail?.title}</strong>
                                </td>
                                <td style={styles.td}>{issue.issue_date}</td>
                                <td style={styles.td}>{issue.due_date}</td>
                                <td style={styles.td}>{issue.return_date || '-'}</td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.badge,
                                        backgroundColor: getStatusColor(issue.status),
                                    }}>
                                        {issue.status}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    {issue.fine_amount > 0 ? (
                                        <span style={styles.fine}>
                                            ₹{issue.fine_amount}
                                        </span>
                                    ) : '-'}
                                </td>
                                <td style={styles.td}>
                                    {issue.status !== 'returned' && isLibrarian && (
                                        <button
                                            style={styles.returnBtn}
                                            onClick={() => handleReturn(issue.id)}
                                        >
                                            Return
                                        </button>
                                    )}
                                    {issue.status !== 'returned' && issue.renewal_count < 2 && (
                                        <button
                                            style={styles.renewBtn}
                                            onClick={() => handleRenew(issue.id)}
                                        >
                                            Renew
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {issues.length === 0 && (
                    <div style={styles.noData}>
                        <p>No issues found!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container:      { padding: '30px', maxWidth: '1200px', margin: '0 auto' },
    loading:        { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: '#2c3e50' },
    header:         { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title:          { fontSize: '28px', color: '#2c3e50', margin: '0' },
    filters:        { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
    filterBtn:      { padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
    count:          { color: '#7f8c8d', marginBottom: '10px', fontSize: '14px' },
    tableContainer: { overflowX: 'auto', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
    table:          { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' },
    tableHeader:    { backgroundColor: '#2c3e50', color: 'white' },
    th:             { padding: '15px', textAlign: 'left', fontSize: '14px' },
    tableRow:       { borderBottom: '1px solid #ecf0f1' },
    td:             { padding: '12px 15px', fontSize: '14px', color: '#2c3e50' },
    small:          { color: '#7f8c8d', fontSize: '12px' },
    badge:          { color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' },
    fine:           { color: '#e74c3c', fontWeight: 'bold' },
    returnBtn:      { backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer', marginRight: '5px', fontSize: '12px' },
    renewBtn:       { backgroundColor: '#f39c12', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' },
    noData:         { textAlign: 'center', padding: '40px', color: '#7f8c8d' },
};

export default Issues;