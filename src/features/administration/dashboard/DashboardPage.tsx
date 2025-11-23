import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useQMSStore, useAuthStore } from '../../../stores';
import { TicketStatus, ServiceType } from '../../../types/types';
import { SERVICES } from '../../../config/service-definitions';
import { API_BASE_URL } from '../../../config/constants';
import * as Icons from 'lucide-react';
import { Button, Dropdown, Badge, Card, StatCard, DateTimeInput } from '../../../components/ui';

export const DashboardPage: React.FC = () => {
  const { tickets, counters } = useQMSStore();
  const { user } = useAuthStore();
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
          const res = await fetch(`${API_BASE_URL}/branch/${user.branchId}/staff`);
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
      if (endDate) params.append('toDate', endDate);
      if (selectedStaffId) params.append('staffId', selectedStaffId);
      if (user?.branchId) params.append('branchId', user.branchId);

      const res = await fetch(`${API_BASE_URL}/tickets?${params.toString()}`);
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
    if (!isFiltering) {
      const branchTickets = (isManager && userBranchId)
        ? tickets.filter(t => t.branchId === userBranchId)
        : tickets;
      setFilteredTickets(branchTickets);
    }
  }, [tickets, isManager, userBranchId, isFiltering]);

  const displayTickets = filteredTickets;

  // Group by hour for the chart
  const hourlyData = Array.from({ length: 10 }, (_, i) => {
    const hour = i + 8;
    const hourLabel = hour > 12 ? `${hour - 12}PM` : `${hour}AM`;

    const ticketsInHour = displayTickets.filter(t => {
      const date = new Date(t.createdTime);
      return date.getHours() === hour;
    });

    return {
      name: hourLabel,
      served: ticketsInHour.filter(t => t.status === 3).length,
      waiting: ticketsInHour.filter(t => t.status === 0).length
    };
  });

  const data = hourlyData;

  const performanceData = counters.map(c => {
    const count = displayTickets.filter(t => t.counterId === c.id && t.status === 3).length;
    return {
      name: c.name.replace('Counter ', 'C'),
      tickets: count,
      avgTime: Math.floor(Math.random() * 10) + 2
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
              <Badge variant="info">Branch: {userBranchId}</Badge>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <Card className="p-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2">
              <span className="text-xs font-bold text-gray-500 uppercase">Date Range</span>
              <DateTimeInput
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                showIcon={false}
                className="text-sm"
              />
              <span className="text-gray-400">-</span>
              <DateTimeInput
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                showIcon={false}
                className="text-sm"
              />
            </div>

            <div className="h-8 w-px bg-gray-200"></div>

            <div className="flex items-center gap-2 px-2">
              <span className="text-xs font-bold text-gray-500 uppercase">Staff</span>
              <Dropdown
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="min-w-[150px]"
              >
                <option value="">All Staff</option>
                {staffList.map(staff => (
                  <option key={staff.id} value={staff.id}>{staff.fullName}</option>
                ))}
              </Dropdown>
            </div>

            <Button
              onClick={handleFilter}
              size="sm"
              leftIcon={<Icons.Filter size={14} />}
            >
              Filter
            </Button>
          </div>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Tickets"
          value={displayTickets.length}
          icon={<Icons.Ticket size={28} />}
          iconColor="blue"
          trend={{ value: '12% vs yesterday', isPositive: true }}
        />

        <StatCard
          title="Avg Wait Time"
          value="4m 12s"
          icon={<Icons.Clock size={28} />}
          iconColor="orange"
          trend={{ value: '30s over SLA', isPositive: false }}
        />

        <StatCard
          title="Customer Satisfaction"
          value={avgRating}
          icon={<Icons.Star size={28} />}
          iconColor="yellow"
          subtitle={`${ratedTickets.length} reviews`}
        />

        <StatCard
          title="VIP Customers"
          value={displayTickets.filter(t => t.serviceType === 4).length}
          icon={<Icons.Crown size={28} />}
          iconColor="purple"
        />
      </div>

      <div className="grid grid-cols-3 gap-8 mb-8">
        {/* Main Chart */}
        <Card className="col-span-2 h-96">
          <div className="p-6 h-full flex flex-col">
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
        </Card>
      </div>

      <Card className="h-80">
        <div className="p-6 h-full flex flex-col">
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
      </Card>
    </div>
  );
};