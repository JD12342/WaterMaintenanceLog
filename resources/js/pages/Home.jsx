import React from 'react';
import { Head } from '@inertiajs/react';
import Layout from '../layouts/Layout';
import Dashboard from './Dashboard';

export default function Home({ auth }) {
    // If user is authenticated, show dashboard
    if (auth.user) {
        return <Dashboard auth={auth} />;
    }

    // If not authenticated, show landing page
    return (
        <Layout user={auth.user}>
            <Head title="Water Maintenance System" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 lg:p-8">
                            <div className="text-center">
                                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                    Water Maintenance System
                                </h1>
                                <p className="text-lg text-gray-600 mb-8">
                                    Submit complaints, track repairs, and manage water maintenance workflows
                                </p>
                                
                                <div className="space-y-4 max-w-md mx-auto">
                                    <a
                                        href="/login"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg block text-center"
                                    >
                                        Login
                                    </a>
                                    <a
                                        href="/register"
                                        className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg block text-center"
                                    >
                                        Register
                                    </a>
                                </div>
                                
                                <div className="mt-8 text-sm text-gray-500">
                                    <h3 className="font-semibold mb-2">System Features:</h3>
                                    <ul className="space-y-1">
                                        <li>• End users can submit repair complaints</li>
                                        <li>• Admin manages and assigns work orders</li>
                                        <li>• Engineering approves/declines requests</li>
                                        <li>• Maintenance staff completes work and submits reports</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}