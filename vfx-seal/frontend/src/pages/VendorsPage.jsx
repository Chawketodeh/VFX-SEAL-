import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const BADGE_ICONS = { Gold: '🏆', Silver: '🥈', Bronze: '🥉', None: '—' };

export default function VendorsPage() {
    const navigate = useNavigate();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ country: [], size: [], badge: [] });
    const [activeFilters, setActiveFilters] = useState({ country: [], size: [], badge: [] });
    const [totalCount, setTotalCount] = useState(0);

    const fetchVendors = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (activeFilters.country.length) params.set('country', activeFilters.country.join(','));
            if (activeFilters.size.length) params.set('size', activeFilters.size.join(','));
            if (activeFilters.badge.length) params.set('badge', activeFilters.badge.join(','));

            const { data } = await api.get(`/vendors?${params.toString()}`);
            setVendors(data.vendors);
            setTotalCount(data.total);
            if (data.filters) setFilters(data.filters);
        } catch (err) {
            setError('Failed to load vendors');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchVendors(); }, [activeFilters]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchVendors();
    };

    const toggleFilter = (type, value) => {
        setActiveFilters(prev => {
            const arr = prev[type];
            const updated = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
            return { ...prev, [type]: updated };
        });
    };

    const clearFilters = () => {
        setActiveFilters({ country: [], size: [], badge: [] });
        setSearch('');
    };

    const badgeClass = (badge) => (badge || 'none').toLowerCase();

    return (
        <div className="page-wrapper">
            <div className="container">
                <div className="vendors-header slide-up">
                    <h1>VOE Certified Vendors</h1>
                    <p>Discover and evaluate top-tier VFX vendors worldwide, certified by the VFX Operational Excellence program.</p>
                </div>

                <div className="vendors-layout">
                    {/* Filter Sidebar */}
                    <aside className="filter-sidebar fade-in">
                        <div className="filter-title">
                            <span>🔍</span> Filters
                            {(activeFilters.country.length > 0 || activeFilters.size.length > 0 || activeFilters.badge.length > 0) && (
                                <button className="btn btn-sm btn-secondary" onClick={clearFilters} style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Search */}
                        <form onSubmit={handleSearch} style={{ marginBottom: 'var(--space-lg)' }}>
                            <div className="search-bar">
                                <span className="search-icon">🔎</span>
                                <input className="form-input" placeholder="Search vendors..."
                                    value={search} onChange={(e) => setSearch(e.target.value)}
                                    id="vendor-search" />
                            </div>
                        </form>

                        {/* Country Filter */}
                        {filters.countries && filters.countries.length > 0 && (
                            <div className="filter-group">
                                <div className="filter-group-title">Country</div>
                                {filters.countries.sort().map(c => (
                                    <div key={c} className={`filter-option ${activeFilters.country.includes(c) ? 'active' : ''}`}
                                        onClick={() => toggleFilter('country', c)}>
                                        <span className="filter-checkbox" />
                                        {c}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Size Filter */}
                        {filters.sizes && filters.sizes.length > 0 && (
                            <div className="filter-group">
                                <div className="filter-group-title">Size</div>
                                {['Micro', 'Small', 'Medium', 'Large'].filter(s => filters.sizes.includes(s)).map(s => (
                                    <div key={s} className={`filter-option ${activeFilters.size.includes(s) ? 'active' : ''}`}
                                        onClick={() => toggleFilter('size', s)}>
                                        <span className="filter-checkbox" />
                                        {s}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Badge Filter */}
                        {filters.badges && filters.badges.length > 0 && (
                            <div className="filter-group">
                                <div className="filter-group-title">VOE Badge</div>
                                {['Gold', 'Silver', 'Bronze', 'None'].filter(b => filters.badges.includes(b)).map(b => (
                                    <div key={b} className={`filter-option ${activeFilters.badge.includes(b) ? 'active' : ''}`}
                                        onClick={() => toggleFilter('badge', b)}>
                                        <span className="filter-checkbox" />
                                        {BADGE_ICONS[b]} {b}
                                    </div>
                                ))}
                            </div>
                        )}
                    </aside>

                    {/* Vendor List */}
                    <main>
                        <div className="vendors-count">{totalCount} vendor{totalCount !== 1 ? 's' : ''} found</div>

                        {loading ? (
                            <div className="loading"><div className="spinner" /></div>
                        ) : error ? (
                            <div className="alert alert-error">{error}</div>
                        ) : vendors.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">🔍</div>
                                <h3>No vendors found</h3>
                                <p>Try adjusting your search or filters.</p>
                            </div>
                        ) : (
                            <div className="vendors-grid">
                                {vendors.map(vendor => (
                                    <div className="vendor-card slide-up" key={vendor._id}
                                        onClick={() => navigate(`/vendors/${vendor.slug}`)} id={`vendor-${vendor.slug}`}>
                                        <div className="vendor-card-header">
                                            <div className="vendor-logo">
                                                {vendor.logo ? (
                                                    <img src={vendor.logo} alt={vendor.name} />
                                                ) : (
                                                    vendor.name.charAt(0)
                                                )}
                                            </div>
                                            <div className="vendor-info">
                                                <div className="vendor-name">{vendor.name}</div>
                                                <div className="vendor-meta">
                                                    <span>📍 {vendor.country}</span>
                                                    <span className="vendor-meta-dot" />
                                                    <span>{vendor.size}</span>
                                                    {vendor.foundedYear && (
                                                        <>
                                                            <span className="vendor-meta-dot" />
                                                            <span>Est. {vendor.foundedYear}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {vendor.shortDescription && (
                                            <p className="vendor-description">{vendor.shortDescription}</p>
                                        )}

                                        {vendor.services?.length > 0 && (
                                            <div className="vendor-services">
                                                {vendor.services.slice(0, 4).map(s => (
                                                    <span className="service-tag" key={s}>{s}</span>
                                                ))}
                                                {vendor.services.length > 4 && (
                                                    <span className="service-tag" style={{ opacity: 0.6 }}>+{vendor.services.length - 4}</span>
                                                )}
                                            </div>
                                        )}

                                        <div className="vendor-card-footer">
                                            <div className="vendor-score">
                                                <span className="score-value">{vendor.globalScore?.toFixed(1)}</span>
                                                <span className="score-max">/ 10</span>
                                            </div>
                                            <span className={`voe-badge ${badgeClass(vendor.badgeVOE)}`}>
                                                <span className="voe-badge-icon">{BADGE_ICONS[vendor.badgeVOE] || '—'}</span>
                                                {vendor.badgeVOE}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
