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
                setBooks(booksRes.data.results || booksRes.data);
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
            <div style={styles.header}>
                <h1 style={styles.title}>Issues</h1>
                {isLibrarian && (
                    <button style={styles.addBtn} onClick={() => setShowModal(true)}>
                        + Issue Book
                    </button>
                )}
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
                                        <span style={styles.fine}>Rs.{issue.fine_amount}</span>
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

            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>Issue Book</h2>
                            <button style={styles.closeBtn} onClick={() => setShowModal(false)}>
                                X
                            </button>
                        </div>
                        <form onSubmit={handleIssueSubmit} style={styles.form}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Select Student *</label>
                                <select
                                    name="student"
                                    value={issueForm.student}
                                    onChange={handleIssueFormChange}
                                    style={styles.input}
                                    required
                                >
                                    <option value="">Select Student</option>
                                    {students.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.full_name} - {s.roll_number}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Select Book *</label>
                                <select
                                    name="book"
                                    value={issueForm.book}
                                    onChange={handleIssueFormChange}
                                    style={styles.input}
                                    required
                                >
                                    <option value="">Select Book</option>
                                    {books.filter((b) => b.is_available).map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.title} - {b.available_copies} copies
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Notes (optional)</label>
                                <textarea
                                    name="notes"
                                    value={issueForm.notes}
                                    onChange={handleIssueFormChange}
                                    style={styles.textarea}
                                    rows={3}
                                    placeholder="Any notes..."
                                />
                            </div>

                            <div style={styles.infoBox}>
                                Due date will be set to <strong>14 days</strong> from today
                            </div>

                            <div style={styles.modalButtons}>
                                <button
                                    type="button"
                                    style={styles.cancelBtn}
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" style={styles.submitBtn}>
                                    Issue Book
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container:      { padding: '30px', maxWidth: '1200px', margin: '0 auto' },
    loading:        { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: '#2c3e50' },
    header:         { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title:          { fontSize: '28px', color: '#2c3e50', margin: '0' },
    addBtn:         { backgroundColor: '#3498db', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', fontSize: '14px', cursor: 'pointer' },
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
    modalOverlay:   { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal:          { backgroundColor: 'white', padding: '30px', borderRadius: '10px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' },
    modalHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    modalTitle:     { fontSize: '22px', color: '#2c3e50', margin: '0' },
    closeBtn:       { backgroundColor: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#7f8c8d' },
    form:           { display: 'flex', flexDirection: 'column', gap: '15px' },
    inputGroup:     { display: 'flex', flexDirection: 'column', gap: '5px' },
    label:          { fontSize: '14px', fontWeight: 'bold', color: '#2c3e50' },
    input:          { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' },
    textarea:       { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', resize: 'vertical' },
    infoBox:        { backgroundColor: '#eaf4fb', padding: '10px 15px', borderRadius: '5px', fontSize: '14px', color: '#2980b9' },
    modalButtons:   { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' },
    cancelBtn:      { backgroundColor: '#95a5a6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' },
    submitBtn:      { backgroundColor: '#3498db', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' },
};

export default Issues;