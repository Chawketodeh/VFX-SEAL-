import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const BADGE_ICONS = { Gold: '🏆', Silver: '🥈', Bronze: '🥉', None: '—' };

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('studios');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userFilter, setUserFilter] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes] = await Promise.all([api.get('/admin/stats')]);
            setStats(statsRes.data);

            if (activeTab === 'studios') {
                const params = userFilter ? `?status=${userFilter}` : '';
                const { data } = await api.get(`/admin/users${params}`);
                setUsers(data.users);
            } else {
                const { data } = await api.get('/vendors');
                setVendors(data.vendors);
            }
        } catch (err) {
            console.error('Admin fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'studios') {
            const fetchUsers = async () => {
                const params = userFilter ? `?status=${userFilter}` : '';
                const { data } = await api.get(`/admin/users${params}`);
                setUsers(data.users);
            };
            fetchUsers();
        }
    }, [userFilter]);

    const handleUserAction = async (userId, action) => {
        setActionLoading(`${userId}-${action}`);
        try {
            await api.patch(`/admin/users/${userId}/${action}`);
            await fetchData();
        } catch (err) {
            alert(`Failed to ${action} user`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteVendor = async (vendorId) => {
        if (!window.confirm('Are you sure you want to delete this vendor?')) return;
        try {
            await api.delete(`/vendors/${vendorId}`);
            await fetchData();
        } catch (err) {
            alert('Failed to delete vendor');
        }
    };

    const badgeClass = (badge) => (badge || 'none').toLowerCase();

    return (
        <div className="page-wrapper">
            <div className="container">
                <h1 className="slide-up" style={{ marginBottom: 'var(--space-lg)' }}>Admin Dashboard</h1>

                {/* Stats */}
                {stats && (
                    <div className="admin-stats fade-in">
                        <div className="stat-card">
                            <div className="stat-card-value">{stats.totalStudios}</div>
                            <div className="stat-card-label">Total Studios</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-value" style={{ color: 'var(--warning)' }}>{stats.pendingStudios}</div>
                            <div className="stat-card-label">Pending Approval</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-value" style={{ color: 'var(--success)' }}>{stats.approvedStudios}</div>
                            <div className="stat-card-label">Approved</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-value" style={{ color: 'var(--info)' }}>{stats.totalVendors}</div>
                            <div className="stat-card-label">Vendors</div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="admin-tabs">
                    <button className={`admin-tab ${activeTab === 'studios' ? 'active' : ''}`}
                        onClick={() => setActiveTab('studios')} id="tab-studios">
                        🏢 Studios
                    </button>
                    <button className={`admin-tab ${activeTab === 'vendors' ? 'active' : ''}`}
                        onClick={() => setActiveTab('vendors')} id="tab-vendors">
                        🏗 Vendors
                    </button>
                </div>

                {/* Studios Tab */}
                {activeTab === 'studios' && (
                    <div className="fade-in">
                        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
                            {['', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
                                <button key={f} className={`btn btn-sm ${userFilter === f ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setUserFilter(f)} id={`filter-${f || 'all'}`}>
                                    {f || 'All'}
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div className="loading"><div className="spinner" /></div>
                        ) : (
                            <div className="admin-table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Company</th>
                                            <th>Email</th>
                                            <th>Country</th>
                                            <th>Status</th>
                                            <th>Registered</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length === 0 ? (
                                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No studios found</td></tr>
                                        ) : users.map(user => (
                                            <tr key={user._id}>
                                                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</td>
                                                <td>{user.company}</td>
                                                <td>{user.email}</td>
                                                <td>{user.country}</td>
                                                <td>
                                                    <span className={`status-badge ${user.status.toLowerCase()}`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <div className="admin-actions">
                                                        {user.status === 'PENDING' && (
                                                            <>
                                                                <button className="btn btn-success btn-sm"
                                                                    onClick={() => handleUserAction(user._id, 'approve')}
                                                                    disabled={actionLoading === `${user._id}-approve`}
                                                                    id={`approve-${user._id}`}>
                                                                    {actionLoading === `${user._id}-approve` ? '...' : '✓ Approve'}
                                                                </button>
                                                                <button className="btn btn-danger btn-sm"
                                                                    onClick={() => handleUserAction(user._id, 'reject')}
                                                                    disabled={actionLoading === `${user._id}-reject`}
                                                                    id={`reject-${user._id}`}>
                                                                    ✗ Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {user.status === 'APPROVED' && (
                                                            <button className="btn btn-warning btn-sm"
                                                                onClick={() => handleUserAction(user._id, 'block')}
                                                                disabled={actionLoading === `${user._id}-block`}
                                                                id={`block-${user._id}`}>
                                                                🚫 Block
                                                            </button>
                                                        )}
                                                        {user.status === 'REJECTED' && (
                                                            <button className="btn btn-success btn-sm"
                                                                onClick={() => handleUserAction(user._id, 'approve')}
                                                                disabled={actionLoading === `${user._id}-approve`}
                                                                id={`approve-${user._id}`}>
                                                                ✓ Re-Approve
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Vendors Tab */}
                {activeTab === 'vendors' && (
                    <div className="fade-in">
                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <button className="btn btn-primary" onClick={() => navigate('/admin/vendors/new')} id="add-vendor-btn">
                                + Add Vendor
                            </button>
                        </div>

                        {loading ? (
                            <div className="loading"><div className="spinner" /></div>
                        ) : (
                            <div className="admin-table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Country</th>
                                            <th>Size</th>
                                            <th>Badge</th>
                                            <th>Score</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vendors.length === 0 ? (
                                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No vendors yet</td></tr>
                                        ) : vendors.map(vendor => (
                                            <tr key={vendor._id}>
                                                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{vendor.name}</td>
                                                <td>{vendor.country}</td>
                                                <td>{vendor.size}</td>
                                                <td>
                                                    <span className={`voe-badge ${badgeClass(vendor.badgeVOE)}`} style={{ fontSize: '0.7rem' }}>
                                                        {BADGE_ICONS[vendor.badgeVOE]} {vendor.badgeVOE}
                                                    </span>
                                                </td>
                                                <td>{vendor.globalScore?.toFixed(1)}</td>
                                                <td>
                                                    <div className="admin-actions">
                                                        <button className="btn btn-secondary btn-sm"
                                                            onClick={() => navigate(`/admin/vendors/${vendor._id}/edit`)}
                                                            id={`edit-${vendor._id}`}>
                                                            ✏ Edit
                                                        </button>
                                                        <button className="btn btn-danger btn-sm"
                                                            onClick={() => handleDeleteVendor(vendor._id)}
                                                            id={`delete-${vendor._id}`}>
                                                            🗑
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
