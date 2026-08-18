import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getStudentProfile, updateStudentProfile } from '../../services/api';
import StudentNavbar from '../../components/student/StudentNavbar';

const StudentProfile = () => {
    const { username, logout } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '', email: '', phone_number: '', course: '', college: '',
    });

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            const data = await getStudentProfile();
            setProfile(data);
            setFormData({
                full_name: data.full_name || '',
                email: data.email || '',
                phone_number: data.phone_number || '',
                course: data.course || '',
                college: data.college || '',
            });
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load profile data.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) { setError('Please enter a valid email address.'); return; }
        if (formData.phone_number && !/^[+]?[\d\s()-]{7,15}$/.test(formData.phone_number)) {
            setError('Please enter a valid phone number (7-15 digits).'); return;
        }
        setSaving(true);
        try {
            const upData = await updateStudentProfile(formData);
            setProfile(upData);
            setSuccessMsg('Profile updated successfully!');
            setIsEditing(false);
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            full_name: profile?.full_name || '',
            email: profile?.email || '',
            phone_number: profile?.phone_number || '',
            course: profile?.course || '',
            college: profile?.college || '',
        });
        setIsEditing(false);
        setError('');
    };

    const displayName = profile?.full_name || profile?.username || 'Student';
    const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium tracking-wide">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            
            {/* ─── Premium Navbar ─── */}
            <StudentNavbar
                username={displayName}
                onLogout={handleLogout}
                avatarLabel={initials}
                avatarStyle="bg-blue-600 text-white"
            />

            {/* ─── Hero Banner ─── */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-600"></div>
                <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}></div>
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24">
                    <nav className="flex items-center gap-2 text-sm text-blue-200 mb-4">
                        <span className="hover:text-white cursor-pointer" onClick={() => navigate('/dashboard')}>Dashboard</span>
                        <span>›</span>
                        <span className="text-white font-medium">My Profile</span>
                    </nav>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Account Settings</h1>
                    <p className="text-blue-100 mt-1 text-sm">Manage your personal details and academic information</p>
                </div>
            </div>

            {/* ─── Main Content Card ─── */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-16 relative z-10">

                {/* Toasts */}
                {error && (
                    <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-sm animate-[fadeIn_0.3s_ease]">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </div>
                        <p className="text-sm text-red-700 font-medium flex-1">{error}</p>
                        <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
                    </div>
                )}
                {successMsg && (
                    <div className="mb-5 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 shadow-sm animate-[fadeIn_0.3s_ease]">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        <p className="text-sm text-green-700 font-medium flex-1">{successMsg}</p>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                    {/* ─── Profile Header ─── */}
                    <div className="relative bg-gray-50 px-4 py-6 sm:px-8 sm:py-8 border-b border-gray-100">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            {/* Avatar */}
                            <div className="relative group">
                                <div className="h-24 w-24 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-3xl shadow-sm">
                                    {initials}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-400 border-2 border-white shadow-sm"></div>
                            </div>
                            {/* Info */}
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{displayName}</h2>
                                <p className="text-gray-500 mt-0.5 text-sm">@{profile?.username}</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-100">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Active
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                                        Student
                                    </span>
                                    {profile?.college && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full border border-gray-200">
                                            {profile.college}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {/* Action */}
                            {!isEditing && (
                                <button
                                    onClick={() => { setIsEditing(true); setError(''); setSuccessMsg(''); }}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 hover:text-blue-600 transition-all duration-200"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ─── Content Body ─── */}
                    {!isEditing ? (
                        <div className="p-4 sm:p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {/* Personal Information */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                        Personal Information
                                    </h3>
                                    <div className="space-y-5">
                                        <ProfileField label="Full Name" value={profile?.full_name} />
                                        <ProfileField label="Email Address" value={profile?.email} icon={
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                                        }/>
                                        <ProfileField label="Phone Number" value={profile?.phone_number} icon={
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                                        }/>
                                    </div>
                                </div>

                                {/* Academic Information */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/></svg>
                                        Academic Information
                                    </h3>
                                    <div className="space-y-5">
                                        <ProfileField label="College / Organization" value={profile?.college} />
                                        <ProfileField label="Course / Program" value={profile?.course} />
                                    </div>
                                </div>
                            </div>

                            {/* Account Metadata */}
                            <div className="mt-10 pt-8 border-t border-gray-100">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                                    Account Information
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-gray-50 rounded-xl px-5 py-4 border border-gray-100">
                                        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Username</p>
                                        <p className="text-sm text-gray-700 font-mono mt-1.5">@{profile?.username}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl px-5 py-4 border border-slate-100">
                                        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Account ID</p>
                                        <p className="text-sm text-gray-700 font-mono mt-1.5 truncate" title={profile?.id}>{profile?.id}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl px-5 py-4 border border-slate-100">
                                        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Member Since</p>
                                        <p className="text-sm text-gray-700 mt-1.5">{new Date(profile?.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ─── Edit Mode ─── */
                        <form onSubmit={handleSave} className="p-4 sm:p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Edit Profile</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">Update your personal and academic information</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                <InputField label="Full Name" name="full_name" value={formData.full_name} onChange={handleInputChange} placeholder="Enter your full name" />
                                <InputField label="Email Address" name="email" value={formData.email} onChange={handleInputChange} type="email" required placeholder="you@example.com" />
                                <InputField label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handleInputChange} placeholder="+91 98765 43210" />
                                <InputField label="College / Organization" name="college" value={formData.college} onChange={handleInputChange} placeholder="Your university or organization" />
                                <div className="md:col-span-2">
                                    <InputField label="Course / Program" name="course" value={formData.course} onChange={handleInputChange} placeholder="B.Tech Computer Science, MBA, etc." />
                                </div>
                            </div>

                            {/* Read-only section */}
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Account Information (Read-Only)</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                                        <p className="text-[11px] text-gray-400 font-medium">Username</p>
                                        <p className="text-sm text-gray-600 font-mono mt-1">@{profile?.username}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                                        <p className="text-[11px] text-gray-400 font-medium">Account ID</p>
                                        <p className="text-sm text-gray-600 font-mono mt-1 truncate">{profile?.id}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                                <button type="button" onClick={handleCancel} className="px-6 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="px-8 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-sm transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {saving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin border-t-white"></div>
                                            Saving...
                                        </>
                                    ) : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>

            {/* ─── Footer ─── */}
            <footer className="border-t border-gray-200/60 bg-white/60 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <p className="text-[11px] text-gray-400 tracking-wide">© 2026 ExamGuard Global. All rights reserved.</p>
                    <p className="text-[11px] text-gray-400 tracking-wide">Crafted by <span className="font-medium text-gray-500">Om Chandrakant Deo</span></p>
                </div>
            </footer>
        </div>
    );
};

/* ─── Reusable Profile Field (View Mode) ─── */
const ProfileField = ({ label, value, icon }) => (
    <div className="group flex items-start gap-3 p-3.5 rounded-xl hover:bg-gray-50 transition-colors -mx-3.5">
        {icon && <div className="mt-0.5 flex-shrink-0">{icon}</div>}
        <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
            <p className={`text-sm mt-1 ${value ? 'text-gray-800 font-medium' : 'text-gray-300 italic'}`}>
                {value || 'Not provided'}
            </p>
        </div>
    </div>
);

/* ─── Reusable Input Field (Edit Mode) ─── */
const InputField = ({ label, name, value, onChange, type = 'text', required = false, placeholder = '' }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
        />
    </div>
);

export default StudentProfile;
