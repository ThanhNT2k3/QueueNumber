import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { useCounterSession } from '../useCounterSession';

interface CounterHeaderProps {
    waitingCount: number;
}

export const CounterHeader: React.FC<CounterHeaderProps> = ({ waitingCount }) => {
    const { myCounter, counters, user, selectedCounterId, handleCounterSelect, handleToggleStatus, isOnline } = useCounterSession();
    const [isCounterSelectOpen, setIsCounterSelectOpen] = useState(false);

    if (!myCounter) return null;

    return (
        <>
            <div className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Icons.Monitor className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-bold text-gray-900">{myCounter.name}</h1>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {isOnline ? 'ACTIVE' : 'OFFLINE'}
                            </span>
                            <button
                                onClick={() => setIsCounterSelectOpen(true)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Change counter"
                            >
                                <Icons.RefreshCw size={12} />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">{user?.fullName || 'N/A'} • {user?.branchId || 'N/A'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-lg">
                        <Icons.Users className="w-4 h-4 text-orange-600" />
                        <div>
                            <p className="text-[10px] text-orange-600 font-medium">Waiting</p>
                            <p className="text-lg font-bold text-orange-700 leading-none">{waitingCount}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleToggleStatus}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${isOnline ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-600' : 'bg-red-600'}`}></div>
                        {isOnline ? 'ONLINE' : 'OFFLINE'}
                    </button>
                </div>
            </div>

            {/* Counter Selection Modal */}
            {isCounterSelectOpen && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Select Working Counter</h3>
                        <p className="text-gray-600 mb-6">Select counter at branch {user?.branchId}:</p>

                        <div className="space-y-3 mb-8 max-h-60 overflow-y-auto">
                            {counters
                                .filter(c => !user?.branchId || c.branchId === user.branchId)
                                .map(counter => (
                                    <label
                                        key={counter.id}
                                        className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedCounterId === counter.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="selectedCounter"
                                            value={counter.id}
                                            checked={selectedCounterId === counter.id}
                                            onChange={() => {
                                                handleCounterSelect(counter.id);
                                                setIsCounterSelectOpen(false);
                                            }}
                                            className="w-5 h-5 text-blue-600"
                                        />
                                        <div className="ml-3">
                                            <span className="block font-medium text-gray-900">{counter.name}</span>
                                            <span className="text-xs text-gray-500">{counter.serviceTags.join(', ')}</span>
                                        </div>
                                    </label>
                                ))}
                        </div>

                        <button
                            onClick={() => setIsCounterSelectOpen(false)}
                            className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
