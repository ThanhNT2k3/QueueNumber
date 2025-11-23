import React from 'react';
import * as Icons from 'lucide-react';
import { useBranches } from '../../../../stores/BranchContext';

interface BranchSelectionProps {
    onSelect: (branchId: string) => void;
}

export const BranchSelection: React.FC<BranchSelectionProps> = ({ onSelect }) => {
    const { branches, loading } = useBranches();

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Icons.Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Select Branch</h2>
            <p className="text-gray-500 mb-12">Please select your current location</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                {branches.map(branch => (
                    <button
                        key={branch.id}
                        onClick={() => onSelect(branch.id)}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-500 transition-all text-left group"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-600">{branch.name}</h3>
                            <Icons.ChevronRight className="text-gray-300 group-hover:text-brand-600" />
                        </div>
                        <p className="text-gray-500 text-sm flex items-center gap-2">
                            <Icons.MapPin size={14} /> {branch.address}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
};
