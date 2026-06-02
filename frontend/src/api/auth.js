import API from './axios';

// Register new student
export const register = (data) => {
    return API.post('/students/register/', data);
};

// Login
export const login = (data) => {
    return API.post('/students/login/', data);
};

// Logout
export const logout = (data) => {
    return API.post('/students/logout/', data);
};

// Get profile
export const getProfile = () => {
    return API.get('/students/profile/');
};

// Update profile
export const updateProfile = (data) => {
    return API.put('/students/profile/', data);
};

// Change password
export const changePassword = (data) => {
    return API.post('/students/change-password/', data);
};

// Get all students (admin/librarian only)
export const getStudents = () => {
    return API.get('/students/');
};