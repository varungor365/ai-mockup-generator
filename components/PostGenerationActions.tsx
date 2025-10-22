import React from 'react';
import VideoIcon from './icons/VideoIcon';
import SparklesIcon from './icons/SparklesIcon';

interface PostGenerationActionsProps {
    onGenerateEcommerceKit: () => void;
    onGenerateVideo: () => void;
}

const PostGenerationActions: React.FC<PostGenerationActionsProps> = ({ onGenerateEcommerceKit, onGenerateVideo }) => {
    return (
        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-lg text-center">Next Steps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 <button 
                    onClick={onGenerateEcommerceKit}
                    className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                    <SparklesIcon /> Generate E-commerce Kit
                </button>
                <button 
                    onClick={onGenerateVideo}
                    className="w-full bg-pink-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center gap-2">
                    <VideoIcon /> Generate Video Mockup
                </button>
            </div>
            <p className="text-xs text-center text-gray-400">Generate marketing assets or an animated video from your mockup.</p>
        </div>
    );
};

export default PostGenerationActions;
