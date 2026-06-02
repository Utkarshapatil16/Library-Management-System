import React, { useState, useEffect } from 'react';
import {
    getBooks, addBook, updateBook,
    deleteBook, getCategories, getAuthors,
} from '../api/books';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Books = () => {
    const { user }                    = useAuth();
    const [books, setBooks]           = useState([]);
    const [categories, setCategories] = useState([]);
    const [authors, setAuthors]       = useState([]);
    const [loading, setLoading]       = useState(true);
    const [search, setSearch]         = useState('');
    const [showModal, setShowModal]   = useState(false);
    const [editBook, setEditBook]     = useState(null);
    const [bookForm, setBookForm]     = useState({
        title:            '',
        isbn:             '',
        publisher:        '',
        published_date:   '',
        description:      '',
        total_copies:     1,
        available_copies: 1,
        location:         '',
        language:         'English',
        pages:            '',
        category_id:      '',
        author_ids:       [],
    });

    const isLibrarian = user?.role === 'admin' || user?.role === 'librarian';

    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        try {
            const [booksRes, catsRes, authsRes] = await Promise.all([
                getBooks(),
                getCategories(),
                getAuthors(),
            ]);
            setBooks(booksRes.data.results     || booksRes.data);
            setCategories(catsRes.data.results || catsRes.data);
            setAuthors(authsRes.data.results   || authsRes.data);
        } catch (err) {
            toast.error('Failed to load data.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        setSearch(e.target.value);
        try {
            const res = await getBooks({ search: e.target.value });
            setBooks(res.data.results || res.data);
        } catch (err) {
            toast.error('Search failed.');
        }
    };

    const handleBookFormChange = (e) => {
        setBookForm({ ...bookForm, [e.target.name]: e.target.value });
    };

    const handleAuthorSelect = (e) => {
        const selected = Array.from(
            e.target.selectedOptions,
            (option) => parseInt(option.value)
        );
        setBookForm({ ...bookForm, author_ids: selected });
    };

    const handleOpenModal = (book = null) => {
        if (book) {
            setEditBook(book);
            setBookForm({
                title:            book.title,
                isbn:             book.isbn,
                publisher:        book.publisher        || '',
                published_date:   book.published_date   || '',
                description:      book.description      || '',
                total_copies:     book.total_copies,
                available_copies: book.available_copies,
                location:         book.location         || '',
                language:         book.language         || 'English',
                pages:            book.pages            || '',
                category_id:      book.category?.id     || '',
                author_ids:       book.authors?.map((a) => a.id) || [],
            });
        } else {
            setEditBook(null);
            setBookForm({
                title: '', isbn: '', publisher: '',
                published_date: '', description: '',
                total_copies: 1, available_copies: 1,
                location: '', language: 'English',
                pages: '', category_id: '', author_ids: [],
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditBook(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editBook) {
                await updateBook(editBook.id, bookForm);
                toast.success('Book updated successfully!');
            } else {
                await addBook(bookForm);
                toast.success('Book added successfully!');
            }
            handleCloseModal();
            loadAll();
        } catch (err) {
            const errors = err.response?.data;
            if (errors) {
                Object.keys(errors).forEach((key) => {
                    toast.error(`${key}: ${errors[key]}`);
                });
            } else {
                toast.error('Failed to save book.');
            }
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this book?')) return;
        try {
            await deleteBook(id);
            toast.success('Book deleted!');
            loadAll();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to delete.');
        }
    };

    if (loading) {
        return (
            <div style={styles.loading}>
                <h2>Loading Books...</h2>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.title}>📚 Books</h1>
                {isLibrarian && (
                    <button
                        style={styles.addBtn}
                        onClick={() => handleOpenModal()}
                    >
                        + Add Book
                    </button>
                )}
            </div>

            {/* Search */}
            <input
                type="text"
                placeholder="🔍 Search by title, author, ISBN..."
                value={search}
                onChange={handleSearch}
                style={styles.searchInput}
            />

            <p style={styles.count}>Total: {books.length} books</p>

            {/* Table */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>Title</th>
                            <th style={styles.th}>Author</th>
                            <th style={styles.th}>Category</th>
                            <th style={styles.th}>ISBN</th>
                            <th style={styles.th}>Available</th>
                            <th style={styles.th}>Total</th>
                            <th style={styles.th}>Status</th>
                            {isLibrarian && (
                                <th style={styles.th}>Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {books.map((book) => (
                            <tr key={book.id} style={styles.tableRow}>
                                <td style={styles.td}>
                                    <strong>{book.title}</strong>
                                </td>
                                <td style={styles.td}>
                                    {book.authors?.map(
                                        (a) => a.full_name
                                    ).join(', ')}
                                </td>
                                <td style={styles.td}>
                                    {book.category?.name || '-'}
                                </td>
                                <td style={styles.td}>{book.isbn}</td>
                                <td style={styles.td}>
                                    {book.available_copies}
                                </td>
                                <td style={styles.td}>
                                    {book.total_copies}
                                </td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.badge,
                                        backgroundColor: book.is_available
                                            ? '#2ecc71' : '#e74c3c',
                                    }}>
                                        {book.is_available
                                            ? 'Available'
                                            : 'Not Available'}
                                    </span>
                                </td>
                                {isLibrarian && (
                                    <td style={styles.td}>
                                        <button
                                            style={styles.editBtn}
                                            onClick={() =>
                                                handleOpenModal(book)
                                            }
                                        >
                                            Edit
                                        </button>
                                        <button
                                            style={styles.deleteBtn}
                                            onClick={() =>
                                                handleDelete(book.id)
                                            }
                                        >
                                            Delete
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {books.length === 0 && (
                    <div style={styles.noData}>
                        <p>No books found!</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>
                                {editBook ? 'Edit Book' : 'Add New Book'}
                            </h2>
                            <button
                                style={styles.closeBtn}
                                onClick={handleCloseModal}
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} style={styles.form}>

                            {/* Title */}
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={bookForm.title}
                                    onChange={handleBookFormChange}
                                    style={styles.input}
                                    required
                                />
                            </div>

                            {/* ISBN and Publisher */}
                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>ISBN *</label>
                                    <input
                                        type="text"
                                        name="isbn"
                                        value={bookForm.isbn}
                                        onChange={handleBookFormChange}
                                        style={styles.input}
                                        required
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Publisher</label>
                                    <input
                                        type="text"
                                        name="publisher"
                                        value={bookForm.publisher}
                                        onChange={handleBookFormChange}
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            {/* Published Date and Location */}
                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>
                                        Published Date
                                    </label>
                                    <input
                                        type="date"
                                        name="published_date"
                                        value={bookForm.published_date}
                                        onChange={handleBookFormChange}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>
                                        Shelf Location
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={bookForm.location}
                                        onChange={handleBookFormChange}
                                        style={styles.input}
                                        placeholder="e.g. Shelf A1"
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Category</label>
                                <select
                                    name="category_id"
                                    value={bookForm.category_id}
                                    onChange={handleBookFormChange}
                                    style={styles.input}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Authors */}
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Authors (Ctrl + click for multiple)
                                </label>
                                <select
                                    multiple
                                    value={bookForm.author_ids}
                                    onChange={handleAuthorSelect}
                                    style={{ ...styles.input, height: '100px' }}
                                >
                                    {authors.map((author) => (
                                        <option
                                            key={author.id}
                                            value={author.id}
                                        >
                                            {author.full_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Total and Available Copies */}
                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>
                                        Total Copies
                                    </label>
                                    <input
                                        type="number"
                                        name="total_copies"
                                        value={bookForm.total_copies}
                                        onChange={handleBookFormChange}
                                        style={styles.input}
                                        min="1"
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>
                                        Available Copies
                                    </label>
                                    <input
                                        type="number"
                                        name="available_copies"
                                        value={bookForm.available_copies}
                                        onChange={handleBookFormChange}
                                        style={styles.input}
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Language and Pages */}
                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Language</label>
                                    <input
                                        type="text"
                                        name="language"
                                        value={bookForm.language}
                                        onChange={handleBookFormChange}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Pages</label>
                                    <input
                                        type="number"
                                        name="pages"
                                        value={bookForm.pages}
                                        onChange={handleBookFormChange}
                                        style={styles.input}
                                        min="1"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Description</label>
                                <textarea
                                    name="description"
                                    value={bookForm.description}
                                    onChange={handleBookFormChange}
                                    style={styles.textarea}
                                    rows={3}
                                />
                            </div>

                            {/* Buttons */}
                            <div style={styles.modalButtons}>
                                <button
                                    type="button"
                                    style={styles.cancelBtn}
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={styles.submitBtn}
                                >
                                    {editBook ? 'Update Book' : 'Add Book'}
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
    addBtn:         { backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', fontSize: '14px', cursor: 'pointer' },
    searchInput:    { width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', marginBottom: '15px', boxSizing: 'border-box' },
    count:          { color: '#7f8c8d', marginBottom: '10px', fontSize: '14px' },
    tableContainer: { overflowX: 'auto', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
    table:          { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' },
    tableHeader:    { backgroundColor: '#2c3e50', color: 'white' },
    th:             { padding: '15px', textAlign: 'left', fontSize: '14px' },
    tableRow:       { borderBottom: '1px solid #ecf0f1' },
    td:             { padding: '12px 15px', fontSize: '14px', color: '#2c3e50' },
    badge:          { color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' },
    editBtn:        { backgroundColor: '#3498db', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer', marginRight: '5px', fontSize: '12px' },
    deleteBtn:      { backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' },
    noData:         { textAlign: 'center', padding: '40px', color: '#7f8c8d' },
    modalOverlay:   { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal:          { backgroundColor: 'white', padding: '30px', borderRadius: '10px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' },
    modalHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    modalTitle:     { fontSize: '22px', color: '#2c3e50', margin: '0' },
    closeBtn:       { backgroundColor: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#7f8c8d' },
    form:           { display: 'flex', flexDirection: 'column', gap: '15px' },
    row:            { display: 'flex', gap: '15px' },
    inputGroup:     { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 },
    label:          { fontSize: '14px', fontWeight: 'bold', color: '#2c3e50' },
    input:          { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' },
    textarea:       { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', resize: 'vertical' },
    modalButtons:   { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' },
    cancelBtn:      { backgroundColor: '#95a5a6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' },
    submitBtn:      { backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' },
};

export default Books;