import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Phone, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import { ShopContext } from '../context/ShopContext'; // Agar URL context mein hai

const Register = () => {
    const { backendUrl } = useContext(ShopContext); // Context se URL uthana best hai
    const [formData, setFormData] = useState({
        name: '', // Ab sirf ek name
        email: '',
        phoneNumber: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Full name is required';
        if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
        if (!/^\d{10}$/.test(formData.phoneNumber)) newErrors.phoneNumber = 'Invalid 10-digit phone number';
        if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (!agreeToTerms) newErrors.terms = 'Please accept the terms and conditions';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'phoneNumber' ? value.replace(/\D/g, '').slice(0, 10) : value
        }));
        // Clear error as user types
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await axios.post(`${backendUrl}/api/users/register`, formData);

            if (response.data.success) {
                toast.success("Account created! Please login.");
                navigate('/login');
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <h2 className="text-3xl font-black text-center mb-2">Create Account</h2>
                <p className="text-gray-500 text-center mb-8">Join our community today</p>

                <form onSubmit={submitHandler} className="space-y-5">
                    {/* Name Field */}
                    <div>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                                name="name"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
                    </div>

                    {/* Email Field */}
                    <div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                                name="email"
                                type="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                    </div>

                    {/* Phone Field */}
                    <div>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                                name="phoneNumber"
                                placeholder="Phone Number"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                            />
                        </div>
                        {errors.phoneNumber && <p className="text-red-500 text-xs mt-1 ml-1">{errors.phoneNumber}</p>}
                    </div>

                    {/* Password Field */}
                    <div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Create Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-black"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
                    </div>

                    {/* Terms */}
                    <div className="flex items-start gap-2 py-2">
                        <input
                            type="checkbox"
                            className="mt-1 accent-black"
                            id="terms"
                            checked={agreeToTerms}
                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                        />
                        <label htmlFor="terms" className="text-sm text-gray-600">
                            I agree to the <span className="text-black font-bold underline cursor-pointer">Terms of Service</span> and Privacy Policy.
                        </label>
                    </div>
                    {errors.terms && <p className="text-red-500 text-xs -mt-2">{errors.terms}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-[0.98] disabled:bg-gray-400 shadow-lg"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-8">
                    Already have an account? <Link to="/login" className="text-black font-bold hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;