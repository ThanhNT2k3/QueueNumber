import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { API_BASE_URL } from '../config/constants';

export interface Category {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    isActive: boolean;
    displayOrder: number;
}

interface CategoryStore {
    categories: Category[];
    loading: boolean;
    error: string | null;

    fetchCategories: () => Promise<void>;
    refreshCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>()(
    devtools(
        (set, get) => ({
            categories: [],
            loading: false,
            error: null,

            fetchCategories: async () => {
                set({ loading: true, error: null });
                try {
                    const response = await fetch(`${API_BASE_URL}/category`);

                    if (!response.ok) {
                        throw new Error('Failed to fetch categories');
                    }

                    const data = await response.json();
                    // Sort by display order
                    const sortedData = data.sort((a: Category, b: Category) => a.displayOrder - b.displayOrder);
                    set({ categories: sortedData, loading: false });
                } catch (err) {
                    console.error('Error fetching categories:', err);
                    set({
                        error: err instanceof Error ? err.message : 'Unknown error',
                        loading: false,
                        // Fallback data
                        categories: [
                            {
                                id: '0',
                                name: 'Deposit & Withdrawal',
                                description: 'Cash deposits and withdrawals',
                                icon: 'Wallet',
                                color: '#3B82F6',
                                isActive: true,
                                displayOrder: 1
                            },
                            {
                                id: '1',
                                name: 'Loans & Credit',
                                description: 'Loan applications and credit services',
                                icon: 'Banknote',
                                color: '#10B981',
                                isActive: true,
                                displayOrder: 2
                            },
                            {
                                id: '2',
                                name: 'Advisory Services',
                                description: 'Financial consultation and advisory',
                                icon: 'Users',
                                color: '#8B5CF6',
                                isActive: true,
                                displayOrder: 3
                            },
                            {
                                id: '4',
                                name: 'VIP Priority',
                                description: 'Priority service for VIP customers',
                                icon: 'Crown',
                                color: '#F59E0B',
                                isActive: true,
                                displayOrder: 4
                            },
                        ]
                    });
                }
            },

            refreshCategories: async () => {
                await get().fetchCategories();
            }
        }),
        { name: 'CategoryStore' }
    )
);
