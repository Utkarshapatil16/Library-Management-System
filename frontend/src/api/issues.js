import API from './axios';

// Get all issues
export const getIssues = (params) => {
    return API.get('/issues/', { params });
};

// Get single issue
export const getIssue = (id) => {
    return API.get(`/issues/${id}/`);
};

// Issue a book (admin/librarian only)
export const issueBook = (data) => {
    return API.post('/issues/', data);
};

// Return a book (admin/librarian only)
export const returnBook = (id, data) => {
    return API.post(`/issues/${id}/return/`, data);
};

// Renew a book
export const renewBook = (id, data) => {
    return API.post(`/issues/${id}/renew/`, data);
};

// Get issue statistics
export const getIssueStats = () => {
    return API.get('/issues/stats/');
};