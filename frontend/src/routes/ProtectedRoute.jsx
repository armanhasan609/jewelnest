import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, roleRequired }) => {
    const location = useLocation();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role')?.toLowerCase().trim() || '';

    // Step 1: Agar login nahi hai toh Login page par bhejo
    if (!token || token === 'undefined') {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // Step 2: Agar route ADMIN maang raha hai par user ADMIN nahi hai
    if (roleRequired === 'admin' && role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    // Step 3: Agar normal user hai aur normal protected route hai (Checkout/Orders)
    return children;
};

export default ProtectedRoute;