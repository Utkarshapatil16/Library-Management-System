import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';
import { toast } from 'react-toastify';

const Register = () => {
    const [formData, setFormData] = useState({
        email:      '',
        first_name: '',
        last_name:  '',
        roll_number: '',
        department: '',
        phone:      '',
        password:   '',
        password2:  '',
    });
    const [loading, setLoading] = useState(false);
    const navigate              = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.password2) {
            toast.error('Passwords do not match!');
            return;
        }
        setLoading(true);
        try {
            await register(formData);
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            const errors = err.response?.data;
            if (errors) {
                Object.keys(errors).forEach((key) => {
                    toast.error(`${key}: ${errors[key]}`);
                });
            } else {
                toast.error('Registration failed. Try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Header */}
                <div style={styles.header}>
                    <h1 style={styles.logo}>📚</h1>
                    <h2 style={styles.title}>Create Account</h2>
                    <p style={styles.subtitle}>
                        Register as a library member
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* First Name and Last Name */}
                    <div style={styles.row}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>
                                First Name
                            </label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                placeholder="First name"
                                style={styles.input}
                                required
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>
                                Last Name
                            </label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                placeholder="Last name"
                                style={styles.input}
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            style={styles.input}
                            required
                        />
                    </div>

                    {/* Roll Number and Department */}
                    <div style={styles.row}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>
                                Roll Number
                            </label>
                            <input
                                type="text"
                                name="roll_number"
                                value={formData.roll_number}
                                onChange={handleChange}
                                placeholder="Roll number"
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>
                                Department
                            </label>
                            <input
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                placeholder="Department"
                                style={styles.input}
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Phone</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Phone number"
                            style={styles.input}
                        />
                    </div>

                    {/* Password */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            style={styles.input}
                            required
                        />
                    </div>

                    {/* Confirm Password */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            name="password2"
                            value={formData.password2}
                            onChange={handleChange}
                            placeholder="Confirm password"
                            style={styles.input}
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        style={styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                {/* Login Link */}
                <p style={styles.loginText}>
                    Already have an account?{' '}
                    <Link to="/login" style={styles.loginLink}>
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display:         'flex',
        justifyContent:  'center',
        alignItems:      'center',
        minHeight:       '100vh',
        backgroundColor: '#f0f2f5',
        padding:         '20px',
    },
    card: {
        backgroundColor: 'white',
        padding:         '40px',
        borderRadius:    '10px',
        boxShadow:       '0 4px 20px rgba(0,0,0,0.1)',
        width:           '100%',
        maxWidth:        '500px',
    },
    header: {
        textAlign:    'center',
        marginBottom: '30px',
    },
    logo: {
        fontSize:     '50px',
        marginBottom: '10px',
    },
    title: {
        fontSize: '24px',
        color:    '#2c3e50',
        margin:   '0',
    },
    subtitle: {
        color:    '#7f8c8d',
        fontSize: '14px',
    },
    form: {
        display:       'flex',
        flexDirection: 'column',
        gap:           '15px',
    },
    row: {
        display: 'flex',
        gap:     '15px',
    },
    inputGroup: {
        display:       'flex',
        flexDirection: 'column',
        gap:           '5px',
        flex:          1,
    },
    label: {
        fontSize:   '14px',
        fontWeight: 'bold',
        color:      '#2c3e50',
    },
    input: {
        padding:      '12px',
        borderRadius: '5px',
        border:       '1px solid #ddd',
        fontSize:     '14px',
        outline:      'none',
    },
    button: {
        backgroundColor: '#2c3e50',
        color:           'white',
        border:          'none',
        padding:         '12px',
        borderRadius:    '5px',
        fontSize:        '16px',
        cursor:          'pointer',
        marginTop:       '10px',
    },
    loginText: {
        textAlign: 'center',
        marginTop: '20px',
        fontSize:  '14px',
        color:     '#7f8c8d',
    },
    loginLink: {
        color:          '#3498db',
        textDecoration: 'none',
        fontWeight:     'bold',
    },
};

export default Register;