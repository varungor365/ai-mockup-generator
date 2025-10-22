import React, { useState } from 'react';
import type { EcommerceKitResult, DesignFile, AppMode } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';
import RefreshIcon from './icons/RefreshIcon';
import ZoomInIcon from './icons/ZoomInIcon';
import ZoomOutIcon from './icons/ZoomOutIcon';
import ResetZoomIcon from './icons/ResetZoomIcon';
import DownloadIcon from './icons/DownloadIcon';
import UpscaleIcon from './icons/UpscaleIcon';
import PostGenerationActions from './PostGenerationActions';
import EcommerceKitDisplay from './EcommerceKitDisplay';
import TryOnDisplay from './TryOnDisplay';

interface DisplayAreaProps {
  appMode: AppMode;
  // AI Models props
  generatedMockup: string | null;
  batchMockups: string[];
  view360: string[];
  videoMockup: string | null;
  ecommerceKit: EcommerceKitResult | null;
  onRegenerate: () => void;
  onEdit: () => void;
  editPrompt: string;
  setEditPrompt: (prompt: string) => void;
  onGenerateEcommerceKit: () => void;
  onGenerateVideo: () => void;

  // Virtual Try-on props
  userPhoto: DesignFile | null;
  tryOnResult: string | null;

  // Common props
  isLoading: boolean;
  loadingMessage: string;
  isEditing: boolean;
  error: string | null;
  onUpscale: () => void;
  clearResults: () => void;
}

const DisplayArea: React.FC<DisplayAreaProps> = (props) => {
  const { 
      appMode, generatedMockup, batchMockups, view360, videoMockup, ecommerceKit, 
      isLoading, loadingMessage, isEditing, error, onRegenerate, onEdit, onUpscale, 
      editPrompt, setEditPrompt, onGenerateEcommerceKit, onGenerateVideo, clearResults,
      userPhoto, tryOnResult
  } = props;
  
  const [zoom, setZoom] = useState(1);
  const [active360Index, setActive360Index] = useState(0);

  const downloadImage = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `mockup-${Date.now()}-${index}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const downloadAll = (images: string[]) => {
      images.forEach((img, i) => {
          setTimeout(() => downloadImage(img, i), i * 300); // Stagger downloads
      });
  };

  const hasAiModelsResults = generatedMockup || batchMockups.length > 0 || view360.length > 0 || videoMockup;
  const hasTryOnResults = tryOnResult;
  const hasResults = hasAiModelsResults || hasTryOnResults;
  
  const ResultContent: React.FC = () => {
    if (appMode === 'virtual_try_on') {
        if (tryOnResult && userPhoto) {
            return <TryOnDisplay originalImage={userPhoto.previewUrl} resultImage={tryOnResult} />;
        }
        return (
            <div className="text-center text-gray-500">
                <h3 className="font-bold text-2xl">See it on You</h3>
                <p className="mt-2">Upload your photo, a design, and see the magic.</p>
            </div>
        );
    }
    
    // This now covers 'ai_models' and 'realtime_configurator' after generation
    if (videoMockup) {
      return (
          <div className="w-full h-full flex items-center justify-center">
            <video src={videoMockup} controls autoPlay loop className="max-w-full max-h-full rounded-md" />
          </div>
      );
    }
    
    if (view360.length > 0) {
        return (
            <div className="w-full h-full flex flex-col gap-2 items-center justify-center">
                <div className="flex-grow w-full relative flex items-center justify-center">
                    <img src={view360[active360Index]} alt="360 view" className="max-w-full max-h-full object-contain rounded-md"/>
                </div>
                <div className="flex-shrink-0 grid grid-cols-4 gap-2 p-2 bg-black/20 rounded-lg">
                    {view360.map((img, i) => <button key={i} onClick={() => setActive360Index(i)} className={`aspect-square rounded-md overflow-hidden border-2 ${active360Index === i ? 'border-blue-500' : 'border-transparent'}`}><img src={img} className="w-full h-full object-cover" /></button>)}
                </div>
            </div>
        )
    }

    if (batchMockups.length > 0) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 overflow-y-auto h-full">
                {batchMockups.map((mockup, i) => (
                    <div key={i} className="relative group aspect-square">
                        <img src={mockup} alt={`Batch Mockup ${i + 1}`} className="w-full h-full object-cover rounded-md"/>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                            <button onClick={() => downloadImage(mockup, i)} className="text-white p-3 bg-blue-600 rounded-full hover:bg-blue-700"><DownloadIcon /></button>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (generatedMockup) {
      return (
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
            <img src={generatedMockup} alt="Generated Mockup" className="max-w-full max-h-full object-contain rounded-md" style={{ transform: `scale(${zoom})` }}/>
        </div>
      );
    }
    
    return (
        <div className="text-center text-gray-500">
          <h3 className="font-bold text-2xl">Your Masterpiece Awaits</h3>
          <p className="mt-2">Configure your options and click generate.</p>
        </div>
    );
  };
  
  return (
    <div className="flex flex-col gap-4">
        <div className="bg-gray-800 rounded-lg shadow-lg aspect-square lg:aspect-[4/3] flex items-center justify-center p-2 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-gray-900/70 z-10 rounded-lg flex flex-col items-center justify-center">
                <SpinnerIcon />
                <p className="mt-4 text-lg">{loadingMessage}</p>
              </div>
            )}
            
            {error && !isLoading && (
              <div className="text-center text-red-400 p-4">
                <h3 className="font-bold text-xl">Generation Failed</h3>
                <p className="mt-2 text-sm">{error}</p>
                <button onClick={clearResults} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md">Try Again</button>
              </div>
            )}
            
            {!isLoading && !error && <ResultContent />}

            {isEditing && (
              <div className="absolute inset-0 bg-gray-900/70 z-20 rounded-lg flex flex-col items-center justify-center">
                <SpinnerIcon />
                <p className="mt-4 text-lg">Applying your edits...</p>
              </div>
            )}

            {hasResults && !isLoading && !isEditing && (
                 <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    {(appMode === 'ai_models' || appMode === 'realtime_configurator') && generatedMockup && <>
                      <button onClick={onRegenerate} title="Regenerate" className="bg-gray-700 p-2 rounded-full hover:bg-gray-600"><RefreshIcon /></button>
                      <div className="bg-gray-700/80 rounded-full flex items-center">
                          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="p-2 hover:bg-gray-600 rounded-l-full"><ZoomOutIcon/></button>
                          <button onClick={() => setZoom(1)} className="p-2 hover:bg-gray-600 border-x border-gray-600"><ResetZoomIcon /></button>
                          <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="p-2 hover:bg-gray-600 rounded-r-full"><ZoomInIcon/></button>
                      </div>
                    </>}
                    {(generatedMockup || tryOnResult) &&
                      <button onClick={onUpscale} title="UHD Upscale" className="bg-purple-600 p-2 rounded-full hover:bg-purple-700"><UpscaleIcon /></button>
                    }
                    {(generatedMockup || tryOnResult) &&
                        <button onClick={() => downloadImage(generatedMockup || tryOnResult!, 0)} title="Download" className="bg-blue-600 p-2 rounded-full hover:bg-blue-700"><DownloadIcon /></button>
                    }
                    {(batchMockups.length > 0 || view360.length > 0) &&
                       <button onClick={() => downloadAll(batchMockups.length > 0 ? batchMockups : view360)} title="Download All" className="bg-blue-600 p-2 rounded-full hover:bg-blue-700 flex items-center gap-2 font-semibold px-4"><DownloadIcon/> All</button>
                    }
                </div>
            )}
        </div>
        
        {(appMode === 'ai_models' || appMode === 'realtime_configurator') && ecommerceKit && <EcommerceKitDisplay result={ecommerceKit} />}

        {(appMode === 'ai_models' || appMode === 'realtime_configurator') && generatedMockup && !isLoading && <PostGenerationActions onGenerateEcommerceKit={onGenerateEcommerceKit} onGenerateVideo={onGenerateVideo} />}

        {(appMode === 'ai_models' || appMode === 'realtime_configurator') && generatedMockup && !isLoading && (
            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-lg">Refine Your Mockup</h3>
                <div className="flex gap-2">
                    <input type="text" value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} placeholder="e.g., 'make the model smile', 'change background to a beach'" className="flex-grow bg-gray-700 rounded-md py-2 px-3 focus:ring-blue-500" disabled={isEditing}/>
                    <button onClick={onEdit} disabled={isEditing || !editPrompt} className="bg-green-600 font-bold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-600">Update</button>
                </div>
            </div>
        )}
    </div>
  );
};

export default DisplayArea;