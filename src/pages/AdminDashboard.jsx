import React, { useEffect, useState } from 'react';
import { Users, FileText, Settings, LogOut, Shield } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function AdminDashboard({ onNavigate, user, onLogout }) {
    const [stats, setStats] = useState({ totalUsers: 0, totalResumes: 0 });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            setLoading(true);
            const { data: profilesData, error: profileErr } = await supabase.from('profiles').select('*');
            const { data: resumesData, error: resumeErr } = await supabase.from('resumes').select('id, user_id');

            if (profileErr) throw profileErr;

            const profileList = profilesData || [];
            const resumeList = resumesData || [];

            setStats({
                totalUsers: profileList.length,
                totalResumes: resumeList.length
            });

            // Map resumes to users
            const usersWithResumes = profileList.map(p => ({
                ...p,
                resumeCount: resumeList.filter(r => r.user_id === p.id).length
            }));
            
            setUsers(usersWithResumes);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
            if (error) throw error;
            fetchAdminData();
        } catch (error) {
            alert('Failed to update role');
        }
    };

    return (
        <div className="dashboard-layout animate-fade-in">
            <aside className="sidebar">
                <div style={{ padding: '0 24px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Shield size={24} />
                    </div>
                    <div>
                        <div style={{ fontWeight: '600' }}>Admin Center</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user?.name || user?.email}</div>
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <button className="sidebar-item" style={{ color: 'var(--accent-color)' }} onClick={() => {}}>
                        <Users size={20} /> Users & Roles
                    </button>
                    <button className="sidebar-item" onClick={() => {}}>
                        <FileText size={20} /> System Reports
                    </button>
                    <button className="sidebar-item" onClick={() => {}}>
                        <Settings size={20} /> Settings
                    </button>
                </div>

                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <button className="sidebar-item" style={{ color: '#ef4444' }} onClick={onLogout}>
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </aside>

            <div className="main-content">
                <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Admin Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Manage user accounts and system metrics.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ p: '12px', backgroundColor: 'rgba(52, 211, 153, 0.1)', borderRadius: '12px', color: '#10b981' }}>
                                <Users size={32} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '2rem' }}>{stats.totalUsers}</h3>
                                <div style={{ color: 'var(--text-secondary)' }}>Total Users</div>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ p: '12px', backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px', color: '#0ea5e9' }}>
                                <FileText size={32} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '2rem' }}>{stats.totalResumes}</h3>
                                <div style={{ color: 'var(--text-secondary)' }}>Total Resumes Generated</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '24px' }}>User Management</h3>
                    {loading ? (
                        <p>Loading users...</p>
                    ) : (
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <th style={{ padding: '12px' }}>Email</th>
                                    <th style={{ padding: '12px' }}>Role</th>
                                    <th style={{ padding: '12px' }}>Resumes</th>
                                    <th style={{ padding: '12px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '12px' }}>{u.email}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ 
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                                                backgroundColor: u.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                                                color: u.role === 'admin' ? '#ef4444' : '#0ea5e9'
                                            }}>{u.role}</span>
                                        </td>
                                        <td style={{ padding: '12px' }}>{u.resumeCount}</td>
                                        <td style={{ padding: '12px' }}>
                                            <button 
                                                className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                                onClick={() => handleRoleChange(u.id, u.role === 'admin' ? 'user' : 'admin')}
                                            >
                                                Toggle Role
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
