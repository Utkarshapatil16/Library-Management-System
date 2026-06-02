import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
    const [formData, setFormData] = useState({
        email:    '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const { login }             = useAuth();
    const navigate              = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(formData.email, formData.password);
            toast.success('Login successful!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(
                err.response?.data?.detail ||
                'Login failed. Check email and password.'
            );
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
                    <h2 style={styles.title}>Library Management</h2>
                    <p style={styles.subtitle}>Sign in to your account</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={styles.form}>
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

                    {/* Password */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
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
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Register Link */}
                <p style={styles.registerText}>
                    Don't have an account?{' '}
                    <Link to="/register" style={styles.registerLink}>
                        Register here
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
    },
    card: {
        backgroundColor: 'white',
        padding:         '40px',
        borderRadius:    '10px',
        boxShadow:       '0 4px 20px rgba(0,0,0,0.1)',
        width:           '100%',
        maxWidth:        '400px',
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
        fontSize:   '24px',
        color:      '#2c3e50',
        margin:     '0',
    },
    subtitle: {
        color:    '#7f8c8d',
        fontSize: '14px',
    },
    form: {
        display:       'flex',
        flexDirection: 'column',
        gap:           '20px',
    },
    inputGroup: {
        display:       'flex',
        flexDirection: 'column',
        gap:           '5px',
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
    registerText: {
        textAlign:  'center',
        marginTop:  '20px',
        fontSize:   '14px',
        color:      '#7f8c8d',
    },
    registerLink: {
        color:          '#3498db',
        textDecoration: 'none',
        fontWeight:     'bold',
    },
};

export default Login;