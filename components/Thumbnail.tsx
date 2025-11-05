
import React from 'react';
import { Asset } from '../types';
import { ImageIcon, VideoIcon } from './icons';

interface ThumbnailProps {
  asset: Asset;
  isSelected: boolean;
  isActive: boolean;
  onSelectionChange: (id: string, isMultiSelect: boolean) => void;
}

export const Thumbnail: React.FC<ThumbnailProps> = React.memo(({ asset, isSelected, isActive, onSelectionChange }) => {
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        onSelectionChange(asset.id, e.metaKey || e.ctrlKey);
    };

    const ringClass = isActive ? 'ring-2 ring-blue-500' : 'ring-2 ring-transparent';
    const selectionClass = isSelected ? 'opacity-100' : 'opacity-0';

    return (
        <div 
            className={`relative aspect-square rounded-md overflow-hidden cursor-pointer group transition-all ${ringClass}`}
            onClick={handleClick}
        >
            <img src={asset.poster || asset.previewUrl} alt={asset.file.name} className="w-full h-full object-cover" />
            
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors" />

            {/* Selection Checkmark */}
            <div className={`absolute top-2 left-2 w-5 h-5 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center transition-opacity ${selectionClass}`}>
                 <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>

            {/* File Type Icon */}
            <div className="absolute bottom-2 right-2 p-1 bg-black/50 rounded-full">
                {asset.type === 'image' ? <ImageIcon className="w-4 h-4 text-white" /> : <VideoIcon className="w-4 h-4 text-white" />}
            </div>
        </div>
    );
});
