import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User } from '../types/types';
import { API_BASE_URL } from '../config/constants';

interface AuthStore {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    login: (email: string, password: string) => Promise<boolean>;
    loginWithMicrosoft: (idToken: string, accessToken: string) => Promise<boolean>;
    logout: () => void;
    updateAssignedCounter: (counterId: string) => void;
    assignCounter: (counterId: string, reason?: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthStore>()(
    devtools(
        persist(
            (set, get) => ({
                user: null,
                isAuthenticated: false,
                isLoading: false,

                login: async (email, password) => {
                    set({ isLoading: true });
                    try {
                        const response = await fetch(`${API_BASE_URL}/auth/simple-login`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username: email, password })
                        });

                        if (response.ok) {
                            const data = await response.json();
                            const mappedUser: User = {
                                id: data.id,
                                username: data.username,
                                fullName: data.fullName,
                                email: data.username,
                                role: data.role,
                                avatar: data.avatarUrl,
                                avatarUrl: data.avatarUrl,
                                assignedCounterId: data.assignedCounterId,
                                branchId: data.branchId
                            };
                            set({ user: mappedUser, isAuthenticated: true, isLoading: false });
                            return true;
                        }
                    } catch (error) {
                        console.error("Login failed", error);
                    }

                    set({ isLoading: false });
                    return false;
                },

                loginWithMicrosoft: async (idToken, accessToken) => {
                    set({ isLoading: true });
                    try {
                        const response = await fetch(`${API_BASE_URL}/auth/microsoft-login`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ idToken, accessToken })
                        });

                        if (response.ok) {
                            const data = await response.json();
                            const mappedUser: User = {
                                id: data.id,
                                username: data.email,
                                fullName: data.fullName,
                                email: data.email,
                                role: data.role,
                                avatar: data.avatarUrl || data.picture,
                                avatarUrl: data.avatarUrl || data.picture,
                                assignedCounterId: data.assignedCounterId,
                                branchId: data.branchId
                            };
                            set({ user: mappedUser, isAuthenticated: true, isLoading: false });
                            return true;
                        }
                    } catch (error) {
                        console.error("Microsoft login failed", error);
                    }

                    set({ isLoading: false });
                    return false;
                },

                logout: () => {
                    set({ user: null, isAuthenticated: false });
                    // Note: persist middleware handles localStorage clearing for the store state
                    // but if we had other items in localStorage we might want to clear them here
                },

                updateAssignedCounter: (counterId) => {
                    const { user } = get();
                    if (user) {
                        set({ user: { ...user, assignedCounterId: counterId } });
                    }
                },

                assignCounter: async (counterId, reason) => {
                    const { user, updateAssignedCounter } = get();
                    if (!user) return false;

                    try {
                        const response = await fetch(`${API_BASE_URL}/counters/${counterId}/assign-staff`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: user.id,
                                performedByUserId: user.id,
                                performedByUserName: user.fullName,
                                reason: reason || 'Teller switched counter'
                            })
                        });

                        if (response.ok) {
                            updateAssignedCounter(counterId);
                            return true;
                        } else {
                            console.error('Failed to assign counter:', await response.text());
                            return false;
                        }
                    } catch (error) {
                        console.error('Error assigning counter:', error);
                        return false;
                    }
                }
            }),
            {
                name: 'qms_auth_storage', // unique name for localStorage key
                partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }), // only persist user and auth status
            }
        ),
        { name: 'AuthStore' }
    )
);
