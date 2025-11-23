import React from 'react';
import * as Icons from 'lucide-react';

interface WelcomeScreenProps {
    onLanguageSelect: (lang: 'EN' | 'VN') => void;
    onChangeBranch: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLanguageSelect, onChangeBranch }) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">

            <button
                onClick={onChangeBranch}
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
                        onClick={() => onLanguageSelect('EN')}
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
                        onClick={() => onLanguageSelect('VN')}
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
    );
};
