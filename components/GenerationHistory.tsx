import React from 'react';
import type { HistoryItem } from '../types';

interface GenerationHistoryProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

const GenerationHistory: React.FC<GenerationHistoryProps> = ({ history, onSelect }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4 text-gray-300">Generation History</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="aspect-square bg-gray-800 rounded-md overflow-hidden group focus:outline-none focus:ring-2 focus:ring-blue-500"
            title={`Select this mockup (${item.options.color.name} ${item.options.fit} fit)`}
          >
            <img
              src={item.image}
              alt="Generated mockup from history"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default GenerationHistory;
