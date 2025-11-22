import React, { useState, useEffect } from 'react';
import { useAuth } from '../../stores/AuthContext';
import * as Icons from 'lucide-react';

export const UserProfile: React.FC = () => {
    const { user, login } = useAuth(); // In a real app, we'd have an update function in context
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setFullName(user.name);
            setAvatarUrl(user.avatar || '');
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // In a real implementation, we would call an API endpoint here:
            // await api.updateProfile({ fullName, avatarUrl });

            // For now, we'll just show a success message as we haven't implemented the backend update yet
            // To make it persist locally for the session, we'd need to update the AuthContext

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-8 flex justify-center">
            <div className="w-full max-w-2xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header / Cover */}
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>

                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <div className="relative">
                                <img
                                    src={avatarUrl || user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                    alt={user.name}
                                    className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-white"
                                />
                                {isEditing && (
                                    <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50">
                                        <Icons.Camera size={16} className="text-gray-600" />
                                    </div>
                                )}
                            </div>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                                >
                                    <Icons.Edit2 size={16} /> Edit Profile
                                </button>
                            )}
                        </div>

                        {message && (
                            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message.type === 'success' ? <Icons.CheckCircle size={20} /> : <Icons.AlertCircle size={20} />}
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Role</label>
                                    <input
                                        type="text"
                                        value={user.role}
                                        disabled
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Email / Username</label>
                                    <input
                                        type="text"
                                        value={user.email}
                                        disabled
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Assigned Counter ID</label>
                                    <input
                                        type="text"
                                        value={user.assignedCounterId || 'None'}
                                        disabled
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 font-mono text-sm"
                                    />
                                </div>
                                {isEditing && (
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Avatar URL</label>
                                        <input
                                            type="text"
                                            value={avatarUrl}
                                            onChange={(e) => setAvatarUrl(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="https://example.com/avatar.jpg"
                                        />
                                    </div>
                                )}
                            </div>

                            {isEditing && (
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFullName(user.name);
                                            setAvatarUrl(user.avatar || '');
                                            setMessage(null);
                                        }}
                                        className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isLoading ? <Icons.Loader2 className="animate-spin" size={18} /> : <Icons.Save size={18} />}
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
