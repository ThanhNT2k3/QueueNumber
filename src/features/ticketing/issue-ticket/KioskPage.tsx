import React, { useState } from 'react';
import { useQMS } from '../../../stores/QMSContext';
import { ServiceType } from '../../../types/types';
import * as Icons from 'lucide-react';
import { useBranches } from '../../../stores/BranchContext';

import { BranchSelection } from './components/BranchSelection';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ServiceSelection } from './components/ServiceSelection';
import { PrintingScreen } from './components/PrintingScreen';

export const KioskPage: React.FC = () => {
    const { createTicket } = useQMS();
    const { branches } = useBranches();
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
                            {selectedBranch ? branches.find(b => b.id === selectedBranch)?.name : 'Smart Branch'}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xl font-medium text-gray-800">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex flex-col p-8">

                {step === 'BRANCH_SELECTION' && (
                    <BranchSelection onSelect={handleBranchSelect} />
                )}

                {step === 'WELCOME' && (
                    <WelcomeScreen
                        onLanguageSelect={handleStart}
                        onChangeBranch={() => setStep('BRANCH_SELECTION')}
                    />
                )}

                {step === 'SERVICE' && (
                    <ServiceSelection
                        language={language}
                        onSelectService={handlePrint}
                        onBack={() => setStep('WELCOME')}
                    />
                )}

                {step === 'PRINTING' && (
                    <PrintingScreen
                        language={language}
                        createdTicketNumber={createdTicketNumber}
                        selectedService={selectedService}
                        suggestedCounter={suggestedCounter}
                        queuePosition={queuePosition}
                        waitTime={waitTime}
                    />
                )}

            </main>
        </div>
    );
};
