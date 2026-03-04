import { useState } from 'react';
import { router } from '@inertiajs/react';
import { MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const ROLE_BADGES = {
    ADMIN: 'bg-red-100 text-red-800',
    ENGINEERING: 'bg-purple-100 text-purple-800',
    MAINTENANCE: 'bg-blue-100 text-blue-800',
    CONSUMER: 'bg-green-100 text-green-800'
};

export default function UsersList({ users = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [editUser, setEditUser] = useState(null);
    const [editRole, setEditRole] = useState('');
    const [saving, setSaving] = useState(false);

    const openEdit = (user) => {
        setEditUser(user);
        setEditRole(user.role);
    };

    const saveRole = () => {
        setSaving(true);
        router.put(`/dashboard/users/${editUser.id}`, { role: editRole }, {
            preserveScroll: true,
            onSuccess: () => setEditUser(null),
            onFinish: () => setSaving(false),
        });
    };

    const deleteUser = (userId) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        router.delete(`/dashboard/users/${userId}`, { preserveScroll: true });
    };

    const filteredUsers = users.filter(u => {
        const matchSearch =
            u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = roleFilter === 'all' || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
                <span className="text-sm text-gray-500">{users.length} total users</span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 max-w-md">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                        <input type="text" placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2">
                        <option value="all">All Roles</option>
                        <option value="ADMIN">Admin</option>
                        <option value="ENGINEERING">Engineering</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="CONSUMER">Consumer</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm mr-3">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${ROLE_BADGES[user.role] || 'bg-gray-100 text-gray-800'}`}>{user.role}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                                        <button onClick={() => openEdit(user)} className="text-blue-600 hover:text-blue-900" title="Edit Role"><PencilIcon className="h-4 w-4 inline" /></button>
                                        <button onClick={() => deleteUser(user.id)} className="text-red-600 hover:text-red-900" title="Delete"><TrashIcon className="h-4 w-4 inline" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && <p className="text-center py-8 text-gray-400">No users found.</p>}
                </div>
            </div>

            {editUser && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Edit Role</h3>
                            <button onClick={() => setEditUser(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">User: <span className="font-medium">{editUser.name}</span></p>
                        <select value={editRole} onChange={e => setEditRole(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4">
                            <option value="ADMIN">Admin</option>
                            <option value="ENGINEERING">Engineering</option>
                            <option value="MAINTENANCE">Maintenance</option>
                            <option value="CONSUMER">Consumer</option>
                        </select>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setEditUser(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
                            <button onClick={saveRole} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
