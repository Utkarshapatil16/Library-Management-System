import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../api/auth';
import { toast } from 'react-toastify';

const Profile = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);

    const [profileData, setProfileData] = useState({
        first_name: user?.first_name || '',
        last_name:  user?.last_name  || '',
        phone:      user?.phone      || '',
        address:    user?.address    || '',
        department: user?.department || '',
    });

    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm:      '',
    });

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile(profileData);
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm) {
            toast.error('New passwords do not match!');
            return;
        }
        setLoading(true);
        try {
            await changePassword({
                old_password: passwordData.old_password,
                new_password: passwordData.new_password,
            });
            toast.success('Password changed successfully!');
            setPasswordData({ old_password: '', new_password: '', confirm: '' });
        } catch (err) {
            toast.error('Failed to change password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.profileHeader}>
                <div style={styles.avatar}>
                    {user?.full_name?.charAt(0).toUpperCase()}
                </div>
                <div style={styles.profileInfo}>
                    <h2 style={styles.profileName}>{user?.full_name}</h2>
                    <p style={styles.profileEmail}>{user?.email}</p>
                    <span style={styles.roleBadge}>{user?.role}</span>
                </div>
            </div>

            <div style={styles.tabs}>
                <button
                    style={{
                        ...styles.tab,
                        borderBottom: activeTab === 'profile' ? '3px solid #2c3e50' : '3px solid transparent',
                        color: activeTab === 'profile' ? '#2c3e50' : '#7f8c8d',
                    }}
                    onClick={() => setActiveTab('profile')}
                >
                    Edit Profile
                </button>
                <button
                    style={{
                        ...styles.tab,
                        borderBottom: activeTab === 'password' ? '3px solid #2c3e50' : '3px solid transparent',
                        color: activeTab === 'password' ? '#2c3e50' : '#7f8c8d',
                    }}
                    onClick={() => setActiveTab('password')}
                >
                    Change Password
                </button>
            </div>

            {activeTab === 'profile' && (
                <div style={styles.card}>
                    <form onSubmit={handleProfileSubmit} style={styles.form}>
                        <div style={styles.row}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>First Name</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={profileData.first_name}
                                    onChange={handleProfileChange}
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Last Name</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={profileData.last_name}
                                    onChange={handleProfileChange}
                                    style={styles.input}
                                />
                            </div>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Phone</label>
                            <input
                                type="text"
                                name="phone"
                                value={profileData.phone}
                                onChange={handleProfileChange}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Department</label>
                            <input
                                type="text"
                                name="department"
                                value={profileData.department}
                                onChange={handleProfileChange}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Address</label>
                            <textarea
                                name="address"
                                value={profileData.address}
                                onChange={handleProfileChange}
                                style={styles.textarea}
                                rows={3}
                            />
                        </div>
                        <button
                            type="submit"
                            style={styles.button}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'password' && (
                <div style={styles.card}>
                    <form onSubmit={handlePasswordSubmit} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Old Password</label>
                            <input
                                type="password"
                                name="old_password"
                                value={passwordData.old_password}
                                onChange={handlePasswordChange}
                                style={styles.input}
                                required
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>New Password</label>
                            <input
                                type="password"
                                name="new_password"
                                value={passwordData.new_password}
                                onChange={handlePasswordChange}
                                style={styles.input}
                                required
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Confirm New Password</label>
                            <input
                                type="password"
                                name="confirm"
                                value={passwordData.confirm}
                                onChange={handlePasswordChange}
                                style={styles.input}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            style={styles.button}
                            disabled={loading}
                        >
                            {loading ? 'Changing...' : 'Change Password'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

const styles = {
    container:     { padding: '30px', maxWidth: '800px', margin: '0 auto' },
    profileHeader: { display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#2c3e50', padding: '30px', borderRadius: '10px', marginBottom: '20px', color: 'white' },
    avatar:        { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#3498db', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '36px', fontWeight: 'bold', color: 'white' },
    profileInfo:   { display: 'flex', flexDirection: 'column', gap: '5px' },
    profileName:   { fontSize: '24px', margin: '0' },
    profileEmail:  { fontSize: '14px', margin: '0', opacity: '0.8' },
    roleBadge:     { backgroundColor: '#3498db', color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', width: 'fit-content' },
    tabs:          { display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #ecf0f1' },
    tab:           { padding: '10px 20px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
    card:          { backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
    form:          { display: 'flex', flexDirection: 'column', gap: '20px' },
    row:           { display: 'flex', gap: '20px' },
    inputGroup:    { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 },
    label:         { fontSize: '14px', fontWeight: 'bold', color: '#2c3e50' },
    input:         { padding: '12px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' },
    textarea:      { padding: '12px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', resize: 'vertical' },
    button:        { backgroundColor: '#2c3e50', color: 'white', border: 'none', padding: '12px', borderRadius: '5px', fontSize: '16px', cursor: 'pointer' },
};

export default Profile;