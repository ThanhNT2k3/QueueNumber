import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/constants';

interface Branch {
    id: string;
    name: string;
    address: string;
    isActive: boolean;
}

interface BranchContextType {
    branches: Branch[];
    loading: boolean;
    error: string | null;
    refreshBranches: () => Promise<void>;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const BranchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_BASE_URL}/branches`);

            if (!response.ok) {
                throw new Error('Failed to fetch branches');
            }

            const data = await response.json();
            setBranches(data);
        } catch (err) {
            console.error('Error fetching branches:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');

            // Fallback to hardcoded branches if API fails
            setBranches([
                { id: 'HQ', name: 'Headquarters (Hội sở chính)', address: '123 Bank Street, Dist 1', isActive: true },
                { id: 'B01', name: 'Saigon Centre Branch', address: '65 Le Loi, Dist 1', isActive: true },
                { id: 'B02', name: 'Landmark 81 Branch', address: '208 Nguyen Huu Canh, Binh Thanh', isActive: true },
                { id: 'B03', name: 'Thu Duc Branch', address: '1 Vo Van Ngan, Thu Duc', isActive: true },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    const value: BranchContextType = {
        branches,
        loading,
        error,
        refreshBranches: fetchBranches,
    };

    return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>;
};

export const useBranches = () => {
    const context = useContext(BranchContext);
    if (context === undefined) {
        throw new Error('useBranches must be used within a BranchProvider');
    }
    return context;
};
