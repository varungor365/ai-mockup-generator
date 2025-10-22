import React from 'react';

interface TryOnDisplayProps {
    originalImage: string;
    resultImage: string;
}

const TryOnDisplay: React.FC<TryOnDisplayProps> = ({ originalImage, resultImage }) => {
    return (
        <div className="w-full h-full grid grid-cols-2 gap-2">
            <div className="relative">
                <img src={originalImage} alt="Original user photo" className="w-full h-full object-contain rounded-md"/>
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded">BEFORE</div>
            </div>
            <div className="relative">
                <img src={resultImage} alt="Virtual try-on result" className="w-full h-full object-contain rounded-md"/>
                <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">AFTER</div>
            </div>
        </div>
    );
};

export default TryOnDisplay;