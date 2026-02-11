import React, { useContext } from 'react';
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { ShopContext } from "./context/ShopContext";

// Components & Pages
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Sidebar from "./admin/components/AdminSidebar";
import Home from "./pages/Home";
import TodaySale from "./pages/TodaySale";
import Contact from './pages/Contact';
import Collection from "./pages/Collection";
import Product from "./pages/Product";
import Orders from './pages/Orders'; // User side orders
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import DeliveryLogin from "./pages/DeliveryLogin";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import PlaceOrder from "./pages/PlaceOrder";
import EditProduct from './admin/pages/EditProduct';
import Dashboard from "./admin/pages/Dashboard";
import AddProduct from "./admin/pages/AddProduct";
import Analytics from './admin/pages/Analytics';
import Users from './admin/pages/Users';
import AdminOrders from "./admin/pages/Orders"; // Admin side orders
import OrderDetails from "./admin/pages/OrderDetails"; // Import OrderDetails
import ProtectedRoute from "./routes/ProtectedRoute";
import Inquiries from "./admin/pages/Inquiries";

function App() {
  const location = useLocation();
  const { role, token } = useContext(ShopContext);

  const isAdminAuthenticated = location.pathname.startsWith('/admin') && token && role === 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <ToastContainer position="top-right" autoClose={3000} />

      {!isAdminAuthenticated && <Navbar />}

      {/* Admin Layout Container: Flex Row, Full Width */}
      <div className={isAdminAuthenticated ? "flex w-full min-h-screen" : "flex-grow"}>

        {/* Sidebar: Fixed Width handled in sidebar component */}
        {isAdminAuthenticated && <Sidebar />}

        {/* Main Content Area: Flex-1 to fill remaining space, no padding constraint */}
        <main className={isAdminAuthenticated ? "flex-1 w-0 min-w-0 bg-[#f9fafb]" : "flex-grow px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]"}>
          <Routes>
            {/* ---------- PUBLIC ROUTES ---------- */}
            <Route path="/" element={<Home />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/product/:productId" element={<Product />} />
            <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/today-sale" element={<TodaySale />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path='/contact' element={<Contact />} />

            {/* ---------- USER PROTECTED ROUTES ---------- */}
            <Route path='/orders' element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/place-order" element={<ProtectedRoute><PlaceOrder /></ProtectedRoute>} />
            <Route path='/delivery/login' element={<DeliveryLogin />} />

            {/* ---------- ADMIN ROUTES ---------- */}
            <Route path="/admin/dashboard" element={<ProtectedRoute roleRequired="admin"><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/add-product" element={<ProtectedRoute roleRequired="admin"><AddProduct /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute roleRequired="admin"><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/order-details/:orderId" element={<ProtectedRoute roleRequired="admin"><OrderDetails /></ProtectedRoute>} />
            <Route path='/admin/analytics' element={<ProtectedRoute roleRequired="admin"><Analytics /></ProtectedRoute>} />
            <Route path='/admin/users' element={<ProtectedRoute roleRequired="admin"><Users /></ProtectedRoute>} />
            <Route path='/admin/edit/:id' element={<ProtectedRoute roleRequired="admin"><EditProduct /></ProtectedRoute>} />
            <Route path='/admin/inquiries' element={<ProtectedRoute roleRequired="admin"><Inquiries /></ProtectedRoute>} />

            {/* 404 Page */}
            <Route path="*" element={<div className="text-center py-20 text-2xl font-bold">404 - Page Not Found</div>} />
          </Routes>
        </main>
      </div>

      {!isAdminAuthenticated && <Footer />}
    </div>
  );
}

export default App;