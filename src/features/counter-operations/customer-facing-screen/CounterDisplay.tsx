
import React, { useEffect, useState } from 'react';
import { useQMS } from '../../../stores/QMSContext';
import { useAuth } from '../../../stores/AuthContext';
import { TicketStatus } from '../../../types/types';
import { useSearchParams } from 'react-router-dom';
import * as Icons from 'lucide-react';

export const CounterDisplay: React.FC = () => {
    const { counters, tickets } = useQMS();
    const [searchParams] = useSearchParams();
    const counterIdFromUrl = searchParams.get('counter');

    const { user } = useAuth();

    // Auto-select counter from URL or localStorage or User's assigned counter or first available counter
    const [selectedCounterId, setSelectedCounterId] = useState<string | null>(() => {
        const stored = localStorage.getItem('display_counter_id');
        return counterIdFromUrl || user?.assignedCounterId || stored || null;
    });

    const [animateNumber, setAnimateNumber] = useState(false);

    const counter = counters.find(c => c.id === selectedCounterId);
    const currentTicket = tickets.find(t => t.id === counter?.currentTicketId);

    // Auto-select counter logic
    useEffect(() => {
        if (!selectedCounterId) {
            if (user?.assignedCounterId) {
                setSelectedCounterId(user.assignedCounterId);
                localStorage.setItem('display_counter_id', user.assignedCounterId);
            } else if (counters.length > 0) {
                // If no user assigned counter, pick the first one from the same branch if possible
                const branchCounters = user?.branchId
                    ? counters.filter(c => c.branchId === user.branchId)
                    : counters;

                const firstCounter = branchCounters.length > 0 ? branchCounters[0] : counters[0];

                if (firstCounter) {
                    setSelectedCounterId(firstCounter.id);
                    localStorage.setItem('display_counter_id', firstCounter.id);
                }
            }
        }
    }, [counters, selectedCounterId, user]);

    // Update from URL parameter
    useEffect(() => {
        if (counterIdFromUrl && counterIdFromUrl !== selectedCounterId) {
            setSelectedCounterId(counterIdFromUrl);
            localStorage.setItem('display_counter_id', counterIdFromUrl);
        }
    }, [counterIdFromUrl]);

    useEffect(() => {
        if (selectedCounterId) {
            localStorage.setItem('display_counter_id', selectedCounterId);
        }
    }, [selectedCounterId]);

    // Calculate Waiting Statistics specific to this counter's capabilities
    const relevantWaitingTickets = tickets
        .filter(t =>
            t.status === TicketStatus.WAITING &&
            counter?.serviceTags.includes(t.serviceType)
            && t.branchId === counter.branchId
        )
        .sort((a, b) => {
            // Sort by Priority (Highest first), then Time (Oldest first)
            if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
            return a.createdTime - b.createdTime;
        });

    const totalWaiting = relevantWaitingTickets.length;

    useEffect(() => {
        if (currentTicket) {
            setAnimateNumber(true);
            const timer = setTimeout(() => setAnimateNumber(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [currentTicket?.id]);

    // Show loading state while counters are being fetched
    if (counters.length === 0) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading display...</p>
                </div>
            </div>
        );
    }

    // Selection Screen if no counter is selected
    if (!selectedCounterId || !counter) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-gray-50 p-8">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icons.Monitor className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Counter</h2>
                    <p className="text-gray-500 mb-8">Choose which counter this screen should display.</p>

                    <div className="space-y-3">
                        {counters.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedCounterId(c.id)}
                                className="w-full p-4 text-left border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-between group"
                            >
                                <span className="font-semibold text-gray-700 group-hover:text-blue-700">{c.name}</span>
                                <Icons.ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const isOffline = counter.status !== 'ONLINE'; // Assuming 'ONLINE' is the string representation or mapped correctly

    return (
        <div className="h-full bg-gray-50 relative overflow-hidden flex flex-col font-sans select-none">
            {/* Ambient Background */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-200/30 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-200/30 rounded-full blur-[100px]"></div>

            {/* Top Bar */}
            <div className="relative z-20 px-8 py-6 flex justify-between items-center bg-white/50 backdrop-blur-sm border-b border-white/50">
                <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-xl shadow-md shadow-brand-100 border border-white">
                        <Icons.Building2 className="w-6 h-6 text-brand-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Standard Chartered</h1>
                        <p className="text-brand-600 font-medium tracking-wide uppercase text-[10px]">Customer Display</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Reset Button (Hidden/Subtle) */}
                    <button
                        onClick={() => {
                            localStorage.removeItem('display_counter_id');
                            setSelectedCounterId(null);
                        }}
                        className="text-gray-300 hover:text-gray-500 transition-colors"
                        title="Change Counter"
                    >
                        <Icons.Settings size={16} />
                    </button>

                    {/* Status Pill */}
                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm transition-all duration-500 ${isOffline ? 'bg-red-50 border-red-100' : 'bg-white border-green-100'}`}>
                        <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
                        <span className={`font-bold text-sm tracking-wide ${isOffline ? 'text-red-600' : 'text-green-600'}`}>
                            {isOffline ? 'CLOSED' : 'OPEN'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Split Layout Content */}
            <div className="flex-1 relative z-10 flex overflow-hidden">

                {/* LEFT SIDE: Main Current Ticket Display */}
                <div className="flex-[0.65] flex flex-col items-center justify-center relative p-10">

                    {/* Counter Name */}
                    <h2 className="text-2xl font-bold text-gray-400 mb-8 uppercase tracking-[0.2em] absolute top-10">{counter.name}</h2>

                    {currentTicket ? (
                        <div className={`relative group transition-all duration-700 ${animateNumber ? 'scale-110' : 'scale-100'}`}>
                            {/* Decorative Rings */}
                            <div className="absolute inset-0 border-[3px] border-brand-100 rounded-[3rem] transform rotate-3 scale-105 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            <div className="absolute inset-0 border-[3px] border-brand-50 rounded-[3rem] transform -rotate-2 scale-105 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100"></div>

                            {/* Main Card */}
                            <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl shadow-brand-200/50 p-16 rounded-[3rem] min-w-[350px] text-center flex flex-col items-center relative overflow-hidden">

                                {/* Inner Gradient Accent */}
                                <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-brand-400 to-brand-600"></div>

                                <span className="text-gray-400 font-bold uppercase tracking-widest text-lg mb-4 flex items-center gap-2">
                                    <Icons.Ticket size={20} /> Now Serving
                                </span>

                                <span className={`text-[8rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-br from-brand-700 to-brand-500 drop-shadow-sm tabular-nums tracking-tighter transition-all duration-300 ${animateNumber ? 'blur-sm' : 'blur-0'}`}>
                                    {currentTicket.number}
                                </span>

                                {/* Pulse Ring for Recall */}
                                {currentTicket.recallCount > 0 && (
                                    <div className="absolute inset-0 border-8 border-yellow-400/50 rounded-[3rem] animate-pulse"></div>
                                )}
                            </div>

                            {/* Action Message */}
                            {currentTicket.recallCount > 0 && (
                                <div className="absolute -bottom-14 left-0 right-0 mx-auto text-center animate-bounce">
                                    <span className="bg-yellow-100 text-yellow-800 px-6 py-2 rounded-full font-bold shadow-md border border-yellow-200">
                                        Please approach the counter
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center opacity-50">
                            <div className="bg-white p-8 rounded-full shadow-xl mb-6 border-4 border-gray-100">
                                {isOffline ? <Icons.Moon size={50} className="text-gray-300" /> : <Icons.Users size={50} className="text-brand-200" />}
                            </div>
                            <p className="text-xl font-medium text-gray-400">
                                {isOffline ? 'Currently Unavailable' : 'Waiting for Customer...'}
                            </p>
                        </div>
                    )}

                    {/* Footer Info (Left Side) */}
                    <div className="absolute bottom-6 flex items-center gap-2 text-gray-400 text-sm">
                        <Icons.ShieldCheck size={16} />
                        <span>Standard Chartered Secure Transaction Environment</span>
                    </div>
                </div>

                {/* RIGHT SIDE: Queue Sidebar */}
                <div className="flex-[0.35] bg-white/60 backdrop-blur-xl border-l border-white/50 shadow-xl flex flex-col h-full">

                    {/* Queue Header & Total */}
                    <div className="p-6 bg-white/40 border-b border-white/50">
                        <div className="flex items-center gap-2 text-gray-500 mb-4">
                            <Icons.ListOrdered size={20} />
                            <h3 className="font-bold text-lg uppercase tracking-wide">Queue Status</h3>
                        </div>

                        <div className="bg-gradient-to-br from-brand-50 to-white p-6 rounded-2xl border border-brand-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm text-brand-600 font-bold uppercase mb-1">Waiting</p>
                                <p className="text-xs text-gray-400">Customers</p>
                            </div>
                            <div className="text-5xl font-black text-brand-700">
                                {totalWaiting}
                            </div>
                        </div>
                    </div>

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-gray-400 uppercase">Next in Line</span>
                            <span className="text-xs font-medium text-gray-400">{relevantWaitingTickets.length} tickets</span>
                        </div>

                        <div className="flex flex-col gap-3 pb-6">
                            {relevantWaitingTickets.length > 0 ? (
                                relevantWaitingTickets.map((t, idx) => (
                                    <div
                                        key={t.id}
                                        className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:scale-[1.02] ${idx === 0
                                            ? 'bg-white border-brand-200 shadow-md shadow-brand-100/50'
                                            : 'bg-white/50 border-gray-100 text-gray-600'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'
                                                }`}>
                                                {idx + 1}
                                            </div>
                                            <span className={`font-mono font-bold text-xl ${idx === 0 ? 'text-gray-900' : 'text-gray-500'}`}>
                                                {t.number}
                                            </span>
                                        </div>

                                        <div className="flex gap-2">
                                            {t.serviceType === 'VIP' && (
                                                <span className="bg-yellow-100 text-yellow-700 p-1.5 rounded-lg" title="VIP">
                                                    <Icons.Crown size={14} />
                                                </span>
                                            )}
                                            {t.isBooking && (
                                                <span className="bg-purple-100 text-purple-700 p-1.5 rounded-lg" title="Appointment">
                                                    <Icons.Calendar size={14} />
                                                </span>
                                            )}
                                            {!t.isBooking && t.serviceType !== 'VIP' && (
                                                <span className="bg-gray-100 text-gray-400 p-1.5 rounded-lg">
                                                    <Icons.User size={14} />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 opacity-50">
                                    <Icons.Coffee size={32} className="mx-auto mb-2 text-gray-400" />
                                    <p className="text-sm text-gray-400 italic">No customers waiting</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
