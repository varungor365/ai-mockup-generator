import React, { useState, useCallback, useEffect } from 'react';
import type { MockupOptions, DesignFile, Template, HistoryItem, UserPreset, EcommerceKitResult, BrandKit, AppMode, TryOnOptions, DesignTransform } from './types';
import { TEMPLATES, TSHIRT_COLORS } from './constants';
import { generateMockup, editMockup, upscaleImage, generateEcommerceKit, generate360View, generateVideoMockup, generateVirtualTryOn } from './services/geminiService';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import DisplayArea from './components/DisplayArea';
import GenerationHistory from './components/GenerationHistory';
import RealtimeConfigurator from './components/RealtimeConfigurator';

const App: React.FC = () => {
  // App Mode State
  const [appMode, setAppMode] = useState<AppMode>('ai_models');

  // AI Models & Configurator State
  const [options, setOptions] = useState<MockupOptions>(TEMPLATES[0].options);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(TEMPLATES[0].name);
  const [designFile, setDesignFile] = useState<DesignFile | null>(null);
  const [generatedMockup, setGeneratedMockup] = useState<string | null>(null);
  const [batchMockups, setBatchMockups] = useState<string[]>([]);
  const [view360, setView360] = useState<string[]>([]);
  const [videoMockup, setVideoMockup] = useState<string | null>(null);
  const [ecommerceKit, setEcommerceKit] = useState<EcommerceKitResult | null>(null);

  // Virtual Try-On State
  const [userPhoto, setUserPhoto] = useState<DesignFile | null>(null);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [tryOnOptions, setTryOnOptions] = useState<TryOnOptions>({ clothingType: 't-shirt', color: TSHIRT_COLORS[0]});

  // UI/App State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState('Generating...');
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editPrompt, setEditPrompt] = useState('');
  
  // History & Presets
  const [generationHistory, setGenerationHistory] = useState<HistoryItem[]>([]);
  const [userPresets, setUserPresets] = useState<UserPreset[]>([]);

  // Brand Kit State
  const [brandKit, setBrandKit] = useState<BrandKit>({ logo: null, applyWatermark: false });

  useEffect(() => {
    try {
      const savedPresets = localStorage.getItem('userPresets');
      if (savedPresets) setUserPresets(JSON.parse(savedPresets));
      const savedBrandKit = localStorage.getItem('brandKit');
      if (savedBrandKit) setBrandKit(JSON.parse(savedBrandKit));
    } catch (e) {
      console.error("Failed to load from localStorage", e);
    }
  }, []);

  const clearResults = useCallback(() => {
    setGeneratedMockup(null);
    setBatchMockups([]);
    setView360([]);
    setVideoMockup(null);
    setEcommerceKit(null);
    setTryOnResult(null);
    setError(null);
  }, []);
  
  const applyWatermark = useCallback(async (imageUrl: string): Promise<string> => {
      if (!brandKit.applyWatermark || !brandKit.logo) {
          return imageUrl;
      }
      return new Promise((resolve) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx!.drawImage(img, 0, 0);

              const watermark = new Image();
              watermark.crossOrigin = 'anonymous';
              watermark.onload = () => {
                  const scale = 0.15; // Watermark is 15% of the main image's width
                  const w = img.width * scale;
                  const h = watermark.height * (w / watermark.width);
                  const padding = img.width * 0.02;
                  ctx!.globalAlpha = 0.7;
                  ctx!.drawImage(watermark, img.width - w - padding, img.height - h - padding, w, h);
                  resolve(canvas.toDataURL('image/png'));
              };
              watermark.src = brandKit.logo!;
          };
          img.src = imageUrl;
      });
  }, [brandKit]);

  const addItemsToHistory = (items: { image: string, options: MockupOptions }[]) => {
    const newHistoryItems: HistoryItem[] = items.map(item => ({ id: Date.now() + Math.random(), ...item }));
    setGenerationHistory(prev => [...newHistoryItems, ...prev].slice(0, 20)); // Limit history size
  };

  const handleGeneration = useCallback(async (generationFn: () => Promise<string | string[]>, message: string, postProcessor?: (result: any) => void) => {
    if (!designFile) {
        setError('Please upload or generate a design file first.');
        return;
    }
    setIsLoading(true);
    setLoadingMessage(message);
    clearResults();

    try {
        let result = await generationFn();
        if (Array.isArray(result)) {
            const watermarkedResults = await Promise.all(result.map(img => applyWatermark(img)));
             if(postProcessor) postProcessor(watermarkedResults);
             addItemsToHistory(watermarkedResults.map(image => ({ image, options })));
        } else {
            const watermarkedResult = await applyWatermark(result);
            if(postProcessor) postProcessor(watermarkedResult);
            addItemsToHistory([{ image: watermarkedResult, options }]);
        }
    } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage.includes('key') ? "API Key invalid. Please select a valid key for this model in the MakerSuite tools." : errorMessage);
    } finally {
        setIsLoading(false);
    }
  }, [designFile, options, applyWatermark, clearResults]);

  const performGeneration = () => handleGeneration(() => generateMockup(options, designFile!), 'Generating mockup...', setGeneratedMockup);
  const performBatchGeneration = (colors: MockupOptions['color'][]) => handleGeneration(() => Promise.all(colors.map(color => generateMockup({ ...options, color }, designFile!))), `Generating ${colors.length} mockups...`, setBatchMockups);
  const perform360ViewGeneration = () => handleGeneration(() => generate360View(options, designFile!), 'Generating 360° view...', setView360);

  const performVirtualTryOn = useCallback(async () => {
    if (!designFile || !userPhoto) {
        setError('Please upload your photo and a design file.');
        return;
    }
    setIsLoading(true);
    setLoadingMessage('Performing virtual try-on...');
    clearResults();
    try {
      const result = await generateVirtualTryOn(userPhoto, designFile, tryOnOptions);
      const watermarkedResult = await applyWatermark(result);
      setTryOnResult(watermarkedResult);
    } catch(err) {
      setError(err instanceof Error ? err.message : 'Failed to generate try-on.');
    } finally {
      setIsLoading(false);
    }
  }, [designFile, userPhoto, tryOnOptions, applyWatermark, clearResults]);


  const performEcommerceKitGeneration = useCallback(async () => {
      if (!designFile) return;
      setIsLoading(true);
      setLoadingMessage('Generating E-commerce Kit...');
      setEcommerceKit(null); // Clear previous kit
      setError(null);
      try {
          const result = await generateEcommerceKit(designFile);
          setEcommerceKit(result);
      } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to generate kit.');
      } finally {
          setIsLoading(false);
      }
  }, [designFile]);

  const performVideoGeneration = useCallback(async () => {
    if (!designFile) return;
    setIsLoading(true);
    setLoadingMessage('Generating video... (may take a few minutes)');
    setVideoMockup(null); // Clear previous video
    setError(null);
    try {
        const result = await generateVideoMockup(options, designFile);
        setVideoMockup(result);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate video.');
    } finally {
        setIsLoading(false);
    }
}, [designFile, options]);


  const performEdit = useCallback(async () => {
    if (!generatedMockup) return;
    setIsEditing(true);
    setError(null);
    try {
        const file = { base64: generatedMockup.split(',')[1], mimeType: generatedMockup.split(';')[0].split(':')[1], previewUrl: '' };
        const result = await editMockup(file, editPrompt);
        const watermarkedResult = await applyWatermark(result);
        setGeneratedMockup(watermarkedResult);
        addItemsToHistory([{ image: watermarkedResult, options }]);
        setEditPrompt('');
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred during edit.');
    } finally {
        setIsEditing(false);
    }
  }, [generatedMockup, editPrompt, options, applyWatermark]);
  
  const performUpscale = useCallback(async () => {
    const targetImage = appMode === 'ai_models' ? generatedMockup : tryOnResult;
    if (!targetImage) return;

    setIsLoading(true);
    setLoadingMessage('Upscaling to UHD...');
    setError(null);
    try {
        const file = { base64: targetImage.split(',')[1], mimeType: targetImage.split(';')[0].split(':')[1], previewUrl: '' };
        const result = await upscaleImage(file);
        const watermarkedResult = await applyWatermark(result);
        
        if (appMode === 'ai_models' || appMode === 'realtime_configurator') {
          setGeneratedMockup(watermarkedResult);
          addItemsToHistory([{ image: watermarkedResult, options }]);
        } else {
          setTryOnResult(watermarkedResult);
        }
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred during upscale.');
    } finally {
        setIsLoading(false);
    }
  }, [generatedMockup, tryOnResult, appMode, options, applyWatermark]);

  const handleSetDesign = (base64: string, mimeType: string) => setDesignFile({ base64, mimeType, previewUrl: `data:${mimeType};base64,${base64}` });
  const handleSetUserPhoto = (base64: string, mimeType: string) => setUserPhoto({ base64, mimeType, previewUrl: `data:${mimeType};base64,${base64}` });
  
  const handleHistorySelect = (item: HistoryItem) => {
    handleModeChange('ai_models');
    clearResults();
    setGeneratedMockup(item.image);
    setOptions(item.options);
    setActiveTemplate(null);
  };

  const handleSavePreset = (name: string) => {
      const newPreset = { name, options };
      const updatedPresets = [...userPresets, newPreset];
      setUserPresets(updatedPresets);
      localStorage.setItem('userPresets', JSON.stringify(updatedPresets));
  };
  
  const handleDeletePreset = (name: string) => {
    const updatedPresets = userPresets.filter(p => p.name !== name);
    setUserPresets(updatedPresets);
    localStorage.setItem('userPresets', JSON.stringify(updatedPresets));
  };

  const handleBrandKitChange = (newBrandKit: BrandKit) => {
    setBrandKit(newBrandKit);
    localStorage.setItem('brandKit', JSON.stringify(newBrandKit));
  };
  
  const handleModeChange = (mode: AppMode) => {
    setAppMode(mode);
    clearResults();
  }

  const handleTransformChange = (transform: DesignTransform) => {
    setOptions(prev => ({
      ...prev,
      designTransform: transform,
      placement: 'custom',
      scale: 'custom'
    }))
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <ControlPanel
              appMode={appMode}
              setAppMode={handleModeChange}
              options={options}
              setOptions={newOpts => { setOptions(prev => ({...prev, ...newOpts})); setActiveTemplate(null); }}
              setDesignFile={handleSetDesign}
              designFile={designFile}
              onGenerate={performGeneration}
              onBatchGenerate={performBatchGeneration}
              onGenerate360={perform360ViewGeneration}
              isLoading={isLoading}
              setLoading={setIsLoading}
              setLoadingMessage={setLoadingMessage}
              setError={setError}
              onTemplateSelect={template => { setOptions(template.options); setActiveTemplate(template.name); }}
              activeTemplate={activeTemplate}
              userPresets={userPresets}
              onSavePreset={handleSavePreset}
              onDeletePreset={handleDeletePreset}
              brandKit={brandKit}
              onBrandKitChange={handleBrandKitChange}
              // Virtual Try-on props
              userPhoto={userPhoto}
              setUserPhoto={handleSetUserPhoto}
              tryOnOptions={tryOnOptions}
              setTryOnOptions={setTryOnOptions}
              onVirtualTryOn={performVirtualTryOn}
              // Configurator props
              onTransformChange={handleTransformChange}
            />
          </div>
          <div className="lg:col-span-8">
            {appMode === 'realtime_configurator' ? (
              <RealtimeConfigurator 
                designFile={designFile}
                tshirtColor={options.color.value}
                onTransformChange={handleTransformChange}
                transform={options.designTransform}
              />
            ) : (
               <DisplayArea
                appMode={appMode}
                // AI Models props
                generatedMockup={generatedMockup}
                batchMockups={batchMockups}
                view360={view360}
                videoMockup={videoMockup}
                ecommerceKit={ecommerceKit}
                onRegenerate={performGeneration}
                onEdit={performEdit}
                editPrompt={editPrompt}
                setEditPrompt={setEditPrompt}
                onGenerateEcommerceKit={performEcommerceKitGeneration}
                onGenerateVideo={performVideoGeneration}
                // Virtual Try-on props
                userPhoto={userPhoto}
                tryOnResult={tryOnResult}
                // Common props
                isLoading={isLoading}
                loadingMessage={loadingMessage}
                isEditing={isEditing}
                error={error}
                onUpscale={performUpscale}
                clearResults={clearResults}
              />
            )}
           
            {(appMode === 'ai_models' || (appMode === 'realtime_configurator' && generatedMockup)) && (
              <GenerationHistory 
                history={generationHistory}
                onSelect={handleHistorySelect}
              />
            )}
          </div>
        </div>
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>Powered by the Gemini API</p>
      </footer>
    </div>
  );
};

export default App;