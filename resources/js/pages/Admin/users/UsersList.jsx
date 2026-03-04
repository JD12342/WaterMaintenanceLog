import { useState } from 'react';
import { router } from '@inertiajs/react';
import { MagnifyingGlassIcon, PencilIcon, TrashIcon, UserPlusIcon, FunnelIcon } from '@heroicons/react/24/outline';

const ROLE_BADGES = {
    ADMIN: 'bg-red-100 text-red-800',
    ENGINEERING: 'bg-purple-100 text-purple-800',
    MAINTENANCE: 'bg-blue-100 text-blue-800',
    CONSUMER: 'bg-green-100 text-green-800'
};

export default function UsersList({ users = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    // Edit user state
    const [editUser, setEditUser] = useState(null);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [editErrors, setEditErrors] = useState({});

    // Create staff state
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [creating, setCreating] = useState(false);
    const [createErrors, setCreateErrors] = useState({});

    const openEdit = (user) => {
        setEditUser(user);
        setEditName(user.name);
        setEditEmail(user.email);
        setEditPassword('');
        setEditErrors({});
    };

    const saveUser = () => {
        setSaving(true);
        setEditErrors({});
        const data = { name: editName, email: editEmail };
        if (editPassword) data.password = editPassword;
        router.put(`/dashboard/users/${editUser.id}`, data, {
            preserveScroll: true,
            onSuccess: () => setEditUser(null),
            onError: (errors) => setEditErrors(errors),
            onFinish: () => setSaving(false),
        });
    };

    const createStaff = () => {
        setCreating(true);
        setCreateErrors({});
        router.post('/dashboard/users', {
            name: newName,
            email: newEmail,
            password: newPassword,
        }, {
            preserveScroll: true,
            onSuccess: () => { setShowCreate(false); setNewName(''); setNewEmail(''); setNewPassword(''); },
            onError: (errors) => setCreateErrors(errors),
            onFinish: () => setCreating(false),
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
                <h1 className="text-2xl font-bold text-slate-800">Users Management</h1>
                <button
                    onClick={() => { setShowCreate(true); setCreateErrors({}); setNewName(''); setNewEmail(''); setNewPassword(''); }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium transition-colors"
                >
                    <UserPlusIcon className="h-4 w-4" />
                    Add Maintenance Staff
                </button>
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-3 top-2.5" />
                        <input type="text" placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-xl text-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div className="flex items-center gap-2">
                        <FunnelIcon className="h-5 w-5 text-slate-400" />
                        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                            <option value="all">All Roles</option>
                            <option value="ADMIN">Admin</option>
                            <option value="ENGINEERING">Engineering</option>
                            <option value="MAINTENANCE">Maintenance</option>
                            <option value="CONSUMER">Consumer</option>
                        </select>
                    </div>
                    <span className="text-xs text-slate-400 ml-auto">{filteredUsers.length} users</span>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium text-slate-800">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${ROLE_BADGES[user.role] || 'bg-gray-100 text-gray-800'}`}>{user.role}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit Details">
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => deleteUser(user.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && <p className="text-center py-12 text-slate-400 text-sm">No users found.</p>}
                </div>
            </div>

            {/* Edit User Modal */}
            {editUser && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-slate-800">Edit User Details</h3>
                            <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                    {editUser.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{editUser.name}</p>
                                    <p className="text-xs text-slate-400">{editUser.role}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                                <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-blue-500 focus:border-blue-500" />
                                {editErrors.name && <p className="text-xs text-red-500 mt-1">{editErrors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                                <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-blue-500 focus:border-blue-500" />
                                {editErrors.email && <p className="text-xs text-red-500 mt-1">{editErrors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password <span className="text-slate-400 font-normal">(leave blank to keep current)</span></label>
                                <input type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} placeholder="••••••••"
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-blue-500 focus:border-blue-500" />
                                {editErrors.password && <p className="text-xs text-red-500 mt-1">{editErrors.password}</p>}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setEditUser(null)} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 text-sm font-medium transition-colors">Cancel</button>
                            <button onClick={saveUser} disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors">
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Maintenance Staff Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-slate-800">Add Maintenance Staff</h3>
                            <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
                        </div>
                        <p className="text-xs text-slate-400 mb-4">This will create a new user with the <span className="font-semibold text-blue-600">Maintenance</span> role.</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="John Doe"
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-blue-500 focus:border-blue-500" />
                                {createErrors.name && <p className="text-xs text-red-500 mt-1">{createErrors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="john@example.com"
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-blue-500 focus:border-blue-500" />
                                {createErrors.email && <p className="text-xs text-red-500 mt-1">{createErrors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimum 8 characters"
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-blue-500 focus:border-blue-500" />
                                {createErrors.password && <p className="text-xs text-red-500 mt-1">{createErrors.password}</p>}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowCreate(false)} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 text-sm font-medium transition-colors">Cancel</button>
                            <button onClick={createStaff} disabled={creating || !newName || !newEmail || !newPassword}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors">
                                {creating ? 'Creating...' : 'Create Staff'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
