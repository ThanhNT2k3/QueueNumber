import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/types';
import { API_BASE_URL } from '../config/constants';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    loginWithMicrosoft: (idToken: string, accessToken: string) => Promise<boolean>;
    logout: () => void;
    updateAssignedCounter: (counterId: string) => void;
    assignCounter: (counterId: string, reason?: string) => Promise<boolean>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('qms_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem('qms_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
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
                setUser(mappedUser);
                localStorage.setItem('qms_user', JSON.stringify(mappedUser));
                setIsLoading(false);
                return true;
            }
        } catch (error) {
            console.error("Login failed", error);
        }

        setIsLoading(false);
        return false;
    };
    const loginWithMicrosoft = async (idToken: string, accessToken: string): Promise<boolean> => {
        setIsLoading(true);
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
                setUser(mappedUser);
                localStorage.setItem('qms_user', JSON.stringify(mappedUser));
                setIsLoading(false);
                return true;
            }
        } catch (error) {
            console.error("Microsoft login failed", error);
        }

        setIsLoading(false);
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('qms_user');
    };

    const updateAssignedCounter = (counterId: string) => {
        if (user) {
            const updatedUser = { ...user, assignedCounterId: counterId };
            setUser(updatedUser);
            localStorage.setItem('qms_user', JSON.stringify(updatedUser));
        }
    };

    /**
     * Assign user to a counter with backend API call and audit logging
     * This should be used when teller switches counter to ensure proper audit trail
     */
    const assignCounter = async (counterId: string, reason?: string): Promise<boolean> => {
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
                // Update local state after successful API call
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
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, loginWithMicrosoft, logout, updateAssignedCounter, assignCounter, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
