import React from 'react';
import { Sparkles, LayoutTemplate, Edit3, Download, Zap, CheckCircle2 } from 'lucide-react';

export default function Landing({ onNavigate }) {
    const features = [
        { title: 'AI Resume Generation', desc: 'Content generated automatically using AI.', icon: <Sparkles className="text-blue-400" size={32} /> },
        { title: 'Multiple Templates', desc: 'Professionally designed templates.', icon: <LayoutTemplate size={32} /> },
        { title: 'Live Resume Editor', desc: 'Edit your resume and see changes instantly.', icon: <Edit3 size={32} /> },
        { title: 'PDF Download', desc: 'Export your resume as a pristine PDF.', icon: <Download size={32} /> },
        { title: 'Smart AI Suggestions', desc: 'Improves descriptions and bullet points.', icon: <Zap size={32} /> }
    ];

    return (
        <div className="landing-page animate-fade-in">
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '6px 12px', borderRadius: '20px', marginBottom: '20px', color: 'var(--accent-color)', fontWeight: '600', fontSize: '0.9rem' }}>
                        <Sparkles size={16} style={{ marginRight: '8px' }} /> Powered by OpenAI
                    </div>
                    <h1>Create a professional resume in minutes using AI.</h1>
                    <p>The smartest and fastest way to build an ATS-friendly, professional resume that lands you interviews.</p>
                    <div className="hero-btns">
                        <button className="btn-primary" onClick={() => onNavigate('auth')} style={{ padding: '14px 28px', fontSize: '1.1rem' }}>Get Started</button>
                        <button className="btn-secondary" onClick={() => onNavigate('auth')} style={{ padding: '14px 28px', fontSize: '1.1rem' }}>Login</button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="container features-section">
                <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '40px' }}>Everything you need to succeed</h2>
                <div className="features-grid">
                    {features.map((f, i) => (
                        <div key={i} className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
                            <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                                {f.icon}
                            </div>
                            <h3 style={{ fontSize: '1.25rem', margin: '0' }}>{f.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', margin: '0' }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Template Showcase */}
            <section className="container" style={{ padding: '80px 0' }}>
                <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '40px' }}>Stunning Templates</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    {['Corporate', 'Minimal', 'Creative', 'Tech Pro', 'Executive'].map((t, idx) => (
                        <div key={idx} style={{
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-lg)',
                            height: '300px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-muted)',
                            fontSize: '1.25rem',
                            fontWeight: '600'
                        }}>
                            {t} Template Preview
                        </div>
                    ))}
                </div>
            </section>

            {/* How it Works */}
            <section className="container" style={{ padding: '80px 0' }}>
                <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '60px' }}>How It Works</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px', margin: '0 auto' }}>
                    {[
                        'Login or create an account.',
                        'Enter resume information such as personal details, education, skills, and experience.',
                        'Use AI to generate professional resume content automatically.',
                        'Choose a stunning template design.',
                        'Download the resume as a PDF and land interviews.'
                    ].map((step, idx) => (
                        <div key={idx} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px' }}>
                            <div style={{
                                width: '40px', height: '40px',
                                backgroundColor: 'var(--accent-color)',
                                color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: '50%', fontWeight: '700', fontSize: '1.2rem',
                                flexShrink: 0
                            }}>
                                {idx + 1}
                            </div>
                            <p style={{ fontSize: '1.1rem', margin: '0', fontWeight: '500' }}>{step}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid var(--border-color)', padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>© 2026 AI Resume Maker. All rights reserved.</p>
            </footer>
        </div>
    );
}
