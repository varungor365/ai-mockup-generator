import React, { useState } from 'react';
import type { MockupOptions, UserPreset } from '../types';

interface PresetManagerProps {
    options: MockupOptions;
    setOptions: (options: MockupOptions) => void;
    userPresets: UserPreset[];
    onSavePreset: (name: string) => void;
    onDeletePreset: (name: string) => void;
}

const PresetManager: React.FC<PresetManagerProps> = ({ options, setOptions, userPresets, onSavePreset, onDeletePreset }) => {
    const [presetName, setPresetName] = useState('');
    const [showSaveInput, setShowSaveInput] = useState(false);
    
    const handleSave = () => {
        if (presetName && !userPresets.some(p => p.name === presetName)) {
            onSavePreset(presetName);
            setPresetName('');
            setShowSaveInput(false);
        } else {
            alert("Please enter a unique preset name.");
        }
    };
    
    const handleLoadPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedPreset = userPresets.find(p => p.name === e.target.value);
        if (selectedPreset) {
            setOptions(selectedPreset.options);
        }
    };

    return (
        <div className="space-y-3 pt-4 border-t border-gray-700/50">
            <h4 className="font-medium">User Presets</h4>
            <div className="flex gap-2">
                 <select onChange={handleLoadPreset} className="flex-grow bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Load a preset...</option>
                    {userPresets.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                </select>
                <button onClick={() => setShowSaveInput(true)} className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">
                    Save
                </button>
            </div>
            {showSaveInput && (
                <div className="flex gap-2">
                    <input 
                        type="text"
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        placeholder="Enter preset name..."
                        className="flex-grow bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={handleSave} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">✓</button>
                    <button onClick={() => setShowSaveInput(false)} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700">X</button>
                </div>
            )}
             {userPresets.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {userPresets.map(p => (
                        <div key={p.name} className="flex items-center gap-1 bg-gray-900 rounded-full text-sm pl-3 pr-1 py-1">
                            <span>{p.name}</span>
                            <button onClick={() => onDeletePreset(p.name)} className="text-gray-400 hover:text-white hover:bg-red-500 rounded-full w-5 h-5 flex items-center justify-center transition-colors">
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PresetManager;
