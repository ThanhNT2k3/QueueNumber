
import React, { useState, useEffect } from 'react';
import { useQMS } from '../../stores/QMSContext';
import { useAuth } from '../../stores/AuthContext';
import { TicketStatus, ServiceType } from '../../types/types';
import { SERVICES } from '../../config/service-definitions';
import * as Icons from 'lucide-react';

export const CounterTerminal: React.FC = () => {
  const { tickets, counters, callNextTicket, updateTicketStatus, toggleCounterStatus, recallTicket, transferTicket } = useQMS();
  const { user } = useAuth();

  // Allow selecting a counter for testing purposes
  const [selectedCounterId, setSelectedCounterId] = useState<string>('');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState<ServiceType>(ServiceType.CONSULTATION);

  useEffect(() => {
    if (user?.assignedCounterId) {
      setSelectedCounterId(user.assignedCounterId);
    } else if (counters.length > 0 && !selectedCounterId) {
      setSelectedCounterId(counters[0].id);
    }
  }, [counters, selectedCounterId, user]);

  const myCounter = counters.find(c => c.id === selectedCounterId) || counters[0];
  const myCounterId = myCounter?.id;
  const currentTicket = tickets.find(t => t.id === myCounter?.currentTicketId);

  const [showHistory, setShowHistory] = useState(false);

  // Get completed tickets for history (last 20)
  const completedTickets = tickets
    .filter(t => t.status === TicketStatus.COMPLETED)
    .sort((a, b) => (b.completedTime || 0) - (a.completedTime || 0))
    .slice(0, 20);

  // Get waiting tickets count
  const waitingCount = tickets.filter(t => t.status === TicketStatus.WAITING).length;

  const handleComplete = () => {
    if (currentTicket) updateTicketStatus(currentTicket.id, TicketStatus.COMPLETED);
  };

  const handleCallNext = () => {
    if (myCounterId) callNextTicket(myCounterId);
  };

  const handleRecall = () => {
    if (currentTicket) recallTicket(currentTicket.id);
  };

  const handleTransfer = () => {
    if (!currentTicket) return;
    transferTicket(currentTicket.id, transferTarget);
    setIsTransferModalOpen(false);
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (start?: number, end?: number) => {
    if (!start || !end) return '-';
    const minutes = Math.floor((end - start) / 60000);
    return `${minutes} phút`;
  };

  // Loading state
  if (counters.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu quầy...</p>
        </div>
      </div>
    );
  }

  if (!myCounter) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <Icons.AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa được gán quầy</h2>
        <p className="text-gray-500 max-w-md">
          Tài khoản của bạn chưa được liên kết với quầy nào. Vui lòng liên hệ quản trị viên để được cấp quyền.
        </p>
      </div>
    );
  }

  console.log(myCounter);
  const isOnline = myCounter.status === 'ONLINE'; // CounterStatus.ONLINE = 0

  return (
    <div className="h-full bg-gray-50 flex flex-col relative">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Icons.Monitor className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{myCounter.name}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isOnline ? 'Active' : 'Offline'}
              </span>
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Icons.User size={12} />
              {localStorage.getItem('qms_user') ? JSON.parse(localStorage.getItem('qms_user')!).name : 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Waiting Count */}
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg">
            <Icons.Users className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-xs text-orange-600 font-medium">Đang chờ</p>
              <p className="text-lg font-bold text-orange-700">{waitingCount}</p>
            </div>
          </div>

          {/* Status Toggle */}
          <button
            onClick={() => myCounterId && toggleCounterStatus(myCounterId)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${isOnline
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
          >
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-600' : 'bg-red-600'}`}></div>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </button>

          {/* History Button */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Lịch sử"
          >
            <Icons.History className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        {/* Current Ticket Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center">
            {currentTicket ? (
              <>
                <span className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Đang phục vụ</span>
                <h2 className="text-8xl font-black text-blue-600 mb-6">{currentTicket.number}</h2>

                <div className="flex gap-2 mb-8">
                  <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {SERVICES.find(s => s.id === currentTicket.serviceType)?.name}
                  </span>
                  {currentTicket.customerName && (
                    <span className="px-4 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                      {currentTicket.customerName}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 w-full max-w-2xl">
                  <button
                    onClick={handleRecall}
                    className="flex-1 py-4 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Icons.Volume2 className="w-5 h-5" />
                    Gọi lại
                  </button>

                  <button
                    onClick={handleComplete}
                    className="flex-[2] py-4 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Icons.CheckCircle className="w-5 h-5" />
                    Hoàn thành
                  </button>

                  <button
                    onClick={() => setIsTransferModalOpen(true)}
                    className="flex-1 py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Icons.ArrowRightLeft className="w-5 h-5" />
                    Chuyển
                  </button>
                </div>

                {/* Customer Info */}
                {currentTicket.customerName && (
                  <div className="mt-8 p-4 bg-gray-50 rounded-xl w-full max-w-md">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Thông tin khách hàng</h3>
                    <p className="text-gray-600">Tên: {currentTicket.customerName}</p>
                    <p className="text-gray-600">Giờ vào: {formatTime(currentTicket.createdTime)}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Icons.Coffee className="w-12 h-12 text-gray-300" />
                </div>
                <h2 className="text-2xl font-bold text-gray-400 mb-8">Quầy đang rảnh</h2>
                <button
                  onClick={handleCallNext}
                  disabled={!isOnline || waitingCount === 0}
                  className="px-12 py-5 bg-blue-600 text-white rounded-2xl text-xl font-bold shadow-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-all active:scale-95"
                >
                  <Icons.Megaphone className="w-6 h-6" />
                  Gọi khách tiếp theo
                </button>
                {waitingCount === 0 && (
                  <p className="text-sm text-gray-400 mt-4">Không có khách đang chờ</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* History Sidebar */}
        {showHistory && (
          <div className="w-96 bg-white rounded-2xl shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Lịch sử phục vụ</h3>
              <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-gray-100 rounded">
                <Icons.X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {completedTickets.length > 0 ? (
                completedTickets.map((ticket) => (
                  <div key={ticket.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-900">{ticket.number}</span>
                      <span className="text-xs text-gray-500">{formatTime(ticket.completedTime)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{SERVICES.find(s => s.id === ticket.serviceType)?.name}</span>
                      <span className="text-gray-500">{formatDuration(ticket.createdTime, ticket.completedTime)}</span>
                    </div>
                    {ticket.customerName && (
                      <p className="text-xs text-gray-500 mt-1">{ticket.customerName}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Icons.FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Chưa có lịch sử</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all scale-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Chuyển dịch vụ</h3>
            <p className="text-gray-600 mb-6">Chọn dịch vụ bạn muốn chuyển vé này đến:</p>

            <div className="space-y-3 mb-8">
              {SERVICES.map(service => (
                <label
                  key={service.id}
                  className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${transferTarget === service.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                    }`}
                >
                  <input
                    type="radio"
                    name="transferTarget"
                    value={service.id}
                    checked={transferTarget === service.id}
                    onChange={() => setTransferTarget(service.id)}
                    className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 font-medium text-gray-900">{service.name}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleTransfer}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg transition-colors"
              >
                Xác nhận chuyển
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
