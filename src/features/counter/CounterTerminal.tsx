
import React, { useState, useEffect } from 'react';
import { useQMS } from '../../stores/QMSContext';
import { useAuth } from '../../stores/AuthContext';
import { TicketStatus, ServiceType } from '../../types/types';
import { SERVICES } from '../../config/service-definitions';
import * as Icons from 'lucide-react';

const CounterTerminal: React.FC = () => {
  const { tickets, counters, callNextTicket, updateTicketStatus, toggleCounterStatus, recallTicket, transferTicket, moveToEnd, updateRemarks, updateCustomerInfo } = useQMS();
  const { user, updateAssignedCounter } = useAuth();

  const [selectedCounterId, setSelectedCounterId] = useState<string>('');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isCounterSelectOpen, setIsCounterSelectOpen] = useState(false);
  const [isMoveToEndModalOpen, setIsMoveToEndModalOpen] = useState(false);
  const [selectedHistoryTicket, setSelectedHistoryTicket] = useState<any>(null);
  const [transferTarget, setTransferTarget] = useState<ServiceType>(ServiceType.CONSULTATION);
  const [moveToEndReason, setMoveToEndReason] = useState('Customer not present');
  const [remarkText, setRemarkText] = useState('');

  // Customer info fields
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerNote, setCustomerNote] = useState('');

  // Quick remark options
  const quickRemarks = [
    'Customer needs more consultation',
    'Customer requests manager',
    'Customer needs help with forms',
    'Customer asks about new products',
    'Customer needs document copies',
  ];

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

  // Get completed tickets for history (last 20)
  const completedTickets = tickets
    .filter(t => t.status === TicketStatus.COMPLETED)
    .sort((a, b) => (b.completedTime || 0) - (a.completedTime || 0))
    .slice(0, 20);

  // Get my queue
  const myQueueTickets = tickets.filter(t => {
    if (t.status !== TicketStatus.WAITING) return false;
    if (!myCounter) return false;
    if (t.branchId && myCounter.branchId && t.branchId !== myCounter.branchId) return false;
    return myCounter.serviceTags.includes(t.serviceType) || myCounter.serviceTags.includes(ServiceType.VIP);
  }).sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    return a.createdTime - b.createdTime;
  });

  const handleComplete = async () => {
    if (currentTicket) {
      // Save customer info if provided
      if (customerPhone || customerEmail || customerNote) {
        await updateCustomerInfo(currentTicket.id, customerPhone, customerEmail, customerNote);
      }
      updateTicketStatus(currentTicket.id, TicketStatus.COMPLETED);
      // Clear form
      setCustomerPhone('');
      setCustomerEmail('');
      setCustomerNote('');
    }
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

  const handleMoveToEnd = async () => {
    if (!currentTicket) return;
    await moveToEnd(currentTicket.id, moveToEndReason);
    setIsMoveToEndModalOpen(false);
    setMoveToEndReason('Customer not present');
  };

  const handleAddRemark = async (remark?: string) => {
    if (!currentTicket) return;
    const text = remark || remarkText.trim();
    if (!text) return;
    await updateRemarks(currentTicket.id, text);
    setRemarkText('');
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (start?: number, end?: number) => {
    if (!start || !end) return '-';
    const minutes = Math.floor((end - start) / 60000);
    return `${minutes}m`;
  };

  if (counters.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading counter data...</p>
        </div>
      </div>
    );
  }

  if (!myCounter) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <Icons.AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Not assigned to counter</h2>
        <p className="text-gray-500 max-w-md">
          Your account is not linked to any counter. Please contact administrator.
        </p>
      </div>
    );
  }

  const isOnline = myCounter.status === 'ONLINE';

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Icons.Monitor className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900">{myCounter.name}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isOnline ? 'ACTIVE' : 'OFFLINE'}
              </span>
              <button
                onClick={() => setIsCounterSelectOpen(true)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Change counter"
              >
                <Icons.RefreshCw size={12} />
              </button>
            </div>
            <p className="text-xs text-gray-500">{user?.fullName || 'N/A'} • {user?.branchId || 'N/A'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-lg">
            <Icons.Users className="w-4 h-4 text-orange-600" />
            <div>
              <p className="text-[10px] text-orange-600 font-medium">Waiting</p>
              <p className="text-lg font-bold text-orange-700 leading-none">{myQueueTickets.length}</p>
            </div>
          </div>

          <button
            onClick={() => myCounterId && toggleCounterStatus(myCounterId)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${isOnline ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
          >
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-600' : 'bg-red-600'}`}></div>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </button>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Current Ticket + Actions */}
        <div className="flex-1 flex flex-col p-6 overflow-auto">
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-8 flex flex-col">
            {currentTicket ? (
              <>
                {/* Ticket Display */}
                <div className="text-center mb-8">
                  <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">SERVING</span>
                  <h2 className="text-8xl font-black text-blue-600 my-4">{currentTicket.number}</h2>
                  <div className="flex gap-2 justify-center">
                    <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {SERVICES.find(s => s.id === currentTicket.serviceType)?.name}
                    </span>
                    {currentTicket.customerName && (
                      <span className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                        {currentTicket.customerName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Large Action Buttons - Simplified */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <button
                    onClick={handleRecall}
                    className="py-5 bg-indigo-500 text-white rounded-2xl font-bold text-base hover:bg-indigo-600 shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Icons.Volume2 className="w-5 h-5" />
                    Recall
                  </button>

                  <button
                    onClick={handleComplete}
                    className="py-5 bg-green-500 text-white rounded-2xl font-bold text-base hover:bg-green-600 shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Icons.CheckCircle className="w-5 h-5" />
                    Complete
                  </button>

                  <button
                    onClick={() => setIsTransferModalOpen(true)}
                    className="py-5 bg-orange-500 text-white rounded-2xl font-bold text-base hover:bg-orange-600 shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Icons.ArrowRightLeft className="w-5 h-5" />
                    Transfer
                  </button>
                </div>

                <button
                  onClick={() => setIsMoveToEndModalOpen(true)}
                  className="w-full py-5 bg-yellow-500 text-white rounded-2xl font-bold text-base hover:bg-yellow-600 shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 mb-6"
                >
                  <Icons.ArrowDownToLine className="w-5 h-5" />
                  Customer Absent
                </button>

                {/* Customer Info Section */}
                <div className="bg-gray-50 rounded-2xl p-5 mb-4">
                  <h3 className="text-sm font-bold text-gray-700 mb-3">Customer Information (Optional)</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Phone Number"
                      className="px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                    />
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Email"
                      className="px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                    />
                  </div>
                  <input
                    type="text"
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder="Customer Notes..."
                    className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm mt-3"
                  />
                </div>

                {/* Remark Input - Larger */}
                <div className="bg-gray-50 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-gray-700 mb-3">Add Remarks</h3>

                  {/* Quick Options */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {quickRemarks.map((remark, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAddRemark(remark)}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        {remark}
                      </button>
                    ))}
                  </div>

                  {/* Custom Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={remarkText}
                      onChange={(e) => setRemarkText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddRemark()}
                      placeholder="Enter custom remark..."
                      className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-400 outline-none text-sm"
                    />
                    <button
                      onClick={() => handleAddRemark()}
                      disabled={!remarkText.trim()}
                      className="px-5 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Icons.Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Icons.Coffee className="w-12 h-12 text-gray-300" />
                </div>
                <h2 className="text-2xl font-bold text-gray-400 mb-8">Counter Available</h2>
                <button
                  onClick={handleCallNext}
                  disabled={!isOnline || myQueueTickets.length === 0}
                  className="px-12 py-6 bg-blue-600 text-white rounded-2xl text-xl font-bold shadow-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-all active:scale-95"
                >
                  <Icons.Megaphone className="w-6 h-6" />
                  Call Next Customer
                </button>
                {myQueueTickets.length === 0 && (
                  <p className="text-sm text-gray-400 mt-4">No customers waiting</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: History Sidebar */}
        <div className="w-80 bg-white border-l flex flex-col shadow-lg">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Service History</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {completedTickets.length > 0 ? (
              completedTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedHistoryTicket(ticket)}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border border-gray-100 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-900">{ticket.number}</span>
                    <span className="text-xs text-gray-500">{formatTime(ticket.completedTime)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{SERVICES.find(s => s.id === ticket.serviceType)?.name}</span>
                    <span className="text-gray-500">{formatDuration(ticket.createdTime, ticket.completedTime)}</span>
                  </div>
                  {ticket.customerName && (
                    <p className="text-xs text-gray-500 mt-1">{ticket.customerName}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400">
                <Icons.FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No history yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History Detail Modal */}
      {selectedHistoryTicket && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setSelectedHistoryTicket(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Ticket Details {selectedHistoryTicket.number}</h3>
              <button onClick={() => setSelectedHistoryTicket(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Service</p>
                  <p className="font-semibold">{SERVICES.find(s => s.id === selectedHistoryTicket.serviceType)?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">
                    {selectedHistoryTicket.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Created Time</p>
                  <p className="font-semibold">{formatTime(selectedHistoryTicket.createdTime)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Completed Time</p>
                  <p className="font-semibold">{formatTime(selectedHistoryTicket.completedTime)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Service Duration</p>
                <p className="font-semibold">{formatDuration(selectedHistoryTicket.createdTime, selectedHistoryTicket.completedTime)}</p>
              </div>

              {selectedHistoryTicket.customerName && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Customer Name</p>
                  <p className="font-semibold">{selectedHistoryTicket.customerName}</p>
                </div>
              )}

              {(selectedHistoryTicket.customerPhone || selectedHistoryTicket.customerEmail || selectedHistoryTicket.customerNote) && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-xs font-bold text-blue-700 mb-2">Contact Information</p>
                  {selectedHistoryTicket.customerPhone && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500">Phone Number</p>
                      <p className="font-semibold text-sm">{selectedHistoryTicket.customerPhone}</p>
                    </div>
                  )}
                  {selectedHistoryTicket.customerEmail && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-semibold text-sm">{selectedHistoryTicket.customerEmail}</p>
                    </div>
                  )}
                  {selectedHistoryTicket.customerNote && (
                    <div>
                      <p className="text-xs text-gray-500">Customer Note</p>
                      <p className="font-semibold text-sm">{selectedHistoryTicket.customerNote}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedHistoryTicket.remarks && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Processing Remarks</p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedHistoryTicket.remarks}</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedHistoryTicket(null)}
              className="w-full mt-6 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Transfer dịch vụ</h3>
            <p className="text-gray-600 mb-6">Select the service to transfer this ticket to:</p>

            <div className="space-y-3 mb-8">
              {SERVICES.map(service => (
                <label
                  key={service.id}
                  className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${transferTarget === service.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                >
                  <input
                    type="radio"
                    name="transferTarget"
                    value={service.id}
                    checked={transferTarget === service.id}
                    onChange={() => setTransferTarget(service.id)}
                    className="w-5 h-5 text-blue-600"
                  />
                  <span className="ml-3 font-medium text-gray-900">{service.name}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move to End Modal */}
      {isMoveToEndModalOpen && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Move Customer to End</h3>
            <p className="text-gray-600 mb-6">Please enter reason for customer absence:</p>

            <textarea
              value={moveToEndReason}
              onChange={(e) => setMoveToEndReason(e.target.value)}
              placeholder="e.g., Customer went to restroom, Customer went to ATM..."
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none resize-none h-24 mb-6"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setIsMoveToEndModalOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleMoveToEnd}
                className="flex-1 px-4 py-3 bg-yellow-600 text-white rounded-xl font-bold hover:bg-yellow-700 shadow-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Counter Selection Modal */}
      {isCounterSelectOpen && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Select Working Counter</h3>
            <p className="text-gray-600 mb-6">Select counter at branch {user?.branchId}:</p>

            <div className="space-y-3 mb-8 max-h-60 overflow-y-auto">
              {counters
                .filter(c => !user?.branchId || c.branchId === user.branchId)
                .map(counter => (
                  <label
                    key={counter.id}
                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedCounterId === counter.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name="selectedCounter"
                      value={counter.id}
                      checked={selectedCounterId === counter.id}
                      onChange={() => {
                        setSelectedCounterId(counter.id);
                        updateAssignedCounter(counter.id);
                        setIsCounterSelectOpen(false);
                      }}
                      className="w-5 h-5 text-blue-600"
                    />
                    <div className="ml-3">
                      <span className="block font-medium text-gray-900">{counter.name}</span>
                      <span className="text-xs text-gray-500">{counter.serviceTags.join(', ')}</span>
                    </div>
                  </label>
                ))}
            </div>

            <button
              onClick={() => setIsCounterSelectOpen(false)}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


export default CounterTerminal;
