
import React, { useEffect, useState } from 'react';
import { useQMSStore } from '../../../stores';
import { TicketStatus, Ticket } from '../../../types/types';
import { SERVICES } from '../../../config/service-definitions';
import * as Icons from 'lucide-react';

export const MainDisplay: React.FC = () => {
  const { tickets, counters } = useQMSStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get last 6 called tickets
  const calledTickets = tickets
    .filter(t => t.status === TicketStatus.CALLED || t.status === TicketStatus.SERVING)
    .sort((a, b) => (b.calledTime || 0) - (a.calledTime || 0))
    .slice(0, 6);

  // Get waiting lists per service (simplified)
  const waitingTickets = tickets
    .filter(t => t.status === TicketStatus.WAITING)
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const TicketCard = ({ ticket, index }: { ticket: Ticket; index: number }) => {
    const counter = counters.find(c => c.id === ticket.counterId);
    const isMostRecent = index === 0;

    return (
      <div className={`relative overflow-hidden rounded-2xl transition-all duration-500 ${isMostRecent
        ? 'bg-brand-600 text-white shadow-xl scale-100 border-4 border-white/20'
        : 'bg-white text-gray-800 shadow-md border border-gray-100'
        } p-6 flex items-center justify-between animate-slide-in-right`}
      >
        {isMostRecent && (
          <div className="absolute -right-6 -top-6 bg-white/20 w-24 h-24 rounded-full blur-2xl"></div>
        )}

        <div className="flex flex-col z-10">
          <span className={`text-sm font-bold uppercase tracking-widest mb-1 ${isMostRecent ? 'text-brand-100' : 'text-gray-400'}`}>
            Ticket Number
          </span>
          <span className={`font-black tracking-tighter leading-none ${isMostRecent ? 'text-7xl' : 'text-5xl'}`}>
            {ticket.number}
          </span>
        </div>

        <div className="flex flex-col items-end z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-sm font-bold uppercase tracking-widest ${isMostRecent ? 'text-brand-100' : 'text-gray-400'}`}>
              Go to
            </span>
            <Icons.ArrowRight size={16} className={isMostRecent ? 'text-white' : 'text-gray-300'} />
          </div>
          <div className={`px-4 py-2 rounded-lg font-bold text-2xl ${isMostRecent ? 'bg-white text-brand-700' : 'bg-gray-100 text-gray-700'}`}>
            {counter?.name.replace('Counter ', 'Counter ')}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 h-full flex flex-col overflow-hidden font-sans select-none">

      {/* Top Header */}
      <div className="bg-white h-20 flex justify-between items-center px-8 shadow-sm z-20 relative">
        <div className="flex items-center gap-3">
          <div className="bg-brand-600 p-2 rounded-xl shadow-lg shadow-brand-600/20">
            <Icons.Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Standard Chartered</h1>
            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Main Branch</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-800 font-mono leading-none">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-xs text-gray-400 font-medium uppercase mt-1">
              {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Multimedia & Info */}
        <div className="flex-[0.6] flex flex-col p-6 gap-6 relative">
          {/* Video / Ad Placeholder */}
          <div className="flex-1 bg-black rounded-3xl overflow-hidden shadow-2xl relative group">
            {/* Simulated Video Stream */}
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
              alt="Bank Ambience"
              className="w-full h-full object-cover opacity-90 scale-105 group-hover:scale-100 transition-transform duration-[30s]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-900/90 via-transparent to-transparent flex flex-col justify-end p-10">
              <span className="px-3 py-1 bg-brand-500 text-white text-xs font-bold rounded-md w-fit mb-3">NEW OFFER</span>
              <h2 className="text-white text-4xl font-bold mb-2 leading-tight">Premium Global Banking</h2>
              <p className="text-brand-100 text-lg max-w-xl">Experience borderless transactions with 0% foreign exchange fees on our new Platinum card.</p>
            </div>
          </div>

          {/* Financial Ticker */}
          <div className="h-16 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center overflow-hidden px-4">
            <div className="flex items-center gap-3 border-r pr-4 mr-4 shrink-0 z-10 bg-white shadow-xl">
              <Icons.TrendingUp className="text-green-500" />
              <span className="font-bold text-gray-700">MARKET</span>
            </div>
            <div className="whitespace-nowrap flex animate-scroll">
              <span className="mx-4 font-mono text-gray-600 font-bold flex items-center gap-2">USD/VND <span className="text-green-500">24,500 ▲</span></span>
              <span className="mx-4 font-mono text-gray-600 font-bold flex items-center gap-2">EUR/VND <span className="text-red-500">26,100 ▼</span></span>
              <span className="mx-4 font-mono text-gray-600 font-bold flex items-center gap-2">GOLD (SJC) <span className="text-green-500">78.2M ▲</span></span>
              <span className="mx-4 font-mono text-gray-600 font-bold flex items-center gap-2">BTC/USD <span className="text-green-500">64,200 ▲</span></span>
              <span className="mx-4 font-mono text-gray-600 font-bold flex items-center gap-2">AAPL <span className="text-red-500">182.40 ▼</span></span>
              <span className="mx-4 font-mono text-gray-600 font-bold flex items-center gap-2">SAVINGS APY <span className="text-brand-600">7.5%</span></span>
              {/* Duplicate for smooth loop */}
              <span className="mx-4 font-mono text-gray-600 font-bold flex items-center gap-2">USD/VND <span className="text-green-500">24,500 ▲</span></span>
            </div>
          </div>
        </div>

        {/* RIGHT: Counter Status Overview */}
        <div className="flex-[0.4] bg-white/50 backdrop-blur-sm border-l border-gray-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Icons.Monitor className="text-brand-500" />
              Counter Status
            </h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full animate-pulse">
              Live Updates
            </span>
          </div>

          <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pb-4">
            {counters.map((counter) => {
              const currentTicket = tickets.find(t => t.id === counter.currentTicketId);
              const isOnline = counter.status === 'ONLINE';

              return (
                <div key={counter.id} className={`p-4 rounded-xl border shadow-sm transition-all ${currentTicket
                  ? 'bg-white border-brand-200 shadow-brand-100/50'
                  : 'bg-gray-50 border-gray-100'
                  }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-700 uppercase tracking-wider text-sm">{counter.name}</span>
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    {currentTicket ? (
                      <>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400 font-bold uppercase">Serving</span>
                          <span className="text-4xl font-black text-brand-600 tracking-tighter">{currentTicket.number}</span>
                        </div>
                        <Icons.ArrowRightCircle className="text-brand-200 w-8 h-8" />
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Icons.Coffee size={20} />
                        <span className="font-medium italic">{isOnline ? 'Available' : 'Closed'}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {counters.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <p>No counters active</p>
              </div>
            )}
          </div>

          {/* Waiting List Summary */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mt-2 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Next in Line</h3>
              <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-500">{waitingTickets.length} Waiting</span>
            </div>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto custom-scrollbar">
              {waitingTickets.map(t => (
                <span key={t.id} className="px-3 py-1.5 bg-gray-50 text-gray-600 font-mono font-bold text-sm rounded-md border border-gray-100">
                  {t.number}
                </span>
              ))}
              {waitingTickets.length === 0 && <span className="text-sm text-gray-400 italic">Queue is empty</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
