import React from 'react';

interface CustomerInfoPanelProps {
    phone: string;
    setPhone: (val: string) => void;
    email: string;
    setEmail: (val: string) => void;
    note: string;
    setNote: (val: string) => void;
}

export const CustomerInfoPanel: React.FC<CustomerInfoPanelProps> = ({ phone, setPhone, email, setEmail, note, setNote }) => {
    return (
        <div className="bg-gray-50 rounded-2xl p-5 mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Customer Information (Optional)</h3>
            <div className="grid grid-cols-2 gap-3">
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                />
            </div>
            <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Customer Notes..."
                className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm mt-3"
            />
        </div>
    );
};
