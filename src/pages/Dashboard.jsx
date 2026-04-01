import React, { useEffect, useState } from 'react';
import { FileText, Plus, User, Sparkles, Settings, Activity, LayoutTemplate, LogOut, Edit3, Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Dashboard({ onNavigate, user, onLogout, onEditResume }) {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchResumes();
        }
    }, [user]);

    const fetchResumes = async () => {
        try {
            const { data, error } = await supabase.from('resumes').select('*').eq('user_id', user.id).order('updated_at', { ascending: false });
            if (error) throw error;
            setResumes(data || []);
        } catch (error) {
            console.error('Error fetching resumes:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteResume = async (id) => {
        if(!confirm('Are you sure you want to delete this resume?')) return;
        try {
            const { error } = await supabase.from('resumes').delete().eq('id', id);
            if (error) throw error;
            setResumes(resumes.filter(r => r.id !== id));
        } catch (error) {
            console.error('Error deleting:', error.message);
        }
    };
    const menuItems = [
        { title: 'Create New Resume', icon: <Plus size={20} />, action: () => onNavigate('builder'), highlight: true },
        { title: 'My Resumes', icon: <FileText size={20} />, action: () => { } },
        { title: 'Templates', icon: <LayoutTemplate size={20} />, action: () => { } },
        { title: 'AI Writing Assistant', icon: <Sparkles size={20} />, action: () => { } },
        { title: 'Resume Score Checker', icon: <Activity size={20} />, action: () => { } },
        { title: 'Settings', icon: <Settings size={20} />, action: () => { } },
    ];

    return (
        <div className="dashboard-layout animate-fade-in">
            {/* Sidebar Navigation */}
            <aside className="sidebar">
                <div style={{ padding: '0 24px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <User size={24} />
                    </div>
                    <div>
                        <div style={{ fontWeight: '600' }}>{user?.name || 'User'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            <span style={{ 
                                padding: '2px 6px', borderRadius: '4px', 
                                backgroundColor: user?.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                                color: user?.role === 'admin' ? '#ef4444' : '#0ea5e9',
                                textTransform: 'capitalize'
                            }}>{user?.role || 'User'}</span> Plan
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    {menuItems.map((item, idx) => (
                        <button
                            key={idx}
                            className="sidebar-item"
                            onClick={item.action}
                            style={item.highlight ? { color: 'var(--accent-color)' } : {}}
                        >
                            {item.icon}
                            {item.title}
                        </button>
                    ))}
                </div>

                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <button className="sidebar-item" style={{ color: '#ef4444' }} onClick={onLogout}>
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Workspace */}
            <div className="main-content">
                <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Let's build a standout resume today.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
                    {/* Create New Card */}
                    <div
                        className="glass-card"
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            height: '320px', cursor: 'pointer', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--text-muted)'
                        }}
                        onClick={() => onNavigate('builder')}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-color)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--text-muted)'}
                    >
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--bg-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                            <Plus size={32} color="var(--accent-color)" />
                        </div>
                        <h3 style={{ margin: 0 }}>Create New Resume</h3>
                    </div>

                    {loading ? (
                        <p>Loading resumes...</p>
                    ) : (
                        resumes.map(resume => (
                            <div key={resume.id} className="glass-card" style={{ height: '320px', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
                                <div style={{ flex: 1, backgroundColor: 'white', opacity: 0.9, padding: '20px', cursor: 'pointer' }} onClick={() => onEditResume(resume)}>
                                    <div style={{ width: '60%', height: '12px', backgroundColor: '#e2e8f0', marginBottom: '8px' }}></div>
                                    <div style={{ width: '40%', height: '8px', backgroundColor: '#e2e8f0', marginBottom: '24px' }}></div>
                                    <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', marginBottom: '8px' }}></div>
                                    <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', marginBottom: '8px' }}></div>
                                    <div style={{ width: '80%', height: '8px', backgroundColor: '#e2e8f0' }}></div>
                                </div>
                                <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{resume.title}</h4>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(resume.updated_at).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button style={{ color: 'var(--accent-color)' }} onClick={() => onEditResume(resume)}><Edit3 size={18} /></button>
                                        <button style={{ color: '#ef4444' }} onClick={() => deleteResume(resume.id)}><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
