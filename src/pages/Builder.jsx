import React, { useState, useEffect } from 'react';
import { Download, Sparkles, LayoutTemplate, Activity, ChevronDown, ChevronUp, Save, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Builder({ onNavigate, user, initialData, resumeId }) {
    const [template, setTemplate] = useState('modern'); // modern, minimal, executive
    const [activeAccordion, setActiveAccordion] = useState('personal');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiScore, setAiScore] = useState(null);

    const [formData, setFormData] = useState(initialData || {
        personal: { fullName: '', email: '', phone: '', linkedin: '' },
        summary: '',
        experience: [{ id: 1, company: '', role: '', date: '', desc: '' }],
        education: [{ id: 1, school: '', degree: '', date: '' }],
        skills: '',
        projects: [{ id: 1, name: '', date: '', desc: '' }],
        certifications: '',
        languages: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handlePersonalChange = (e) => {
        setFormData({ ...formData, personal: { ...formData.personal, [e.target.name]: e.target.value } });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleArrayChange = (index, field, value, type) => {
        const newArr = [...formData[type]];
        newArr[index] = { ...newArr[index], [field]: value };
        setFormData({ ...formData, [type]: newArr });
    };

    const addItem = (type) => {
        const newItem = type === 'experience' ? { id: Date.now(), company: '', role: '', date: '', desc: '' } :
            type === 'education' ? { id: Date.now(), school: '', degree: '', date: '' } :
                { id: Date.now(), name: '', date: '', desc: '' };
        setFormData({ ...formData, [type]: [...formData[type], newItem] });
    };

    const removeItem = (index, type) => {
        setFormData({ ...formData, [type]: formData[type].filter((_, i) => i !== index) });
    };

    const toggleAccordion = (section) => {
        setActiveAccordion(activeAccordion === section ? null : section);
    };

    const generateWithAI = async () => {
        setIsGenerating(true);
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
            if (!apiKey || apiKey === 'your_gemini_api_key') {
                alert('Please provide your actual VITE_GEMINI_API_KEY in your .env file.');
                setIsGenerating(false);
                return;
            }
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            
            const prompt = `
            You are an expert professional resume writer. Given the following raw resume data in JSON format, rewrite the content professionally. 
            Improve the professional summary and job descriptions (use strong action verbs, quantifiable metrics, and ATS-friendly keywords), while keeping personal info completely unchanged.
            Return ONLY a raw JSON object string with the exact same keys and structure.
            Here is the raw data: ${JSON.stringify(formData)}
            `;
            
            const result = await model.generateContent(prompt);
            let responseText = result.response.text();
            
            // Clean up backticks if model returns markdown formatted json
            if (responseText.startsWith('```')) {
                responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            }
            const aiData = JSON.parse(responseText);
            setFormData(aiData);
        } catch (error) {
            console.error('Error generating AI text:', error);
            alert('Failed to generate AI rewrite. Please check API key and console.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveResume = async () => {
        if (!user) {
            alert('You must be logged in to save resumes.');
            return;
        }
        try {
            setIsGenerating(true);
            const payload = {
                user_id: user.id,
                title: formData.personal.fullName ? `${formData.personal.fullName}'s Resume` : 'Untitled Resume',
                data: formData,
                updated_at: new Date()
            };
            
            if (resumeId) {
                const { error } = await supabase.from('resumes').update(payload).eq('id', resumeId);
                if (error) throw error;
                alert('Resume updated successfully!');
            } else {
                const { error } = await supabase.from('resumes').insert([payload]);
                if (error) throw error;
                alert('Resume saved successfully! Next time you edit, it will be updated.');
            }
        } catch (error) {
            console.error('Error saving:', error.message);
            alert('Error saving resume to Supabase.');
        } finally {
            setIsGenerating(false);
        }
    };

    const simulateAnalyzeScore = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setAiScore({
                score: 85,
                strengths: ['Strong action verbs used', 'Good technical skills match'],
                weaknesses: ['Add more quantifiable achievements in experience'],
                atsCompatible: true
            });
            setIsGenerating(false);
        }, 1500);
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('resume-preview-document');
        if (!element) return;
        
        try {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4'
            });
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${formData.personal.fullName || 'resume'}.pdf`);
        } catch (err) {
            console.error('Error generating PDF', err);
            // Fallback
            window.print();
        }
    };

    return (
        <div className="builder-layout animate-fade-in">
            {/* Left Pane: Forms */}
            <div className="builder-forms hide-on-print">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
                    <button onClick={() => onNavigate('dashboard')} style={{ color: 'var(--text-secondary)' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <h2 style={{ margin: 0, flex: 1 }}>Resume Builder</h2>
                </div>

                <div className="action-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'flex-start' }}>
                    <button className="btn-accent" onClick={generateWithAI} disabled={isGenerating} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isGenerating ? <Activity className="animate-pulse" size={18} /> : <Sparkles size={18} />}
                        Auto-Generate with AI
                    </button>

                    <button className="btn-secondary" onClick={simulateAnalyzeScore} disabled={isGenerating} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={18} /> Resume Score
                    </button>

                    <button className="btn-secondary" onClick={handleSaveResume} disabled={isGenerating} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Save size={18} /> Save Resume
                    </button>

                    <button className="btn-secondary" onClick={handleDownloadPDF} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Download size={18} /> Export PDF
                    </button>
                </div>

                {aiScore && (
                    <div className="ai-suggestion animate-fade-in" style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <h3 style={{ margin: 0 }}>ATS Resume Score</h3>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: aiScore.score > 80 ? '#22c55e' : '#f59e0b' }}>
                                {aiScore.score} / 100
                            </div>
                        </div>
                        <div><strong>Strengths:</strong> {aiScore.strengths.join(', ')}</div>
                        <div style={{ marginTop: '8px' }}><strong>Needs Improvement:</strong> {aiScore.weaknesses.join(', ')}</div>
                    </div>
                )}

                {/* Template Selector */}
                <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label>Choose Template</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {['modern', 'minimal', 'executive'].map(t => (
                            <button
                                key={t}
                                onClick={() => setTemplate(t)}
                                className={template === t ? 'btn-primary' : 'btn-secondary'}
                                style={{ flex: 1, textTransform: 'capitalize' }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Accordions */}
                <div className="accordion-item">
                    <div className="accordion-header" onClick={() => toggleAccordion('personal')}>
                        Personal Information {activeAccordion === 'personal' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                    {activeAccordion === 'personal' && (
                        <div className="accordion-content form-grid">
                            <div className="form-group"><label>Full Name</label><input type="text" name="fullName" value={formData.personal.fullName} onChange={handlePersonalChange} placeholder="John Doe" /></div>
                            <div className="form-group"><label>Email</label><input type="email" name="email" value={formData.personal.email} onChange={handlePersonalChange} placeholder="john@example.com" /></div>
                            <div className="form-group"><label>Phone</label><input type="text" name="phone" value={formData.personal.phone} onChange={handlePersonalChange} placeholder="(555) 555-5555" /></div>
                            <div className="form-group"><label>LinkedIn / Website</label><input type="text" name="linkedin" value={formData.personal.linkedin} onChange={handlePersonalChange} placeholder="linkedin.com/in/johndoe" /></div>
                        </div>
                    )}
                </div>

                <div className="accordion-item">
                    <div className="accordion-header" onClick={() => toggleAccordion('summary')}>
                        Professional Summary {activeAccordion === 'summary' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                    {activeAccordion === 'summary' && (
                        <div className="accordion-content">
                            <textarea name="summary" value={formData.summary} onChange={handleChange} placeholder="A brief summary of your professional background..."></textarea>
                        </div>
                    )}
                </div>

                <div className="accordion-item">
                    <div className="accordion-header" onClick={() => toggleAccordion('experience')}>
                        Work Experience {activeAccordion === 'experience' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                    {activeAccordion === 'experience' && (
                        <div className="accordion-content">
                            {formData.experience.map((exp, idx) => (
                                <div key={exp.id} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button onClick={() => removeItem(idx, 'experience')} style={{ color: '#ef4444', fontSize: '1.2rem' }}>&times;</button></div>
                                    <div className="form-group"><label>Company</label><input type="text" value={exp.company} onChange={(e) => handleArrayChange(idx, 'company', e.target.value, 'experience')} /></div>
                                    <div className="form-group"><label>Role</label><input type="text" value={exp.role} onChange={(e) => handleArrayChange(idx, 'role', e.target.value, 'experience')} /></div>
                                    <div className="form-group"><label>Dates</label><input type="text" value={exp.date} onChange={(e) => handleArrayChange(idx, 'date', e.target.value, 'experience')} placeholder="Jan 2020 - Present" /></div>
                                    <div className="form-group"><label>Description</label><textarea value={exp.desc} onChange={(e) => handleArrayChange(idx, 'desc', e.target.value, 'experience')} placeholder="Describe your achievements..."></textarea></div>
                                </div>
                            ))}
                            <button className="btn-secondary" style={{ width: '100%' }} onClick={() => addItem('experience')}>+ Add Experience</button>
                        </div>
                    )}
                </div>

                <div className="accordion-item">
                    <div className="accordion-header" onClick={() => toggleAccordion('education')}>
                        Education {activeAccordion === 'education' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                    {activeAccordion === 'education' && (
                        <div className="accordion-content">
                            {formData.education.map((edu, idx) => (
                                <div key={edu.id} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button onClick={() => removeItem(idx, 'education')} style={{ color: '#ef4444', fontSize: '1.2rem' }}>&times;</button></div>
                                    <div className="form-group"><label>School</label><input type="text" value={edu.school} onChange={(e) => handleArrayChange(idx, 'school', e.target.value, 'education')} /></div>
                                    <div className="form-group"><label>Degree</label><input type="text" value={edu.degree} onChange={(e) => handleArrayChange(idx, 'degree', e.target.value, 'education')} /></div>
                                    <div className="form-group"><label>Dates</label><input type="text" value={edu.date} onChange={(e) => handleArrayChange(idx, 'date', e.target.value, 'education')} /></div>
                                </div>
                            ))}
                            <button className="btn-secondary" style={{ width: '100%' }} onClick={() => addItem('education')}>+ Add Education</button>
                        </div>
                    )}
                </div>

                <div className="accordion-item">
                    <div className="accordion-header" onClick={() => toggleAccordion('skills')}>
                        Skills {activeAccordion === 'skills' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                    {activeAccordion === 'skills' && (
                        <div className="accordion-content">
                            <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="JavaScript, React, Node.js (Comma separated)" />
                        </div>
                    )}
                </div>

                <div className="accordion-item">
                    <div className="accordion-header" onClick={() => toggleAccordion('projects')}>
                        Projects {activeAccordion === 'projects' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                    {activeAccordion === 'projects' && (
                        <div className="accordion-content">
                            {formData.projects.map((proj, idx) => (
                                <div key={proj.id} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button onClick={() => removeItem(idx, 'projects')} style={{ color: '#ef4444', fontSize: '1.2rem' }}>&times;</button></div>
                                    <div className="form-group"><label>Project Name</label><input type="text" value={proj.name} onChange={(e) => handleArrayChange(idx, 'name', e.target.value, 'projects')} /></div>
                                    <div className="form-group"><label>Dates</label><input type="text" value={proj.date} onChange={(e) => handleArrayChange(idx, 'date', e.target.value, 'projects')} /></div>
                                    <div className="form-group"><label>Description</label><textarea value={proj.desc} onChange={(e) => handleArrayChange(idx, 'desc', e.target.value, 'projects')} /></div>
                                </div>
                            ))}
                            <button className="btn-secondary" style={{ width: '100%' }} onClick={() => addItem('projects')}>+ Add Project</button>
                        </div>
                    )}
                </div>

                <div className="accordion-item">
                    <div className="accordion-header" onClick={() => toggleAccordion('certifications')}>
                        Certifications & Languages {activeAccordion === 'certifications' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                    {activeAccordion === 'certifications' && (
                        <div className="accordion-content">
                            <div className="form-group"><label>Certifications (comma separated)</label><input type="text" name="certifications" value={formData.certifications} onChange={handleChange} placeholder="AWS Certified, PMP" /></div>
                            <div className="form-group"><label>Languages (comma separated)</label><input type="text" name="languages" value={formData.languages} onChange={handleChange} placeholder="English, Spanish" /></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Pane: Live Preview */}
            <div className="builder-preview">
                <div id="resume-preview-document" className={`preview-document template-${template}`} style={{ backgroundColor: 'white', padding: '40px', minHeight: '800px' }}>
                    {/* Header */}
                    <div style={{ textAlign: template === 'modern' ? 'left' : 'center', marginBottom: '24px' }}>
                        <h1 style={{ margin: '0 0 8px 0', fontSize: '2.5rem' }}>{formData.personal.fullName || 'Your Name'}</h1>
                        <div style={{ display: 'flex', gap: '16px', justifyContent: template === 'modern' ? 'flex-start' : 'center', color: '#4b5563', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                            {formData.personal.email && <span>{formData.personal.email}</span>}
                            {formData.personal.phone && <span>{formData.personal.phone}</span>}
                            {formData.personal.linkedin && <span>{formData.personal.linkedin}</span>}
                        </div>
                    </div>

                    {/* Summary */}
                    {formData.summary && (
                        <div>
                            <div className="section-title">Professional Summary</div>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: '#374151' }}>{formData.summary}</p>
                        </div>
                    )}

                    {/* Experience */}
                    {formData.experience.length > 0 && formData.experience.some(e => e.company) && (
                        <div>
                            <div className="section-title">Experience</div>
                            {formData.experience.filter(e => e.company).map((exp) => (
                                <div key={exp.id} style={{ marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ fontWeight: 'bold' }}>{exp.company}</div>
                                        <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>{exp.date}</div>
                                    </div>
                                    <div style={{ fontStyle: 'italic', marginBottom: '8px', fontSize: '0.95rem' }}>{exp.role}</div>
                                    {exp.desc && <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151', whiteSpace: 'pre-wrap' }}>{exp.desc}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Education */}
                    {formData.education.length > 0 && formData.education.some(e => e.school) && (
                        <div>
                            <div className="section-title">Education</div>
                            {formData.education.filter(e => e.school).map((edu) => (
                                <div key={edu.id} style={{ marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ fontWeight: 'bold' }}>{edu.school}</div>
                                        <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>{edu.date}</div>
                                    </div>
                                    <div style={{ fontSize: '0.95rem', color: '#374151' }}>{edu.degree}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Projects */}
                    {formData.projects.length > 0 && formData.projects.some(e => e.name) && (
                        <div>
                            <div className="section-title">Projects</div>
                            {formData.projects.filter(e => e.name).map((proj) => (
                                <div key={proj.id} style={{ marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ fontWeight: 'bold' }}>{proj.name}</div>
                                        <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>{proj.date}</div>
                                    </div>
                                    {proj.desc && <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151', whiteSpace: 'pre-wrap' }}>{proj.desc}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Skills, Certifications, Languages (Bottom Row formatting) */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginTop: '24px' }}>
                        {formData.skills && (
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div className="section-title" style={{ marginTop: 0 }}>Skills</div>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151' }}>{formData.skills}</p>
                            </div>
                        )}
                        {formData.certifications && (
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div className="section-title" style={{ marginTop: 0 }}>Certifications</div>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151' }}>{formData.certifications}</p>
                            </div>
                        )}
                        {formData.languages && (
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div className="section-title" style={{ marginTop: 0 }}>Languages</div>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151' }}>{formData.languages}</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
