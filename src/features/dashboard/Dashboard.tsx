import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useQMS } from '../../stores/QMSContext';
import { analyzeQueueTrends } from '../../lib/services/geminiService';
import * as Icons from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { tickets, counters } = useQMS();
  const [aiAnalysis, setAiAnalysis] = useState<string>("Loading AI Analysis...");

  // Simulated Data Calculation
  const data = [
    { name: '9AM', served: 12, waiting: 4 },
    { name: '10AM', served: 19, waiting: 8 },
    { name: '11AM', served: 25, waiting: 15 },
    { name: '12PM', served: 15, waiting: 2 },
    { name: '1PM', served: 20, waiting: 5 },
    { name: '2PM', served: 30, waiting: 12 },
  ];

  const performanceData = counters.map(c => ({
    name: c.name.replace('Counter ', 'C'),
    tickets: Math.floor(Math.random() * 50) + 10, // Simulated
    avgTime: Math.floor(Math.random() * 10) + 2
  }));

  // Calculate CSAT from actual tickets
  const ratedTickets = tickets.filter(t => t.feedbackRating !== undefined);
  const avgRating = ratedTickets.length > 0
    ? (ratedTickets.reduce((acc, t) => acc + (t.feedbackRating || 0), 0) / ratedTickets.length).toFixed(1)
    : "N/A";

  useEffect(() => {
    // Simulate asking Gemini for an executive summary
    const timeout = setTimeout(async () => {
      const summary = await analyzeQueueTrends({ volume: data, staff: performanceData, csat: avgRating });
      setAiAnalysis(summary);
    }, 1000);
    return () => clearTimeout(timeout);
  }, []); // Run once on mount

  return (
    <div className="h-full bg-gray-50 p-8 overflow-y-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Analytics Dashboard</h1>
          <p className="text-gray-500">Branch Overview • Today</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-medium text-gray-600">System Healthy</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Total Tickets</h3>
            <Icons.Ticket className="text-blue-500 bg-blue-50 p-1 rounded" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-800">{tickets.length}</p>
          <p className="text-green-500 text-sm mt-2">↑ 12% vs yesterday</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Avg Wait Time</h3>
            <Icons.Clock className="text-orange-500 bg-orange-50 p-1 rounded" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-800">4m 12s</p>
          <p className="text-red-500 text-sm mt-2">↑ 30s over SLA</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Customer Satisfaction</h3>
            <Icons.Star className="text-yellow-500 bg-yellow-50 p-1 rounded" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-800">{avgRating}</p>
          <p className="text-sm text-gray-500 mt-2">{ratedTickets.length} reviews</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">VIP Customers</h3>
            <Icons.Crown className="text-purple-500 bg-purple-50 p-1 rounded" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-800">{tickets.filter(t => t.serviceType === 'VIP').length}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 mb-8">
        {/* Main Chart */}
        <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96">
          <h3 className="text-lg font-bold mb-6">Traffic Volume (Hourly)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Legend />
              <Line type="monotone" dataKey="served" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="waiting" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insights Panel */}
        <div className="col-span-1 bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 rounded-2xl shadow-lg flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Icons.Sparkles className="text-yellow-400" />
            <h3 className="font-bold text-lg">AI Manager Insights</h3>
          </div>
          <div className="bg-white/10 p-4 rounded-xl flex-1 overflow-y-auto">
            <p className="leading-relaxed opacity-90 text-sm font-light">
              {aiAnalysis}
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-gray-400">Powered by Gemini 2.5 Flash</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
        <h3 className="text-lg font-bold mb-6">Staff Performance (Tickets Handled)</h3>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
            <Bar dataKey="tickets" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};