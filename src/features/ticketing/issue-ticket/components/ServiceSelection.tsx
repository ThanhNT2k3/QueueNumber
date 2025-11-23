import React from 'react';
import * as Icons from 'lucide-react';
import { SERVICES } from '../../../../config/service-definitions';
import { ServiceType } from '../../../../types/types';

interface ServiceSelectionProps {
    language: 'EN' | 'VN';
    onSelectService: (serviceId: ServiceType) => void;
    onBack: () => void;
}

export const ServiceSelection: React.FC<ServiceSelectionProps> = ({ language, onSelectService, onBack }) => {
    const t = (en: string, vn: string) => language === 'EN' ? en : vn;

    const ServiceIcon = ({ name, className }: { name: string; className?: string }) => {
        const LucideIcon = (Icons as any)[name];
        return LucideIcon ? <LucideIcon className={className} /> : null;
    };

    return (
        <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full h-full animate-fade-in">

            <div className="flex items-center justify-between mb-10">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-brand-600 transition-colors px-5 py-2 rounded-xl hover:bg-gray-50 bg-white shadow-sm border border-gray-100"
                >
                    <Icons.ArrowLeft size={24} />
                    <span className="font-medium text-lg">{t('Back', 'Quay lại')}</span>
                </button>
                <h2 className="text-3xl font-bold text-gray-900">
                    {t('How can we help you today?', 'Quý khách cần hỗ trợ dịch vụ gì?')}
                </h2>
                <div className="w-24"></div> {/* Spacer */}
            </div>

            <div className="flex-1 grid grid-cols-2 gap-6 content-center pb-12 px-4">
                {SERVICES.map((service) => (
                    <button
                        key={service.id}
                        onClick={() => onSelectService(service.id)}
                        className="group relative bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:border-brand-200 transition-all duration-300 text-left flex items-start gap-6 overflow-hidden active:scale-[0.98]"
                    >
                        {/* Icon Container */}
                        <div className={`w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center ${service.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <ServiceIcon name={service.icon} className="w-10 h-10" />
                        </div>

                        <div className="relative z-10 flex flex-col justify-center h-full">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">{service.name}</h3>
                            <p className="text-gray-500 leading-relaxed">
                                {t('Tap to get ticket', 'Chạm để lấy số thứ tự')}
                            </p>
                        </div>

                        {/* Decorative Icon Background */}
                        <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-300 transform rotate-12">
                            <ServiceIcon name={service.icon} className="w-48 h-48 text-gray-900" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
