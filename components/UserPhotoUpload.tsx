import React from 'react';
import type { DesignFile } from '../types';
import PersonIcon from './icons/PersonIcon';

interface UserPhotoUploadProps {
    userPhoto: DesignFile | null;
    setUserPhoto: (base64: string, mimeType: string) => void;
    setError: (error: string | null) => void;
}

const UserPhotoUpload: React.FC<UserPhotoUploadProps> = ({ userPhoto, setUserPhoto, setError }) => {

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) {
                alert('File size should not exceed 4MB');
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => setUserPhoto((reader.result as string).split(',')[1], file.type);
            reader.onerror = (error) => setError(JSON.stringify(error));
        }
    };

    return (
        <div className="space-y-4">
             <label htmlFor="user-photo-upload" className="cursor-pointer block w-full p-2 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500 hover:bg-gray-700/50">
                {userPhoto ? (
                     <img src={userPhoto.previewUrl} alt="User photo preview" className="max-h-32 mx-auto rounded-md" />
                ) : (
                    <div className="text-gray-400 text-center py-6">
                        <PersonIcon className="w-10 h-10 mx-auto text-gray-500" />
                        <p className="font-semibold mt-2">Click to upload your photo</p>
                    </div>
                )}
            </label>
            <input id="user-photo-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
            <ul className="text-xs text-gray-400 list-disc list-inside space-y-1">
                <li>Use a clear, well-lit, forward-facing photo.</li>
                <li>Ensure the clothing you want to replace is clearly visible.</li>
                <li>File size limit: 4MB.</li>
            </ul>
        </div>
    );
}

export default UserPhotoUpload;