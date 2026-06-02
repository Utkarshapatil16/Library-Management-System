import API from './axios';

// Get all books
export const getBooks = (params) => {
    return API.get('/books/', { params });
};

// Get single book
export const getBook = (id) => {
    return API.get(`/books/${id}/`);
};

// Add new book (admin/librarian only)
export const addBook = (data) => {
    return API.post('/books/', data);
};

// Update book (admin/librarian only)
export const updateBook = (id, data) => {
    return API.put(`/books/${id}/`, data);
};

// Delete book (admin/librarian only)
export const deleteBook = (id) => {
    return API.delete(`/books/${id}/`);
};

// Get book statistics
export const getBookStats = () => {
    return API.get('/books/stats/');
};

// Get all categories
export const getCategories = () => {
    return API.get('/books/categories/');
};

// Add category
export const addCategory = (data) => {
    return API.post('/books/categories/', data);
};

// Get all authors
export const getAuthors = () => {
    return API.get('/books/authors/');
};

// Add author
export const addAuthor = (data) => {
    return API.post('/books/authors/', data);
};