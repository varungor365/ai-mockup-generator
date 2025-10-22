import React, { useState } from 'react';
import type { MockupOptions, DesignFile, Template, ColorOption, ArtStyle, UserPreset, FabricTexture, DesignPlacement, DesignScale, BrandKit, Gender, Angle, AppMode, TryOnOptions, DesignTransform } from '../types';
import { TSHIRT_COLORS, BACKGROUNDS, TEMPLATES, ART_STYLES, CUSTOM_BACKGROUND_PROMPT, FABRIC_TEXTURES, DESIGN_PLACEMENTS, DESIGN_SCALES } from '../constants';
import { removeDesignBackground, suggestColors } from '../services/geminiService';
import AiDesignerPanel from './AiDesignerPanel';
import PresetManager from './PresetManager';
import MagicWandIcon from './icons/MagicWandIcon';
import SparklesIcon from './icons/SparklesIcon';
import BrandKitManager from './BrandKitManager';
import PersonIcon from './icons/PersonIcon';
import UserPhotoUpload from './UserPhotoUpload';
import CubeIcon from './icons/CubeIcon';

interface ControlPanelProps {
  // Mode
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;

  // AI Models props
  options: MockupOptions;
  setOptions: (options: Partial<MockupOptions>) => void;
  onGenerate: () => void;
  onBatchGenerate: (colors: ColorOption[]) => void;
  onGenerate360: () => void;
  onTemplateSelect: (template: Template) => void;
  activeTemplate: string | null;
  userPresets: UserPreset[];
  onSavePreset: (name: string) => void;
  onDeletePreset: (name: string) => void;

  // Virtual Try-on props
  userPhoto: DesignFile | null;
  setUserPhoto: (base64: string, mimeType: string) => void;
  tryOnOptions: TryOnOptions;
  setTryOnOptions: (options: TryOnOptions) => void;
  onVirtualTryOn: () => void;
  
  // Realtime Configurator props
  onTransformChange: (transform: DesignTransform) => void;

  // Common props
  designFile: DesignFile | null;
  setDesignFile: (base64: string, mimeType: string) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
  setError: (error: string | null) => void;
  brandKit: BrandKit;
  onBrandKitChange: (kit: BrandKit) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = (props) => {
  const { options, setOptions, designFile, setDesignFile, onGenerate, onBatchGenerate, onGenerate360, isLoading, brandKit, onBrandKitChange, appMode, setAppMode, onTransformChange } = props;
  
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchColors, setBatchColors] = useState<ColorOption[]>([]);
  const [suggestedColors, setSuggestedColors] = useState<string[]>([]);
  const [isBrandKitOpen, setIsBrandKitOpen] = useState(false);
  const [designTab, setDesignTab] = useState<'upload' | 'ai'>('upload');
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert('File size should not exceed 4MB');
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => setDesignFile((reader.result as string).split(',')[1], file.type);
      reader.onerror = (error) => props.setError(JSON.stringify(error));
    }
  };
  
  const handleAIAssist = async (action: 'removeBg' | 'suggestColors') => {
      if (!designFile) return;
      props.setLoading(true);
      props.setLoadingMessage(action === 'removeBg' ? 'Removing background...' : 'Suggesting colors...');
      props.setError(null);
      try {
          if (action === 'removeBg') {
              const result = await removeDesignBackground(designFile);
              setDesignFile(result.split(',')[1], result.split(';')[0].split(':')[1]);
          } else {
              const suggestions = await suggestColors(designFile, TSHIRT_COLORS.map(c => c.name));
              setSuggestedColors(suggestions);
          }
      } catch (err) {
          props.setError(err instanceof Error ? err.message : `Failed to ${action}.`);
      } finally {
          props.setLoading(false);
      }
  };

  const handleColorClick = (color: ColorOption) => {
    if (appMode === 'ai_models' || appMode === 'realtime_configurator') {
        if (isBatchMode && appMode === 'ai_models') {
          setBatchColors(prev => prev.some(c => c.name === color.name) ? prev.filter(c => c.name !== color.name) : [...prev, color]);
        } else {
          setOptions({ color });
        }
    } else {
        props.setTryOnOptions({ ...props.tryOnOptions, color });
    }
  };
  
  const handleSurpriseMe = () => {
    setOptions({
      color: TSHIRT_COLORS[Math.floor(Math.random() * TSHIRT_COLORS.length)],
      fit: Math.random() > 0.5 ? 'regular' : 'oversized',
      mockupType: Math.random() > 0.5 ? 'fullBody' : 'tshirtOnly',
      gender: ['male', 'female', 'any'][Math.floor(Math.random() * 3)] as Gender,
      angle: 'front',
      background: BACKGROUNDS.filter(b => b !== CUSTOM_BACKGROUND_PROMPT)[Math.floor(Math.random() * (BACKGROUNDS.length - 1))],
      artStyle: ART_STYLES[Math.floor(Math.random() * ART_STYLES.length)].value,
      texture: FABRIC_TEXTURES[Math.floor(Math.random() * FABRIC_TEXTURES.length)].value,
      placement: DESIGN_PLACEMENTS[Math.floor(Math.random() * DESIGN_PLACEMENTS.length)].value,
      scale: DESIGN_SCALES[Math.floor(Math.random() * DESIGN_SCALES.length)].value,
      sceneAdditions: '',
      modelAppearance: '',
      customBackground: '',
    });
  };

  const Section: React.FC<{title: string, step?: number, children: React.ReactNode}> = ({title, step, children}) => (
    <div className="space-y-4 border-t border-gray-700/50 pt-6">
      <h3 className="font-semibold text-lg">{step && <span className="text-blue-400 font-bold">{step}. </span>}{title}</h3>
      {children}
    </div>
  );

  const ColorSelector: React.FC = () => {
    const selectedColorName = appMode === 'virtual_try_on' ? props.tryOnOptions.color.name : options.color.name;
    return (
        <div className="flex flex-wrap gap-3">
            {TSHIRT_COLORS.map(color => {
                const isSelected = isBatchMode && appMode !== 'virtual_try_on' ? batchColors.some(c => c.name === color.name) : selectedColorName === color.name;
                const isSuggested = suggestedColors.includes(color.name);
                return <button key={color.name} title={color.name} onClick={() => handleColorClick(color)} className={`relative w-9 h-9 rounded-full border-2 ${isSelected ? 'border-blue-400 ring-2 ring-offset-2 ring-offset-gray-800 ring-blue-400' : 'border-gray-600 hover:border-white'}`} style={{ background: color.value }}>
                          {isSuggested && !isSelected && <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-yellow-400 ring-2 ring-gray-800" />}
                       </button>
            })}
        </div>
    );
  };
  
  const DesignUploader: React.FC = () => (
    <>
      <div className="flex bg-gray-900 p-1 rounded-lg">
          <button onClick={() => setDesignTab('upload')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${designTab === 'upload' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}>Upload File</button>
          <button onClick={() => setDesignTab('ai')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${designTab === 'ai' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}>✨ Generate with AI</button>
      </div>
      {designTab === 'upload' ? (
        <>
          <label htmlFor="file-upload" className="cursor-pointer block w-full p-2 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500 hover:bg-gray-700/50">
            {designFile ? <img src={designFile.previewUrl} alt="Design Preview" className="max-h-24 mx-auto" /> : <div className="text-gray-400 text-center py-6">...Click to upload design...</div>}
          </label>
          <input id="file-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
          {designFile && <button onClick={() => handleAIAssist('removeBg')} disabled={isLoading} className="w-full text-sm bg-gray-700 font-semibold py-2 px-3 rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2"><MagicWandIcon />Remove Background</button>}
        </>
      ) : (
          <AiDesignerPanel setDesignFile={setDesignFile} setLoading={props.setLoading} setLoadingMessage={props.setLoadingMessage} setError={props.setError} onDesignGenerated={() => {}} />
      )}
    </>
  );

  const renderAiModelsControls = () => (
      <>
        <Section title="Upload Your Design" step={1}>
          <DesignUploader />
        </Section>
        <Section title="Configure Your Mockup" step={2}>
            <div className="flex justify-between items-center">
                <select onChange={(e) => props.onTemplateSelect(TEMPLATES.find(t => t.name === e.target.value)!)} value={props.activeTemplate || ''} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-blue-500">
                  <option value="" disabled>-- Select a Template --</option>
                  {TEMPLATES.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                </select>
                <button onClick={handleSurpriseMe} className="ml-2 flex-shrink-0 bg-purple-600 hover:bg-purple-700 p-2 rounded-lg" title="Surprise Me!"><SparklesIcon /></button>
            </div>

            <div className="flex justify-between items-center">
                <h4 className="font-medium">T-Shirt Color</h4>
                <div className="flex items-center gap-4">
                    <button onClick={() => handleAIAssist('suggestColors')} disabled={!designFile || isLoading} className="flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200 disabled:opacity-50"><MagicWandIcon />Suggest</button>
                    <label className="text-sm"><input type="checkbox" checked={isBatchMode} onChange={(e) => setIsBatchMode(e.target.checked)} className="mr-1 accent-blue-500" />Batch</label>
                </div>
            </div>
            <ColorSelector />
            
            <div className="grid grid-cols-2 gap-4">
              <div><label className="font-medium text-sm">Placement</label><select value={options.placement} onChange={e => setOptions({ placement: e.target.value as DesignPlacement })} className="w-full mt-1 bg-gray-700 border-gray-600 rounded-md p-2 text-sm"><option value="center chest">Center Chest</option><option value="left chest (pocket)">Pocket</option><option value="large graphic">Large Graphic</option></select></div>
              <div><label className="font-medium text-sm">Scale</label><select value={options.scale} onChange={e => setOptions({ scale: e.target.value as DesignScale })} className="w-full mt-1 bg-gray-700 border-gray-600 rounded-md p-2 text-sm"><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option></select></div>
              <div><label className="font-medium text-sm">Fabric</label><select value={options.texture} onChange={e => setOptions({ texture: e.target.value as FabricTexture })} className="w-full mt-1 bg-gray-700 border-gray-600 rounded-md p-2 text-sm">{FABRIC_TEXTURES.map(t=><option key={t.value} value={t.value}>{t.name}</option>)}</select></div>
              <div><label className="font-medium text-sm">Fit</label><select value={options.fit} onChange={e => setOptions({ fit: e.target.value as any })} className="w-full mt-1 bg-gray-700 border-gray-600 rounded-md p-2 text-sm"><option value="regular">Regular</option><option value="oversized">Oversized</option></select></div>
            </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="font-medium text-sm">Gender</label>
                    <select value={options.gender} onChange={e => setOptions({ gender: e.target.value as Gender })} className="w-full mt-1 bg-gray-700 border-gray-600 rounded-md p-2 text-sm">
                        <option value="any">Any</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
                <div>
                    <label className="font-medium text-sm">Angle</label>
                    <select value={options.angle} onChange={e => setOptions({ angle: e.target.value as Angle })} className="w-full mt-1 bg-gray-700 border-gray-600 rounded-md p-2 text-sm">
                        <option value="front">Front</option>
                        <option value="back">Back</option>
                        <option value="left side">Left Side</option>
                        <option value="right side">Right Side</option>
                    </select>
                </div>
            </div>
            
            <div>
                <label className="font-medium text-sm">Model Appearance (Optional)</label>
                <input type="text" value={options.modelAppearance} onChange={e => setOptions({ modelAppearance: e.target.value })} placeholder="e.g., woman with curly red hair" className="w-full mt-1 bg-gray-700 border-gray-600 rounded-md p-2 text-sm" />
            </div>

             <div>
              <label className="font-medium text-sm">Scene Additions</label>
              <input type="text" value={options.sceneAdditions} onChange={e => setOptions({ sceneAdditions: e.target.value })} placeholder="e.g., holding a skateboard" className="w-full mt-1 bg-gray-700 border-gray-600 rounded-md p-2 text-sm" />
            </div>
            
            <PresetManager options={options} setOptions={setOptions as (o: MockupOptions) => void} userPresets={props.userPresets} onSavePreset={props.onSavePreset} onDeletePreset={props.onDeletePreset} />
        </Section>
      </>
  );

  const renderVirtualTryOnControls = () => (
      <>
        <Section title="Upload Your Photo" step={1}>
            <UserPhotoUpload userPhoto={props.userPhoto} setUserPhoto={props.setUserPhoto} setError={props.setError}/>
        </Section>
         <Section title="Upload Your Design" step={2}>
          <DesignUploader />
        </Section>
        <Section title="Configure Try-On" step={3}>
            <div>
                <label className="font-medium text-sm">What are you wearing in the photo?</label>
                <input type="text" value={props.tryOnOptions.clothingType} onChange={e => props.setTryOnOptions({ ...props.tryOnOptions, clothingType: e.target.value })} placeholder="e.g., t-shirt, hoodie, sweater" className="w-full mt-1 bg-gray-700 border-gray-600 rounded-md p-2 text-sm" />
            </div>
             <div>
                <label className="font-medium text-sm">T-Shirt Color</label>
                <div className="mt-2"><ColorSelector /></div>
             </div>
        </Section>
      </>
  );

  const renderConfiguratorControls = () => {
      const transform = options.designTransform || { position: {x: 0.5, y: 0.5}, scale: 0.25, rotation: 0 };
      
      const handleSliderChange = (field: 'x' | 'y' | 'scale' | 'rotation', value: number) => {
          const newTransform = {...transform};
          if (field === 'x' || field === 'y') {
            newTransform.position = {...transform.position, [field]: value};
          } else {
            newTransform[field] = value;
          }
          onTransformChange(newTransform);
      };

      return (
          <>
              <Section title="Upload Your Design" step={1}>
                  <DesignUploader />
              </Section>
              <Section title="Style Your T-Shirt" step={2}>
                  <label className="font-medium text-sm">T-Shirt Color</label>
                  <div className="mt-2"><ColorSelector /></div>
                  <div className="mt-4">
                      <label className="font-medium text-sm">Fabric</label>
                      <select value={options.texture} onChange={e => setOptions({ texture: e.target.value as FabricTexture })} className="w-full mt-1 bg-gray-700 border-gray-600 rounded-md p-2 text-sm">{FABRIC_TEXTURES.map(t=><option key={t.value} value={t.value}>{t.name}</option>)}</select>
                  </div>
              </Section>
              <Section title="Adjust Design Placement" step={3}>
                  <div className="space-y-4">
                      <div>
                          <label className="text-sm font-medium">Position X: {Math.round(transform.position.x * 100)}%</label>
                          <input type="range" min="0" max="1" step="0.01" value={transform.position.x} onChange={e => handleSliderChange('x', parseFloat(e.target.value))} className="w-full accent-blue-500"/>
                      </div>
                      <div>
                          <label className="text-sm font-medium">Position Y: {Math.round(transform.position.y * 100)}%</label>
                          <input type="range" min="0" max="1" step="0.01" value={transform.position.y} onChange={e => handleSliderChange('y', parseFloat(e.target.value))} className="w-full accent-blue-500"/>
                      </div>
                      <div>
                          <label className="text-sm font-medium">Scale: {Math.round(transform.scale * 100)}%</label>
                          <input type="range" min="0.05" max="1" step="0.01" value={transform.scale} onChange={e => handleSliderChange('scale', parseFloat(e.target.value))} className="w-full accent-blue-500"/>
                      </div>
                      <div>
                          <label className="text-sm font-medium">Rotation: {transform.rotation}°</label>
                          <input type="range" min="-180" max="180" step="1" value={transform.rotation} onChange={e => handleSliderChange('rotation', parseInt(e.target.value))} className="w-full accent-blue-500"/>
                      </div>
                  </div>
              </Section>
          </>
      )
  };


  const renderActionButtons = () => {
    switch(appMode) {
      case 'ai_models':
        return (
          <div className="p-6 border-t border-gray-700 space-y-3">
            <h3 className="font-semibold text-lg text-center"><span className="text-blue-400 font-bold">3.</span> Generate Your Assets</h3>
            <button onClick={() => isBatchMode ? onBatchGenerate(batchColors) : onGenerate()} disabled={isLoading || !designFile || (isBatchMode && batchColors.length < 2) } className="w-full bg-blue-600 font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed">
                {`Generate ${isBatchMode ? `${batchColors.length} Mockups` : 'Mockup'}`}
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={onGenerate360} disabled={isLoading || !designFile} className="w-full bg-gray-700 text-sm font-bold py-3 rounded-lg hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed">Generate 360° View</button>
              <button disabled={true} className="w-full bg-gray-700 text-sm font-bold py-3 rounded-lg hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed">Print-Ready File (Soon)</button>
            </div>
          </div>
        );
      case 'virtual_try_on':
        return (
          <div className="p-6 border-t border-gray-700">
            <button onClick={props.onVirtualTryOn} disabled={isLoading || !designFile || !props.userPhoto} className="w-full bg-blue-600 font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <PersonIcon /> Generate Virtual Try-On
            </button>
          </div>
        );
      case 'realtime_configurator':
          return (
            <div className="p-6 border-t border-gray-700">
              <h3 className="font-semibold text-lg text-center mb-3"><span className="text-blue-400 font-bold">4.</span> Finalize with AI</h3>
              <p className="text-xs text-center text-gray-400 mb-3">Send your precise 3D configuration to the AI to create a photorealistic mockup.</p>
              <button onClick={props.onGenerate} disabled={isLoading || !designFile} className="w-full bg-blue-600 font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                ✨ Generate Photorealistic Mockup
              </button>
            </div>
          );
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg">
      <div className="p-6 space-y-6">
        <div className="flex bg-gray-900 p-1 rounded-lg">
            <button onClick={() => setAppMode('ai_models')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors flex items-center justify-center gap-2 ${appMode === 'ai_models' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}>✨ AI Models</button>
            <button onClick={() => setAppMode('virtual_try_on')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors flex items-center justify-center gap-2 ${appMode === 'virtual_try_on' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}><PersonIcon /> Virtual Try-On</button>
            <button onClick={() => setAppMode('realtime_configurator')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors flex items-center justify-center gap-2 ${appMode === 'realtime_configurator' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}><CubeIcon /> 3D Configurator</button>
        </div>

        {appMode === 'ai_models' && renderAiModelsControls()}
        {appMode === 'virtual_try_on' && renderVirtualTryOnControls()}
        {appMode === 'realtime_configurator' && renderConfiguratorControls()}
        
        <div className="pt-4 border-t border-gray-700/50 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Brand Kit</h4>
            <button onClick={() => setIsBrandKitOpen(true)} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-md">Manage</button>
          </div>
          <label className="flex items-center cursor-pointer">
            <input type="checkbox" checked={brandKit.applyWatermark} onChange={(e) => onBrandKitChange({...brandKit, applyWatermark: e.target.checked})} className="accent-blue-500 h-4 w-4" />
            <span className="ml-2 text-sm">Apply logo watermark</span>
          </label>
        </div>
      </div>

      {renderActionButtons()}

      {isBrandKitOpen && <BrandKitManager brandKit={brandKit} onBrandKitChange={onBrandKitChange} onClose={() => setIsBrandKitOpen(false)} />}
    </div>
  );
};

export default ControlPanel;