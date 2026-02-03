import React from 'react';

const StatusLegend = () => {
    const legends = [
        { label: "Not Visited", color: "bg-gray-200" },
        { label: "Not Answered", color: "bg-red-500" },
        { label: "Answered", color: "bg-green-500" },
        { label: "Marked for Review", color: "bg-yellow-500" },
        { label: "Answered & Marked", color: "bg-gradient-to-br from-green-500 to-yellow-500" },
    ];

    return (
        <div className="p-4 border-b bg-gray-50">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">Legend</h3>
            <div className="space-y-2">
                {legends.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${item.color} shadow-sm border border-black/5`}></div>
                        <span className="text-xs font-medium text-gray-600">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatusLegend;
