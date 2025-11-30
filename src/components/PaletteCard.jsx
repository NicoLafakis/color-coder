import React from 'react';
import { Paintbrush } from 'lucide-react';

const PaletteCard = ({ title, colors, onApply }) => (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-3">{title}</h3>
        <div className="flex -space-x-2 mb-3">
            {colors.map((color, index) => (
                <div 
                    key={index} 
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm" 
                    style={{ backgroundColor: color, zIndex: colors.length - index }}
                ></div>
            ))}
        </div>
        <button 
            onClick={() => onApply(colors)} 
            className="w-full text-sm bg-indigo-600 text-white py-2 px-3 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center"
        >
            <Paintbrush className="w-4 h-4 mr-2"/>
            Apply Palette
        </button>
    </div>
);

export default PaletteCard;