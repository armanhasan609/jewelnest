import React from 'react';
import { Routes, Route } from 'react-router-dom';

// User Pages
import Home from '../pages/Home';
import Collection from '../pages/Collection';
import Product from '../pages/Product';
import Cart from '../pages/Cart';
import Login from '../pages/Login';
import Register from '../pages/Register';
import PlaceOrder from '../pages/PlaceOrder';
import TermsOfService from '../pages/TermsOfService';
import PrivacyPolicy from '../pages/PrivacyPolicy';

// Admin Pages
import Dashboard from '../admin/pages/Dashboard';
import AddProduct from '../admin/pages/AddProduct';
import Orders from '../admin/pages/Orders';

// Security Wrapper
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
    return (
        <Routes>
            {/* ---------- PUBLIC ROUTES (Koi bhi dekh sakta hai) ---------- */}
            <Route path="/" element={<Home />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/product/:productId" element={<Product />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />

            {/* ---------- USER PROTECTED ROUTES (Sirf logged-in users ke liye) ---------- */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/place-order" element={<PlaceOrder />} />

            {/* ---------- ADMIN PROTECTED ROUTES (Sirf Admin ke liye) ---------- */}
            <Route
                path="/admin/dashboard"
                element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />
            <Route
                path="/admin/add-product"
                element={<ProtectedRoute><AddProduct /></ProtectedRoute>}
            />
            <Route
                path="/admin/orders"
                element={<ProtectedRoute><Orders /></ProtectedRoute>}
            />

            {/* 404 Page */}
            <Route path="*" element={<div className='text-center py-20 font-bold text-2xl'>404 - Page Not Found</div>} />
        </Routes>
    );
};

export default AppRoutes;