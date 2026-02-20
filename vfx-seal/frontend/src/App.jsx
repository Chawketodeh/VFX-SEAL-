import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PendingPage from './pages/PendingPage';
import VendorsPage from './pages/VendorsPage';
import VendorDetailPage from './pages/VendorDetailPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminVendorForm from './pages/AdminVendorForm';

function ProtectedRoute({ children, requireApproval = false, adminOnly = false }) {
    const { isLoggedIn, isApproved, isAdmin, loading, user } = useAuth();

    if (loading) return <div className="loading"><div className="spinner"></div></div>;
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    if (adminOnly && !isAdmin) return <Navigate to="/vendors" replace />;
    if (requireApproval && !isAdmin && !isApproved) return <Navigate to="/pending" replace />;

    return children;
}

export default function App() {
    const { isLoggedIn, isApproved, isAdmin, loading } = useAuth();

    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    return (
        <>
            {isLoggedIn && <Navbar />}
            <Routes>
                {/* Public */}
                <Route path="/login" element={
                    isLoggedIn ? (
                        isAdmin ? <Navigate to="/admin" replace /> :
                            isApproved ? <Navigate to="/vendors" replace /> :
                                <Navigate to="/pending" replace />
                    ) : <LoginPage />
                } />
                <Route path="/register" element={
                    isLoggedIn ? <Navigate to="/vendors" replace /> : <RegisterPage />
                } />

                {/* Pending */}
                <Route path="/pending" element={
                    <ProtectedRoute>
                        <PendingPage />
                    </ProtectedRoute>
                } />

                {/* Protected — requires approval */}
                <Route path="/vendors" element={
                    <ProtectedRoute requireApproval>
                        <VendorsPage />
                    </ProtectedRoute>
                } />
                <Route path="/vendors/:slug" element={
                    <ProtectedRoute requireApproval>
                        <VendorDetailPage />
                    </ProtectedRoute>
                } />

                {/* Admin only */}
                <Route path="/admin" element={
                    <ProtectedRoute adminOnly>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/admin/vendors/new" element={
                    <ProtectedRoute adminOnly>
                        <AdminVendorForm />
                    </ProtectedRoute>
                } />
                <Route path="/admin/vendors/:id/edit" element={
                    <ProtectedRoute adminOnly>
                        <AdminVendorForm />
                    </ProtectedRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={
                    <Navigate to={isLoggedIn ? (isAdmin ? "/admin" : "/vendors") : "/login"} replace />
                } />
            </Routes>
        </>
    );
}
