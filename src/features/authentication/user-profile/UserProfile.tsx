import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../stores';
import * as Icons from 'lucide-react';
import { Button, TextInput, Alert, Card } from '../../../components/ui';

export const UserProfile: React.FC = () => {
    const { user, logout } = useAuthStore();
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setFullName(user.fullName);
            setAvatarUrl(user.avatar || '');
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
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

                <Card>
                    {/* Header / Cover */}
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>

                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <div className="relative">
                                <img
                                    src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`}
                                    alt={user.fullName}
                                    className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-white"
                                />
                                {isEditing && (
                                    <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50">
                                        <Icons.Camera size={16} className="text-gray-600" />
                                    </div>
                                )}
                            </div>
                            {!isEditing && (
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    variant="outline"
                                    leftIcon={<Icons.Edit2 size={16} />}
                                >
                                    Edit Profile
                                </Button>
                            )}
                        </div>

                        {message && (
                            <Alert
                                variant={message.type === 'success' ? 'success' : 'error'}
                                className="mb-6"
                                onClose={() => setMessage(null)}
                            >
                                {message.text}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <TextInput
                                    label="Full Name"
                                    value={user.fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    disabled={!isEditing}
                                />

                                <TextInput
                                    label="Role"
                                    value={user.role}
                                    disabled
                                />

                                <TextInput
                                    label="Email / Username"
                                    value={user.email}
                                    disabled
                                />

                                <TextInput
                                    label="Assigned Counter ID"
                                    value={user.assignedCounterId || 'None'}
                                    disabled
                                    className="font-mono text-sm"
                                />

                                {isEditing && (
                                    <div className="col-span-2">
                                        <TextInput
                                            label="Avatar URL"
                                            value={avatarUrl}
                                            onChange={(e) => setAvatarUrl(e.target.value)}
                                            placeholder="https://example.com/avatar.jpg"
                                        />
                                    </div>
                                )}
                            </div>

                            {isEditing && (
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFullName(user.fullName);
                                            setAvatarUrl(user.avatar || '');
                                            setMessage(null);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        isLoading={isLoading}
                                        leftIcon={!isLoading && <Icons.Save size={18} />}
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                        </form>
                    </div>
                </Card>
            </div>
        </div>
    );
};
