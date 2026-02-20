import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <>
            <nav className="navbar" id="main-navbar">
                <div className="navbar-inner">
                    <Link to={isAdmin ? '/admin' : '/vendors'} className="navbar-brand">
                        <span className="seal-icon">VS</span>
                        VFX <span className="accent">Seal</span>
                    </Link>

                    <div className="navbar-links">
                        {isAdmin ? (
                            <>
                                <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>Dashboard</Link>
                                <Link to="/vendors" className={isActive('/vendors') ? 'active' : ''}>Vendors</Link>
                            </>
                        ) : (
                            <Link to="/vendors" className={isActive('/vendors') ? 'active' : ''}>Vendor Directory</Link>
                        )}
                    </div>

                    <div className="navbar-user">
                        <div className="navbar-user-info">
                            <div className="navbar-user-name">{user?.name}</div>
                            <div className="navbar-user-role">{isAdmin ? 'Administrator' : user?.company}</div>
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={handleLogout} id="logout-btn">
                            Logout
                        </button>
                    </div>

                    <button className="navbar-hamburger" onClick={() => setMobileOpen(true)} id="mobile-menu-btn">
                        ☰
                    </button>
                </div>
            </nav>

            {/* Mobile Nav */}
            {mobileOpen && <div className="mobile-nav-overlay open" onClick={() => setMobileOpen(false)} />}
            <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
                <button className="mobile-nav-close" onClick={() => setMobileOpen(false)}>✕</button>
                <div className="navbar-user-info" style={{ marginBottom: '16px' }}>
                    <div className="navbar-user-name">{user?.name}</div>
                    <div className="navbar-user-role">{isAdmin ? 'Administrator' : user?.company}</div>
                </div>
                {isAdmin && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)} className={isActive('/admin') ? 'active' : ''}>
                        Dashboard
                    </Link>
                )}
                <Link to="/vendors" onClick={() => setMobileOpen(false)} className={isActive('/vendors') ? 'active' : ''}>
                    Vendors
                </Link>
                <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} style={{ color: 'var(--danger)', marginTop: 'auto' }}>
                    Logout
                </a>
            </div>
        </>
    );
}
