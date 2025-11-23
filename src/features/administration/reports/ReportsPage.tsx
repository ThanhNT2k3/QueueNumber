import React from 'react';
import * as Icons from 'lucide-react';
import { useQMSStore } from '../../../stores';
import { TicketStatus } from '../../../types/types';
import { SERVICES } from '../../../config/service-definitions';
import { Button, Card } from '../../../components/ui';

interface ReportCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    iconColor: string;
    buttonText: string;
    onDownload: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, description, icon, iconColor, buttonText, onDownload }) => (
    <Card>
        <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 ${iconColor} rounded-lg`}>
                    {icon}
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
            </div>
            <Button variant="outline" fullWidth onClick={onDownload}>
                {buttonText}
            </Button>
        </div>
    </Card>
);

export const ReportsPage: React.FC = () => {
    const handleDownload = (reportType: string) => {
        console.log(`Downloading ${reportType} report...`);
        // TODO: Implement actual download logic
    };

    return (
        <div className="p-8 bg-gray-50 h-full overflow-y-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-gray-500">Export and view detailed branch performance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <ReportCard
                    title="Daily Performance"
                    description="Wait times & volume"
                    icon={<Icons.FileBarChart size={24} />}
                    iconColor="bg-blue-50 text-blue-600"
                    buttonText="Download PDF"
                    onDownload={() => handleDownload('daily-performance')}
                />

                <ReportCard
                    title="Staff Efficiency"
                    description="Service duration stats"
                    icon={<Icons.Users size={24} />}
                    iconColor="bg-green-50 text-green-600"
                    buttonText="Download Excel"
                    onDownload={() => handleDownload('staff-efficiency')}
                />

                <ReportCard
                    title="Customer Satisfaction"
                    description="Feedback summary"
                    icon={<Icons.Smile size={24} />}
                    iconColor="bg-purple-50 text-purple-600"
                    buttonText="Download CSV"
                    onDownload={() => handleDownload('customer-satisfaction')}
                />
            </div>

            <Card className="p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Icons.BarChart className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Detailed Analytics Coming Soon</h3>
                <p className="text-gray-500 max-w-md">
                    We are currently integrating with the core banking data warehouse to provide real-time financial impact analysis.
                </p>
            </Card>
        </div>
    );
};
