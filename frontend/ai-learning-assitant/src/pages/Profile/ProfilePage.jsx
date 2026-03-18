import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import progressService from '../../services/progressService';
import toast from 'react-hot-toast';
import { User, Mail, Lock, BookOpen, BrainCircuit, FileText, Eye, EyeOff } from 'lucide-react';

const ProfilePage = () => {
    const { user, updateUser, logout } = useAuth();
    const [profileForm, setProfileForm] = useState({ username: '', email: '' });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [stats, setStats] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileForm({ username: user.username || '', email: user.email || '' });
        }
        fetchStats();
    }, [user]);

    const fetchStats = async () => {
        try {
            const data = await progressService.getDashboardData();
            if (data?.data?.overview) setStats(data.data.overview);
        } catch (_) {}
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        try {
            const res = await authService.updateProfile(profileForm);
            updateUser(res.data);
            toast.success('Profile updated successfully');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to update profile');
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setPasswordLoading(true);
        try {
            await authService.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            toast.success('Password changed successfully');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
    };

    const statCards = [
        { label: 'Documents', value: stats?.totalDocuments ?? '—', icon: FileText, color: 'from-blue-500 to-indigo-500' },
        { label: 'Flashcard Sets', value: stats?.totalFlashcardSets ?? '—', icon: BookOpen, color: 'from-emerald-500 to-teal-500' },
        { label: 'Quizzes', value: stats?.totalQuizzes ?? '—', icon: BrainCircuit, color: 'from-purple-500 to-violet-500' },
    ];

    return (
        <AppLayout>
            <PageHeader title="Profile" subtitle="Manage your account and preferences" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {statCards.map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white shadow-lg`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium opacity-90">{s.label}</p>
                                    <p className="text-3xl font-bold mt-1">{s.value}</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Icon className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">Personal Info</h2>
                            <p className="text-xs text-slate-500">Update your name and email</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
                            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900">{user?.username}</p>
                            <p className="text-sm text-slate-500">{user?.email}</p>
                            {user?.createdAt && (
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </p>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={profileForm.username}
                                    onChange={(e) => setProfileForm(p => ({ ...p, username: e.target.value }))}
                                    className="w-full pl-10 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    placeholder="Your username"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    value={profileForm.email}
                                    onChange={(e) => setProfileForm(p => ({ ...p, email: e.target.value }))}
                                    className="w-full pl-10 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={profileLoading}
                            className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                        >
                            {profileLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">Security</h2>
                            <p className="text-xs text-slate-500">Change your password</p>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type={showCurrentPw ? 'text' : 'password'}
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                                    className="w-full pl-10 pr-10 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    placeholder="Current password"
                                />
                                <button type="button" onClick={() => setShowCurrentPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type={showNewPw ? 'text' : 'password'}
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                                    className="w-full pl-10 pr-10 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    placeholder="New password (min 6 chars)"
                                />
                                <button type="button" onClick={() => setShowNewPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                                    className="w-full pl-10 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={passwordLoading}
                            className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                        >
                            {passwordLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <button
                            onClick={logout}
                            className="w-full h-11 border-2 border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-sm font-semibold transition-all"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default ProfilePage;
