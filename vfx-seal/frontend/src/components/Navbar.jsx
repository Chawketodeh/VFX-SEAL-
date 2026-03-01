import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    // Close notification panel on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const getNotifIcon = (type) => {
        switch (type) {
            case 'CONTACT_REPLY': return '💬';
            case 'FEEDBACK_APPROVED': return '✅';
            case 'FEEDBACK_REJECTED': return '❌';
            case 'NEW_CONTACT': return '📩';
            case 'NEW_FEEDBACK': return '⭐';
            default: return '🔔';
        }
    };

    return (
        <>
            <nav className="navbar" id="main-navbar">
                <div className="navbar-inner">
                    <Link to={isAdmin ? '/admin' : '/'} className="navbar-brand">
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
                            <>
                                <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
                                <Link to="/vendors" className={isActive('/vendors') ? 'active' : ''}>Vendor Directory</Link>
                            </>
                        )}
                        <Link to="/contact" className={isActive('/contact') ? 'active' : ''}>Contact</Link>
                    </div>

                    <div className="navbar-user">
                        {/* Notification Bell */}
                        <div className="notif-wrapper" ref={notifRef}>
                            <button className="notif-bell" onClick={() => setNotifOpen(!notifOpen)} id="notif-bell-btn">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                                )}
                            </button>

                            {notifOpen && (
                                <div className="notif-panel">
                                    <div className="notif-panel-header">
                                        <h4>Notifications</h4>
                                        {unreadCount > 0 && (
                                            <button className="notif-mark-read" onClick={markAllRead}>Mark all read</button>
                                        )}
                                    </div>
                                    <div className="notif-panel-list">
                                        {notifications.length === 0 ? (
                                            <div className="notif-empty">No notifications yet</div>
                                        ) : (
                                            notifications.slice(0, 20).map(n => (
                                                <div key={n._id} className={`notif-item ${n.read ? '' : 'unread'}`}
                                                    onClick={() => markRead(n._id)}>
                                                    <span className="notif-item-icon">{getNotifIcon(n.type)}</span>
                                                    <div className="notif-item-content">
                                                        <div className="notif-item-title">{n.title}</div>
                                                        <div className="notif-item-msg">{n.message}</div>
                                                        <div className="notif-item-time">{formatTimeAgo(n.createdAt)}</div>
                                                    </div>
                                                    {!n.read && <span className="notif-dot" />}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

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
                <Link to="/" onClick={() => setMobileOpen(false)} className={location.pathname === '/' ? 'active' : ''}>
                    Home
                </Link>
                {isAdmin && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)} className={isActive('/admin') ? 'active' : ''}>
                        Dashboard
                    </Link>
                )}
                <Link to="/vendors" onClick={() => setMobileOpen(false)} className={isActive('/vendors') ? 'active' : ''}>
                    Vendors
                </Link>
                <Link to="/contact" onClick={() => setMobileOpen(false)} className={isActive('/contact') ? 'active' : ''}>
                    Contact
                </Link>
                <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} style={{ color: 'var(--danger)', marginTop: 'auto' }}>
                    Logout
                </a>
            </div>
        </>
    );
}
