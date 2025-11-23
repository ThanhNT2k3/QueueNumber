import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { API_BASE_URL } from '../config/constants';

interface Branch {
    id: string;
    name: string;
    address: string;
    isActive: boolean;
}

interface BranchStore {
    branches: Branch[];
    loading: boolean;
    error: string | null;

    fetchBranches: () => Promise<void>;
    refreshBranches: () => Promise<void>;
}

export const useBranchStore = create<BranchStore>()(
    devtools(
        (set, get) => ({
            branches: [],
            loading: false,
            error: null,

            fetchBranches: async () => {
                set({ loading: true, error: null });
                try {
                    const response = await fetch(`${API_BASE_URL}/branch`);

                    if (!response.ok) {
                        throw new Error('Failed to fetch branches');
                    }

                    const data = await response.json();
                    set({ branches: data, loading: false });
                } catch (err) {
                    console.error('Error fetching branches:', err);
                    set({
                        error: err instanceof Error ? err.message : 'Unknown error',
                        loading: false,
                        // Fallback data similar to Context
                        branches: [
                            { id: 'HQ', name: 'Headquarters (Hội sở chính)', address: '123 Bank Street, Dist 1', isActive: true },
                            { id: 'B01', name: 'Saigon Centre Branch', address: '65 Le Loi, Dist 1', isActive: true },
                            { id: 'B02', name: 'Landmark 81 Branch', address: '208 Nguyen Huu Canh, Binh Thanh', isActive: true },
                            { id: 'B03', name: 'Thu Duc Branch', address: '1 Vo Van Ngan, Thu Duc', isActive: true },
                        ]
                    });
                }
            },

            refreshBranches: async () => {
                await get().fetchBranches();
            }
        }),
        { name: 'BranchStore' }
    )
);
