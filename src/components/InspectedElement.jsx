import React from 'react';

const InspectedElement = ({ name, color, bgColor }) => (
     <div className="p-3 bg-gray-50 rounded-md border border-gray-200 flex items-center justify-between">
        <span className="text-sm font-mono text-gray-600 truncate" title={name}>{name}</span>
        <div className="flex items-center space-x-2 flex-shrink-0">
            <div 
                className="w-5 h-5 rounded border border-gray-300" 
                style={{ backgroundColor: color }} 
                title={`Text: ${color}`}
            ></div>
            <div 
                className="w-5 h-5 rounded border border-gray-300" 
                style={{ backgroundColor: bgColor }} 
                title={`Background: ${bgColor}`}
            ></div>
        </div>
    </div>
);

export default InspectedElement;