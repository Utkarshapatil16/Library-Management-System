import React, { useState, useEffect } from 'react';
import { getIssues, issueBook, returnBook, renewBook } from '../api/issues';
import { getBooks } from '../api/books';
import { getStudents } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Issues = () => {
    const { user }                  = useAuth();
    const [issues, setIssues]       = useState([]);
    const [books, setBooks]         = useState([]);
    const [students, setStudents]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [filter, setFilter]       = useState('');
    const [showModal, setShowModal] = useState(false);
    const [issueForm, setIssueForm] = useState({
        book:    '',
        student: '',
        notes:   '',
    });

    const isLibrarian = user?.role === 'admin' || user?.role === 'librarian';

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        try {
            const issuesRes = await getIssues();
            setIssues(issuesRes.data.results || issuesRes.data);

            if (isLibrarian) {
                const [booksRes, studentsRes] = await Promise.all([
                    getBooks(),
                    getStudents(),
                ]);
                setBooks(booksRes.data.results       || booksRes.data);
                setStudents(studentsRes.data.results || studentsRes.data);
            }
        } catch (err) {
            toast.error('Failed to load data.');
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

    const handleIssueFormChange = (e) => {
        setIssueForm({ ...issueForm, [e.target.name]: e.target.value });
    };

    const handleIssueSubmit = async (e) => {
        e.preventDefault();
        try {
            await issueBook({
                book:    parseInt(issueForm.book),
                student: parseInt(issueForm.student),
                notes:   issueForm.notes,
            });
            toast.success('Book issued successfully!');
            setShowModal(false);
            setIssueForm({ book: '', student: '', notes: '' });
            loadAll();
        } catch (err) {
            const errors = err.response?.data;
            if (errors) {
                Object.keys(errors).forEach((key) => {
                    toast.error(`${key}: ${errors[key]}`);
                });
            } else {
                toast.error('Failed to issue book.');
            }
        }
    };

    const handleReturn = async (id) => {
        if (!window.confirm('Confirm book return?')) return;
        try {
            await returnBook(id, { fine_paid: false });
            toast.success('Book returned successfully!');
            loadAll();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to return.');
        }
    };

    const handleRenew = async (id) => {
        try {
            await renewBook(id, { days: 14 });
            toast.success('Book renewed for 14 more days!');
            loadAll();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to renew.');
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

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.title}>📋 Issues</h1>
                {isLibrarian && (
                    <button
                        style={styles.addBtn}
                        onClick={() => setShowModal(true)}
                    >
                        + Issue Book
                    </button>
                )}
            </div>

            {/* Filter Buttons */}
            <div style={styles.filters}>
                {['', 'issued', 'returned', 'overdue', 'renewed'].map(
                    (status) => (
                        <button
                            key={status}
                            style={{
                                ...styles.filterBtn,
                                backgroundColor:
                                    filter === status ? '#2c3e50' : '#ecf0f1',
                                color:
                                    filter === status ? 'white' : '#2c3e50',
                            }}
                            onClick={() => handleFilter(status)}
                        >
                            {status === '' ? 'All' : status}
                        </button>
                    )
                )}
            </div>

            <p style={styles.count}>Total: {issues.length} issues</p>

            {/* Table */}
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
                                    <strong>
                                        {issue.book_detail?.title}
                                    </strong>
                                </td>
                                <td style={styles.td}>
                                    {issue.issue_date}
                                </td>
                                <td style={styles.td}>
                                    {issue.due_date}
                                </td>
                                <td style={styles.td}>
                                    {issue.return_date || '-'}
                                </td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.badge,
                                        backgroundColor:
                                            getStatusColor(issue.status),
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
                                    {issue.status !== 'returned' &&
                                        isLibrarian && (
                                        <button
                                            style={styles.returnBtn}
                                            onClick={() =>
                                                handleReturn(issue.id)
                                            }
                                        >
                                            Return
                                        </button>
                                    )}
                                    {issue.status !== 'returned' &&
                                        issue.renewal_count < 2 && (
                                        <button
                                            style={styles.renewBtn}
                                            onClick={() =>
                                                handleRenew(issue.id)
                                            }
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

            {/* Issue Book Modal */}
            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>
                                📖 Issue Book
                            </h2>
                            <button
                                style={styles.closeBtn}
                                onClick={() => setShowModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <form
                            onSubmit={handleIssueSubmit}
                            style={styles.form}
                        >
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Select Student *
                                </label>
                                <select
                                    name="student"
                                    value={issueForm.student}
                                    onChange={handleIssueFormChange}
                                    style={styles.input}
                                    required
                                >
                                    <option value="">
                                        Select Student
                                    </option>
                                    {students.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.full_name} — {s.roll_number}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Select Book *
                                </label>
                                <select
                                    name="book"
                                    value={issueForm.book}
                                    onChange={handleIssueFormChange}
                                    style={styles.input}
                                    required
                                >
                                    <option value="">Select Book</option>
                                    {books
                                        .filter((b) => b.is_available)
                                        .map((b) => (
                                            <option
                                                key={b.id}
                                                value={b.id}
                                            >
                                                {b.title} —{' '}
                                                {b.available_copies} copies
                                            </option>
                                        ))}