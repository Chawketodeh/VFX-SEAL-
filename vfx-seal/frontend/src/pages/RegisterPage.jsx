import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const COUNTRIES = [
    'United States', 'United Kingdom', 'Canada', 'France', 'Germany', 'India',
    'Australia', 'Japan', 'South Korea', 'New Zealand', 'China', 'Spain',
    'Italy', 'Brazil', 'Mexico', 'Sweden', 'Netherlands', 'Belgium',
    'Singapore', 'Thailand', 'Other',
];

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '', company: '', email: '', password: '',
        country: '', roleInCompany: '', linkedin: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.name || !form.company || !form.email || !form.password || !form.country || !form.roleInCompany) {
            setError('Please fill in all required fields');
            return;
        }

        if (form.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await register(form);
            navigate('/login', { state: { registered: true } });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card fade-in" style={{ maxWidth: 560 }}>
                <div className="auth-header">
                    <div className="auth-logo">
                        <div className="auth-logo-icon">VS</div>
                        <div className="auth-logo-text">VFX <span className="accent">Seal</span></div>
                    </div>
                    <p className="auth-subtitle">Register your studio for VOE access</p>
                </div>

                {error && <div className="alert alert-error">⚠ {error}</div>}

                <form className="auth-form" onSubmit={handleSubmit} id="register-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-name">Full Name *</label>
                            <input id="reg-name" name="name" className="form-input" placeholder="John Doe"
                                value={form.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-company">Company *</label>
                            <input id="reg-company" name="company" className="form-input" placeholder="Studio Name"
                                value={form.company} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-email">Professional Email *</label>
                        <input id="reg-email" name="email" className="form-input" type="email"
                            placeholder="you@studio.com" value={form.email} onChange={handleChange} required />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-country">Country *</label>
                            <select id="reg-country" name="country" className="form-select"
                                value={form.country} onChange={handleChange} required>
                                <option value="">Select country</option>
                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-role">Role in Company *</label>
                            <input id="reg-role" name="roleInCompany" className="form-input"
                                placeholder="VFX Supervisor" value={form.roleInCompany} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-password">Password *</label>
                        <input id="reg-password" name="password" className="form-input" type="password"
                            placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-linkedin">LinkedIn Profile (optional)</label>
                        <input id="reg-linkedin" name="linkedin" className="form-input"
                            placeholder="https://linkedin.com/in/yourprofile" value={form.linkedin} onChange={handleChange} />
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading} id="register-submit">
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
