
import React from 'react';
import { Asset } from '../types';
import { Uploader } from './Uploader';
import { Thumbnail } from './Thumbnail';

interface AssetPanelProps {
  assets: Asset[];
  selectedAssetIds: Set<string>;
  activeAssetId: string | null;
  onFileUploads: (files: File[]) => void;
  onSelectionChange: (id: string, isMultiSelect: boolean) => void;
}

export const AssetPanel: React.FC<AssetPanelProps> = ({ assets, selectedAssetIds, activeAssetId, onFileUploads, onSelectionChange }) => {
  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
      <Uploader onFileUploads={onFileUploads} />
      <div className="flex-grow overflow-y-auto">
        {assets.length > 0 ? (
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2 pr-2">
            {assets.map((asset) => (
              <Thumbnail
                key={asset.id}
                asset={asset}
                isSelected={selectedAssetIds.has(asset.id)}
                isActive={activeAssetId === asset.id}
                onSelectionChange={onSelectionChange}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center text-gray-500">
            <p>Your uploaded assets will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
