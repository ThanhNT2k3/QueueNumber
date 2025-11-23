import React from 'react';
import * as Icons from 'lucide-react';
import { useQMS } from '../../../stores/QMSContext';
import { TicketStatus } from '../../../types/types';
import { SERVICES } from '../../../config/service-definitions';

export const ReportsPage: React.FC = () => {
    return (
        <div className="p-8 bg-gray-50 h-full overflow-y-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-gray-500">Export and view detailed branch performance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Icons.FileBarChart size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Daily Performance</h3>
                            <p className="text-sm text-gray-500">Wait times & volume</p>
                        </div>
                    </div>
                    <button className="w-full py-2 px-4 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        Download PDF
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <Icons.Users size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Staff Efficiency</h3>
                            <p className="text-sm text-gray-500">Service duration stats</p>
                        </div>
                    </div>
                    <button className="w-full py-2 px-4 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        Download Excel
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                            <Icons.Smile size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Customer Satisfaction</h3>
                            <p className="text-sm text-gray-500">Feedback summary</p>
                        </div>
                    </div>
                    <button className="w-full py-2 px-4 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        Download CSV
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Icons.BarChart className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Detailed Analytics Coming Soon</h3>
                <p className="text-gray-500 max-w-md">
                    We are currently integrating with the core banking data warehouse to provide real-time financial impact analysis.
                </p>
            </div>
        </div>
    );
};
