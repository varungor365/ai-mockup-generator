import React, { useState } from 'react';
import { generateTshirtDesign } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';

interface AiDesignerPanelProps {
    setDesignFile: (base64: string, mimeType: string) => void;
    setLoading: (loading: boolean) => void;
    setLoadingMessage: (message: string) => void;
    setError: (error: string | null) => void;
    onDesignGenerated: () => void;
}

const AiDesignerPanel: React.FC<AiDesignerPanelProps> = ({ setDesignFile, setLoading, setLoadingMessage, setError, onDesignGenerated }) => {
    const [prompt, setPrompt] = useState('');

    const handleGenerate = async () => {
        if (!prompt) return;
        setLoading(true);
        setLoadingMessage('Generating AI design...');
        setError(null);
        try {
            const resultBase64WithHeader = await generateTshirtDesign(prompt);
            const mimeType = resultBase64WithHeader.split(';')[0].split(':')[1];
            const base64 = resultBase64WithHeader.split(',')[1];
            setDesignFile(base64, mimeType);
            onDesignGenerated();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate design.');
        } finally {
            setLoading(false);
        }
    };
    
    const examplePrompts = [
        "A majestic lion wearing sunglasses, synthwave style",
        "A cute cartoon astronaut cat floating in space",
        "Geometric wolf head logo, minimalist line art",
        "A detailed illustration of a vintage motorcycle",
        "Japanese wave art with a rising sun",
    ];
    
    const setRandomPrompt = () => {
        const randomPrompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
        setPrompt(randomPrompt);
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-400">Describe the graphic you want. The AI will create it on a transparent background.</p>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A majestic lion wearing sunglasses, synthwave style"
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
                <button onClick={handleGenerate} disabled={!prompt} className="flex-grow w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    ✨ Generate Design
                </button>
                 <button onClick={setRandomPrompt} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold p-2 rounded-lg transition-colors" title="Try an example prompt">
                    <SparklesIcon />
                </button>
            </div>
        </div>
    );
};

export default AiDesignerPanel;