
import React, { useState } from 'react';
import { useQMS } from '../../stores/QMSContext';
import { SERVICES } from '../../config/service-definitions';
import { ServiceType } from '../../types/types';
import * as Icons from 'lucide-react';

import { BRANCHES } from '../../config/constants';

export const Kiosk: React.FC = () => {
  const { createTicket, tickets } = useQMS();
  const [step, setStep] = useState<'BRANCH_SELECTION' | 'WELCOME' | 'SERVICE' | 'PRINTING'>('BRANCH_SELECTION');
  const [language, setLanguage] = useState<'EN' | 'VN'>('EN');
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [createdTicketNumber, setCreatedTicketNumber] = useState<string | null>(null);
  const [suggestedCounter, setSuggestedCounter] = useState<string | null>(null);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [waitTime, setWaitTime] = useState<number | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  const handleBranchSelect = (branchId: string) => {
    setSelectedBranch(branchId);
    setStep('WELCOME');
  };

  const handleStart = (lang: 'EN' | 'VN') => {
    setLanguage(lang);
    setStep('SERVICE');
  };

  const handlePrint = async (serviceId: ServiceType) => {
    setSelectedService(serviceId);
    setStep('PRINTING');

    // Create ticket and get the response directly
    const createdTicket = await createTicket(serviceId, undefined, selectedBranch || undefined);

    if (createdTicket) {
      setCreatedTicketNumber(createdTicket.number);
      setSuggestedCounter((createdTicket as any).suggestedCounter);
      setQueuePosition((createdTicket as any).queuePosition);
      setWaitTime((createdTicket as any).estimatedWaitTime);
    }

    setTimeout(() => {
      setStep('WELCOME');
      setSelectedService(null);
      setCreatedTicketNumber(null);
      setSuggestedCounter(null);
      setQueuePosition(null);
      setWaitTime(null);
    }, 5000); // Increased to 5s to show more info
  };

  const ServiceIcon = ({ name, className }: { name: string; className?: string }) => {
    const LucideIcon = (Icons as any)[name];
    return LucideIcon ? <LucideIcon className={className} /> : null;
  };

  // Simple translation helper for the demo
  const t = (en: string, vn: string) => language === 'EN' ? en : vn;

  return (
    <div className="h-full bg-white relative overflow-hidden font-sans select-none flex flex-col">

      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[60vh] h-[60vh] bg-blue-50 rounded-full blur-[80px] opacity-60"></div>
        <div className="absolute bottom-[10%] -left-[5%] w-[40vh] h-[40vh] bg-brand-50 rounded-full blur-[60px] opacity-60"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-brand-600 text-white p-3 rounded-xl shadow-lg shadow-brand-200">
            <Icons.Building2 size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Standard Chartered</h1>
            <p className="text-xs text-brand-600 font-semibold tracking-wide uppercase">
              {selectedBranch ? BRANCHES.find(b => b.id === selectedBranch)?.name : 'Smart Branch'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-medium text-gray-800">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col p-8">

        {/* BRANCH SELECTION SCREEN */}
        {step === 'BRANCH_SELECTION' && (
          <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Select Branch</h2>
            <p className="text-gray-500 mb-12">Please select your current location</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              {BRANCHES.map(branch => (
                <button
                  key={branch.id}
                  onClick={() => handleBranchSelect(branch.id)}
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
        )}

        {/* WELCOME SCREEN (Language Selection) */}
        {step === 'WELCOME' && (
          <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">

            <button
              onClick={() => setStep('BRANCH_SELECTION')}
              className="absolute top-0 left-0 flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm"
            >
              <Icons.ArrowLeft size={16} /> Change Branch
            </button>

            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-4xl w-full">
              <h2 className="text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                Welcome to Standard Chartered
              </h2>
              <p className="text-2xl text-gray-500 font-light mb-16">
                Please select your language to begin
              </p>

              <div className="grid grid-cols-2 gap-8 w-full max-w-3xl px-4">
                {/* English Button */}
                <button
                  onClick={() => handleStart('EN')}
                  className="group relative bg-white p-10 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-gray-50 hover:border-brand-200 hover:shadow-[0_20px_50px_rgba(14,165,233,0.15)] transition-all duration-300 active:scale-95 flex flex-col items-center justify-center gap-6"
                >
                  <div className="w-24 h-24 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                    EN
                  </div>
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">English</h3>
                    <p className="text-gray-400 mt-2">International Customers</p>
                  </div>
                </button>

                {/* Vietnamese Button */}
                <button
                  onClick={() => handleStart('VN')}
                  className="group relative bg-white p-10 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-gray-50 hover:border-red-200 hover:shadow-[0_20px_50px_rgba(239,68,68,0.15)] transition-all duration-300 active:scale-95 flex flex-col items-center justify-center gap-6"
                >
                  <div className="w-24 h-24 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-2xl font-bold group-hover:bg-red-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                    VN
                  </div>
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-gray-800 group-hover:text-red-600 transition-colors">Tiếng Việt</h3>
                    <p className="text-gray-400 mt-2">Khách hàng Việt Nam</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Decorative Footer */}
            <div className="py-6 text-gray-300 text-sm font-medium tracking-widest uppercase">
              Standard Chartered Smart Queue System v2.0
            </div>
          </div>
        )}

        {/* SERVICE SELECTION */}
        {step === 'SERVICE' && (
          <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full h-full animate-fade-in">

            <div className="flex items-center justify-between mb-10">
              <button
                onClick={() => setStep('WELCOME')}
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
              {SERVICES.map((service, index) => (
                <button
                  key={service.id}
                  onClick={() => handlePrint(service.id)}
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
        )}

        {/* PRINTING SCREEN */}
        {step === 'PRINTING' && (
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
        )}

      </main>
    </div>
  );
};
