import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function PendingPage() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="pending-page">
            <div className="pending-card fade-in">
                <div className="pending-icon">⏳</div>
                <h2>Account Pending Approval</h2>
                <p>
                    Thank you for registering, <strong>{user?.name}</strong>.<br />
                    Your account is currently under review by the VFX Seal team.
                    You will receive an email notification once your account has been approved.
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    This usually takes less than 24 hours during business days.
                </p>
                <button className="btn btn-secondary" onClick={handleLogout} id="pending-logout">
                    Sign Out
                </button>
            </div>
        </div>
    );
}
