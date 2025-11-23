import React from 'react';
import * as Icons from 'lucide-react';

interface RemarkPanelProps {
    remarkText: string;
    setRemarkText: (val: string) => void;
    onAddRemark: (remark?: string) => void;
}

export const RemarkPanel: React.FC<RemarkPanelProps> = ({ remarkText, setRemarkText, onAddRemark }) => {
    const quickRemarks = [
        'Customer needs more consultation',
        'Customer requests manager',
        'Customer needs help with forms',
        'Customer asks about new products',
        'Customer needs document copies',
    ];

    return (
        <div className="bg-gray-50 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Add Remarks</h3>

            {/* Quick Options */}
            <div className="flex flex-wrap gap-2 mb-3">
                {quickRemarks.map((remark, idx) => (
                    <button
                        key={idx}
                        onClick={() => onAddRemark(remark)}
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
                    onKeyPress={(e) => e.key === 'Enter' && onAddRemark()}
                    placeholder="Enter custom remark..."
                    className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-400 outline-none text-sm"
                />
                <button
                    onClick={() => onAddRemark()}
                    disabled={!remarkText.trim()}
                    className="px-5 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Icons.Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
