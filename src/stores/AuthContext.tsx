import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'TELLER' | 'MANAGER';
    avatar?: string;
    assignedCounterId?: string;
    branchId?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    updateAssignedCounter: (counterId: string) => void;
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
            const response = await fetch('http://localhost:5257/api/auth/simple-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password })
            });

            if (response.ok) {
                const data = await response.json();
                const mappedUser: User = {
                    id: data.id,
                    name: data.fullName, // Map backend FullName to frontend name
                    email: data.username, // Map backend Username to frontend email
                    role: data.role,
                    avatar: data.avatarUrl,
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

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateAssignedCounter, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
