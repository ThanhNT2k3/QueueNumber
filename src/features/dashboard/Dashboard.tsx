import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useQMS } from '../../stores/QMSContext';
import { useAuth } from '../../stores/AuthContext';
import * as Icons from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { tickets, counters } = useQMS();
  const { user } = useAuth();
  const [aiAnalysis, setAiAnalysis] = useState<string>("Loading AI Analysis...");

  // Filter tickets based on User Role (Manager sees only their branch)
  const isManager = user?.role === 'MANAGER';
  const userBranchId = user?.branchId;

  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [staffList, setStaffList] = useState<any[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<any[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);

  // Fetch staff for filter
  useEffect(() => {
    const fetchStaff = async () => {
      if (user?.branchId) {
        try {
          const res = await fetch(`http://localhost:5257/api/branch/${user.branchId}/staff`);
          if (res.ok) {
            const data = await res.json();
            setStaffList(data);
          }
        } catch (e) {
          console.error("Failed to fetch staff", e);
        }
      }
    };
    fetchStaff();
  }, [user?.branchId]);

  // Fetch filtered tickets
  const handleFilter = async () => {
    setIsFiltering(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('fromDate', startDate);
      if (endDate) params.append('toDate', endDate); // Backend might need time adjustment or handle inclusive
      if (selectedStaffId) params.append('staffId', selectedStaffId);
      if (user?.branchId) params.append('branchId', user.branchId);

      const res = await fetch(`http://localhost:5257/api/tickets?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setFilteredTickets(data);
      }
    } catch (e) {
      console.error("Failed to filter tickets", e);
    }
  };

  // Initial load or reset
  useEffect(() => {
    // If no filter active, use context tickets (live)
    if (!isFiltering) {
      // Filter by branch if manager
      const branchTickets = (isManager && userBranchId)
        ? tickets.filter(t => t.branchId === userBranchId)
        : tickets;
      setFilteredTickets(branchTickets);
    }
  }, [tickets, isManager, userBranchId, isFiltering]);

  const displayTickets = filteredTickets;

  // Simulated Data Calculation (Update to use displayTickets)
  // Group by hour for the chart
  const hourlyData = Array.from({ length: 10 }, (_, i) => {
    const hour = i + 8; // 8 AM to 5 PM
    const hourLabel = hour > 12 ? `${hour - 12}PM` : `${hour}AM`;

    const ticketsInHour = displayTickets.filter(t => {
      const date = new Date(t.createdTime);
      return date.getHours() === hour;
    });

    return {
      name: hourLabel,
      served: ticketsInHour.filter(t => t.status === 3).length, // Completed
      waiting: ticketsInHour.filter(t => t.status === 0).length // Waiting
    };
  });

  const data = hourlyData;

  const performanceData = counters.map(c => {
    // Count tickets served by this counter in the filtered set
    // Note: Ticket entity has CounterId.
    const count = displayTickets.filter(t => t.counterId === c.id && t.status === 3).length;
    return {
      name: c.name.replace('Counter ', 'C'),
      tickets: count,
      avgTime: Math.floor(Math.random() * 10) + 2 // Mock avg time for now as we don't calculate it yet
    };
  });

  // Calculate CSAT from actual tickets
  const ratedTickets = displayTickets.filter(t => t.feedbackRating !== undefined);
  const avgRating = ratedTickets.length > 0
    ? (ratedTickets.reduce((acc, t) => acc + (t.feedbackRating || 0), 0) / ratedTickets.length).toFixed(1)
    : "N/A";

  return (
    <div className="h-full bg-gray-50 p-8 overflow-y-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Analytics Dashboard</h1>
          <div className="flex items-center gap-2 text-gray-500">
            <span>Overview • Today</span>
            {isManager && userBranchId && (
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold border border-blue-200">
                Branch: {userBranchId}
              </span>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Date Range</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="h-8 w-px bg-gray-200"></div>

          <div className="flex items-center gap-2 px-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Staff</span>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="border rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
            >
              <option value="">All Staff</option>
              {staffList.map(staff => (
                <option key={staff.id} value={staff.id}>{staff.fullName}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleFilter}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Icons.Filter size={14} />
            Filter
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Total Tickets</h3>
            <Icons.Ticket className="text-blue-500 bg-blue-50 p-1 rounded" size={28} />
          </div>
          <p className="text-3xl font-bold text-gray-800">{displayTickets.length}</p>
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
          <p className="text-3xl font-bold text-gray-800">{displayTickets.filter(t => t.serviceType === 4).length}</p>
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