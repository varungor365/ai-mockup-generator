import React, { useState } from 'react';
import type { BrandKit } from '../types';
import DownloadIcon from './icons/DownloadIcon'; // Re-using for upload icon visually

interface BrandKitManagerProps {
    brandKit: BrandKit;
    onBrandKitChange: (kit: BrandKit) => void;
    onClose: () => void;
}

const BrandKitManager: React.FC<BrandKitManagerProps> = ({ brandKit, onBrandKitChange, onClose }) => {
    const [logoPreview, setLogoPreview] = useState<string | null>(brandKit.logo);

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        onBrandKitChange({ ...brandKit, logo: logoPreview });
        onClose();
    };
    
    const handleRemoveLogo = () => {
        setLogoPreview(null);
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 border-b border-gray-700">
                    <h2 className="text-xl font-bold">Manage Brand Kit</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Brand Logo (for Watermark)</h3>
                         <label htmlFor="logo-upload" className="cursor-pointer block w-full p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500 text-center">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo Preview" className="max-h-24 mx-auto" />
                            ) : (
                                <div className="text-gray-400">
                                    <DownloadIcon className="mx-auto h-8 w-8" />
                                    <span className="mt-2 block text-sm">Upload Logo (PNG recommended)</span>
                                </div>
                            )}
                        </label>
                        <input id="logo-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleLogoUpload} />
                        {logoPreview && <button onClick={handleRemoveLogo} className="w-full mt-2 text-sm text-red-400 hover:underline">Remove Logo</button>}
                    </div>
                    {/* Placeholder for brand colors */}
                    <div>
                         <h3 className="font-semibold mb-2">Brand Colors</h3>
                         <p className="text-sm text-gray-500">Color suggestions coming soon!</p>
                    </div>
                </div>
                <div className="p-4 bg-gray-900/50 flex justify-end gap-3 rounded-b-lg">
                    <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Save</button>
                </div>
            </div>
        </div>
    );
};

export default BrandKitManager;
