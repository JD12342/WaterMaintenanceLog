import React, { useState, useEffect } from 'react';
import Layout from '@/layouts/Layout';
import axios from 'axios';

export default function Home({ auth }) {
    const [apiStatus, setApiStatus] = useState('checking...');
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [registerForm, setRegisterForm] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        password_confirmation: '' 
    });
    const [user, setUser] = useState(auth?.user || null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        checkApiStatus();
    }, []);

    const checkApiStatus = async () => {
        try {
            const response = await axios.get('/api/health');
            setApiStatus('✅ API Online');
        } catch (error) {
            setApiStatus('❌ API Offline');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/login', loginForm);
            const { user, token } = response.data;
            localStorage.setItem('sanctum_token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            setMessage('✅ Logged in successfully!');
            setLoginForm({ email: '', password: '' });
        } catch (error) {
            setMessage(`❌ Login failed: ${error.response?.data?.message || 'Unknown error'}`);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/register', registerForm);
            const { user, token } = response.data;
            localStorage.setItem('sanctum_token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            setMessage('✅ Registered successfully!');
            setRegisterForm({ name: '', email: '', password: '', password_confirmation: '' });
        } catch (error) {
            setMessage(`❌ Registration failed: ${error.response?.data?.message || 'Unknown error'}`);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('/api/logout');
            localStorage.removeItem('sanctum_token');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
            setMessage('✅ Logged out successfully!');
        } catch (error) {
            setMessage('❌ Logout failed');
        }
    };

    return (
        <Layout title="Home">
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                        <div className="p-6 lg:p-8 bg-white">
                            <div className="flex items-center">
                                <h1 className="text-2xl font-medium text-gray-900">
                                    Water Maintenance Log System
                                </h1>
                            </div>

                            <p className="mt-6 text-gray-500 leading-relaxed">
                                This is a full-stack Laravel + React application with role-based authentication 
                                using Laravel Sanctum. The system supports different user roles: Admin, Engineering, 
                                Maintenance, and Consumer.
                            </p>

                            <div className="mt-6 bg-gray-50 p-4 rounded">
                                <h3 className="text-lg font-semibold text-gray-700">System Status</h3>
                                <p className="mt-2 text-sm text-gray-600">API Status: {apiStatus}</p>
                            </div>

                            {message && (
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                                    <p className="text-sm text-blue-600">{message}</p>
                                </div>
                            )}

                            {user ? (
                                <div className="mt-6 bg-green-50 p-4 rounded">
                                    <h3 className="text-lg font-semibold text-green-700">Welcome, {user.name}!</h3>
                                    <p className="mt-2 text-sm text-green-600">
                                        Email: {user.email}<br />
                                        Role: {user.role}<br />
                                        Member since: {new Date(user.created_at).toLocaleDateString()}
                                    </p>
                                    <button
                                        onClick={handleLogout}
                                        className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Login Form */}
                                    <div className="bg-gray-50 p-4 rounded">
                                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Login</h3>
                                        <form onSubmit={handleLogin} className="space-y-4">
                                            <div>
                                                <input
                                                    type="email"
                                                    placeholder="Email"
                                                    value={loginForm.email}
                                                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="password"
                                                    placeholder="Password"
                                                    value={loginForm.password}
                                                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded"
                                            >
                                                Login
                                            </button>
                                        </form>
                                    </div>

                                    {/* Register Form */}
                                    <div className="bg-gray-50 p-4 rounded">
                                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Register</h3>
                                        <form onSubmit={handleRegister} className="space-y-4">
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="Full Name"
                                                    value={registerForm.name}
                                                    onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="email"
                                                    placeholder="Email"
                                                    value={registerForm.email}
                                                    onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="password"
                                                    placeholder="Password"
                                                    value={registerForm.password}
                                                    onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="password"
                                                    placeholder="Confirm Password"
                                                    value={registerForm.password_confirmation}
                                                    onChange={(e) => setRegisterForm({...registerForm, password_confirmation: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="w-full px-4 py-2 bg-green-500 hover:bg-green-700 text-white rounded"
                                            >
                                                Register
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}