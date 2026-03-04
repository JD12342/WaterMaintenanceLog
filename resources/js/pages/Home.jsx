import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { 
    UserGroupIcon, 
    CogIcon, 
    WrenchScrewdriverIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';

export default function Home({ auth }) {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showComplaintForm, setShowComplaintForm] = useState(false);

    const ComplaintForm = () => {
        const [data, setFormData] = useState({
            name: '',
            email: '',
            phone: '',
            location: '',
            description: '',
            priority: 'normal'
        });
        const [processing, setProcessing] = useState(false);
        const [errors, setErrors] = useState({});
        const [successMessage, setSuccessMessage] = useState('');

        const setData = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

        const reset = () => setFormData({ name: '', email: '', phone: '', location: '', description: '', priority: 'normal' });

        const submit = (e) => {
            e.preventDefault();
            setProcessing(true);
            setErrors({});
            router.post('/complaints/public', data, {
                onSuccess: () => {
                    reset();
                    setProcessing(false);
                    setShowComplaintForm(false);
                    alert('Complaint submitted successfully! We will contact you soon.');
                },
                onError: (errors) => {
                    setProcessing(false);
                    setErrors(errors);
                },
            });
        };

        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-lg bg-white">
                    <div className="mt-3">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Submit a Complaint</h3>
                            <button 
                                onClick={() => setShowComplaintForm(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                        
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <select
                                        value={data.priority}
                                        onChange={e => setData('priority', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="normal">Normal</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                    {errors.priority && <p className="text-red-600 text-sm mt-1">{errors.priority}</p>}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input
                                    type="text"
                                    value={data.location}
                                    onChange={e => setData('location', e.target.value)}
                                    placeholder="Street, Barangay, City"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows="4"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="Please describe the water maintenance issue in detail..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                ></textarea>
                                {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowComplaintForm(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'Submitting...' : 'Submit Complaint'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    const LoginModal = () => (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
                <div className="mt-3">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Staff Login</h3>
                        <button 
                            onClick={() => setShowLoginModal(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <span className="text-2xl">&times;</span>
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                        <a 
                            href="/login?role=admin"
                            className="block w-full p-4 text-left border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors group"
                        >
                            <div className="flex items-center">
                                <UserGroupIcon className="h-5 w-5 text-red-500 mr-3" />
                                <div>
                                    <div className="font-medium text-gray-900 group-hover:text-blue-600">Admin Login</div>
                                    <div className="text-sm text-gray-500">System administration</div>
                                </div>
                                <ChevronRightIcon className="h-4 w-4 text-gray-400 ml-auto" />
                            </div>
                        </a>

                        <a 
                            href="/login?role=engineering"
                            className="block w-full p-4 text-left border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors group"
                        >
                            <div className="flex items-center">
                                <CogIcon className="h-5 w-5 text-blue-500 mr-3" />
                                <div>
                                    <div className="font-medium text-gray-900 group-hover:text-blue-600">Engineering Department</div>
                                    <div className="text-sm text-gray-500">Technical review & approval</div>
                                </div>
                                <ChevronRightIcon className="h-4 w-4 text-gray-400 ml-auto" />
                            </div>
                        </a>

                        <a 
                            href="/login?role=maintenance"
                            className="block w-full p-4 text-left border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors group"
                        >
                            <div className="flex items-center">
                                <WrenchScrewdriverIcon className="h-5 w-5 text-green-500 mr-3" />
                                <div>
                                    <div className="font-medium text-gray-900 group-hover:text-blue-600">Maintenance Staff (Tubero)</div>
                                    <div className="text-sm text-gray-500">Field work & repairs</div>
                                </div>
                                <ChevronRightIcon className="h-4 w-4 text-gray-400 ml-auto" />
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );

    // Main landing page JSX
    return (
        <>
            <Head title="Water Maintenance Management System" />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                {/* Header */}
                <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <WrenchScrewdriverIcon className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <h1 className="text-lg font-semibold text-gray-900">Water Maintenance</h1>
                                    <p className="text-sm text-gray-500">Management System</p>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => setShowLoginModal(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Staff Login
                            </button>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                            Report Water Issues
                            <span className="block text-blue-600">Get Fast Response</span>
                        </h1>
                        
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            Our water maintenance management system ensures quick resolution of water supply issues, 
                            pipe repairs, and maintenance requests in your community.
                        </p>
                        
                        <button
                            onClick={() => setShowComplaintForm(true)}
                            className="bg-blue-600 text-white text-lg px-8 py-4 rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                        >
                            Send Complaint
                        </button>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
                            <p className="text-lg text-gray-600">Simple process to get your water issues resolved</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ExclamationTriangleIcon className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Submit Report</h3>
                                <p className="text-gray-600">Describe your water maintenance issue with location details</p>
                            </div>
                            
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CogIcon className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Technical Review</h3>
                                <p className="text-gray-600">Engineering team reviews and approves the repair request</p>
                            </div>
                            
                            <div className="text-center">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <WrenchScrewdriverIcon className="h-8 w-8 text-orange-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Field Work</h3>
                                <p className="text-gray-600">Qualified maintenance staff performs the necessary repairs</p>
                            </div>
                            
                            <div className="text-center">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Completed</h3>
                                <p className="text-gray-600">Work is completed and verified by our team</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center text-gray-300">
                                        <PhoneIcon className="h-4 w-4 mr-2" />
                                        <span>Emergency: (02) 8-WATER-1</span>
                                    </div>
                                    <div className="flex items-center text-gray-300">
                                        <EnvelopeIcon className="h-4 w-4 mr-2" />
                                        <span>support@watermaintenance.local</span>
                                    </div>
                                    <div className="flex items-center text-gray-300">
                                        <MapPinIcon className="h-4 w-4 mr-2" />
                                        <span>City Municipal Building, Main St.</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Office Hours</h3>
                                <div className="space-y-2 text-gray-300">
                                    <p>Monday - Friday: 7:00 AM - 5:00 PM</p>
                                    <p>Saturday: 8:00 AM - 12:00 PM</p>
                                    <p>Emergency repairs: 24/7</p>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                                <div className="space-y-2">
                                    <button 
                                        onClick={() => setShowComplaintForm(true)}
                                        className="block text-gray-300 hover:text-white transition-colors"
                                    >
                                        Submit Complaint
                                    </button>
                                    <button 
                                        onClick={() => setShowLoginModal(true)}
                                        className="block text-gray-300 hover:text-white transition-colors"
                                    >
                                        Staff Login
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
                            <p className="text-gray-400">
                                © 2026 Water Maintenance Management System. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Modals */}
            {showLoginModal && <LoginModal />}
            {showComplaintForm && <ComplaintForm />}
        </>
    );
}