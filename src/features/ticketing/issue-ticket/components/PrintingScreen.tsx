import React from 'react';
import * as Icons from 'lucide-react';
import { SERVICES } from '../../../../config/service-definitions';
import { ServiceType } from '../../../../types/types';

interface PrintingScreenProps {
    language: 'EN' | 'VN';
    createdTicketNumber: string | null;
    selectedService: ServiceType | null;
    suggestedCounter: string | null;
    queuePosition: number | null;
    waitTime: number | null;
}

export const PrintingScreen: React.FC<PrintingScreenProps> = ({
    language,
    createdTicketNumber,
    selectedService,
    suggestedCounter,
    queuePosition,
    waitTime
}) => {
    const t = (en: string, vn: string) => language === 'EN' ? en : vn;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-md animate-fade-in">
            <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-gray-100 text-center max-w-lg w-full relative overflow-hidden">

                {/* Success Icon Animation */}
                <div className="mb-8 relative flex justify-center">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center relative z-10">
                        <Icons.Check className="w-12 h-12 text-green-500 animate-bounce" />
                    </div>
                    <div className="absolute top-0 w-24 h-24 bg-green-500 rounded-full animate-ping opacity-20"></div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('Printing Ticket', 'Đang in phiếu')}</h2>
                <p className="text-gray-500 mb-8">{t('Please wait a moment...', 'Vui lòng đợi trong giây lát...')}</p>

                {/* Ticket Visual */}
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 relative mx-auto w-64 shadow-inner animate-slide-in-right">
                    <div className="w-4 h-4 bg-gray-300 rounded-full absolute -left-2 top-1/2 transform -translate-y-1/2"></div>
                    <div className="w-4 h-4 bg-gray-300 rounded-full absolute -right-2 top-1/2 transform -translate-y-1/2"></div>

                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">{t('Your Number', 'Số của bạn')}</p>
                    <p className="text-4xl font-black text-gray-800 mb-2">
                        {createdTicketNumber || `${SERVICES.find(s => s.id === selectedService)?.prefix}---`}
                    </p>

                    {/* Counter Suggestion */}
                    {suggestedCounter && (
                        <div className="mt-4 pt-4 border-t border-gray-300">
                            <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                                <Icons.MapPin size={16} />
                                <p className="text-sm font-bold">{t('Go to', 'Đến quầy')}: {suggestedCounter}</p>
                            </div>
                            {queuePosition && (
                                <p className="text-xs text-gray-500">
                                    {t(`Position: ${queuePosition}`, `Vị trí: ${queuePosition}`)}
                                    {waitTime && ` • ${t(`~${waitTime} min`, `~${waitTime} phút`)}`}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden mt-4">
                        <div className="h-full bg-brand-500 w-1/2 animate-[shimmer_2s_infinite]"></div>
                    </div>
                </div>

                <div className="mt-8 text-sm text-gray-400 flex items-center justify-center gap-2">
                    <Icons.Printer size={16} /> {t('Printing...', 'Đang in...')}
                </div>
            </div>
        </div>
    );
};
