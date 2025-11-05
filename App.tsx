
import React, { useState, useCallback, useMemo } from 'react';
import { AssetPanel } from './components/AssetPanel';
import { CaptionPanel } from './components/CaptionPanel';
import { generateCaptions } from './services/geminiService';
import { Asset, CaptionOptions, GeneratedCaptions } from './types';
import { getVideoPoster } from './utils/video';

const App: React.FC = () => {
  const [assets, setAssets] = useState<Map<string, Asset>>(new Map());
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUploads = useCallback(async (files: File[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const newAssets: [string, Asset][] = await Promise.all(
        files.map(async (file) => {
          const id = `${file.name}-${file.lastModified}-${Math.random()}`;
          const type = file.type.startsWith('image/') ? 'image' : 'video';
          const previewUrl = URL.createObjectURL(file);
          let poster: string | undefined;

          if (type === 'video') {
            try {
              poster = await getVideoPoster(file);
            } catch (err) {
              console.error("Could not generate video poster:", err);
            }
          }

          const newAsset: Asset = {
            id,
            file,
            previewUrl,
            type,
            poster: poster || previewUrl,
            captions: null,
          };
          return [id, newAsset];
        })
      );

      setAssets(prev => new Map([...prev, ...newAssets]));
      if (newAssets.length > 0) {
          const firstNewId = newAssets[0][0];
          setActiveAssetId(firstNewId);
          setSelectedAssetIds(new Set([firstNewId]));
      }
    } catch (e) {
      setError('Failed to process files. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectionChange = useCallback((id: string, isMultiSelect: boolean) => {
    setActiveAssetId(id);
    setSelectedAssetIds(prev => {
      const newSet = isMultiSelect ? new Set(prev) : new Set();
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);
  
  const handleGenerate = useCallback(async (assetIdsToProcess: string[], options: CaptionOptions) => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all(
        assetIdsToProcess.map(async (id) => {
          const asset = assets.get(id);
          if (!asset) return;
          const captions = await generateCaptions(asset.file, options);
          setAssets(prev => {
            const newAssets = new Map(prev);
            const updatedAsset = newAssets.get(id);
            if (updatedAsset) {
              newAssets.set(id, { ...updatedAsset, captions });
            }
            return newAssets;
          });
        })
      );
    // FIX: Catch error as `unknown` for type safety and check if it's an Error instance before accessing properties.
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to generate captions. Please check your API key and try again.';
        setError(errorMessage);
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  }, [assets]);

  const handleCaptionUpdate = useCallback((assetId: string, captionType: keyof GeneratedCaptions, newText: string) => {
    setAssets(prev => {
        const newAssets = new Map(prev);
        const asset = newAssets.get(assetId);
        if (asset && asset.captions) {
            // FIX: Explicitly create new objects for captions to avoid potential type inference issues
            // with nested spreads inside dynamically keyed properties, which can cause spread errors.
            const updatedCaptionPart = {
                ...asset.captions[captionType],
                text: newText,
            };
            const updatedCaptions = {
                ...asset.captions,
                [captionType]: updatedCaptionPart,
            };
            newAssets.set(assetId, { ...asset, captions: updatedCaptions });
        }
        return newAssets;
    });
  }, []);

  const selectedAssets = useMemo(() => {
    return Array.from(selectedAssetIds).map(id => assets.get(id)).filter(Boolean) as Asset[];
  }, [selectedAssetIds, assets]);

  const activeAsset = useMemo(() => {
    return activeAssetId ? assets.get(activeAssetId) : null;
  }, [activeAssetId, assets]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
        <h1 className="text-xl font-bold tracking-tight">Kipton AI</h1>
        <div className="text-sm text-gray-400">Caption Video & Image Pro</div>
      </header>
      
      {error && (
        <div className="bg-red-500 text-white p-3 text-center text-sm">
            {error} <button onClick={() => setError(null)} className="font-bold ml-4">Dismiss</button>
        </div>
      )}

      <main className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-px overflow-hidden">
        <aside className="md:col-span-4 lg:col-span-3 xl:col-span-3 bg-gray-800/50 overflow-y-auto">
          <AssetPanel 
            assets={Array.from(assets.values())} 
            selectedAssetIds={selectedAssetIds}
            activeAssetId={activeAssetId}
            onFileUploads={handleFileUploads}
            onSelectionChange={handleSelectionChange}
          />
        </aside>
        <section className="md:col-span-8 lg:col-span-9 xl:col-span-9 bg-gray-900 overflow-y-auto">
          <CaptionPanel
            key={activeAssetId}
            selectedAssets={selectedAssets}
            activeAsset={activeAsset}
            onGenerate={handleGenerate}
            onCaptionUpdate={handleCaptionUpdate}
            isLoading={isLoading}
          />
        </section>
      </main>
    </div>
  );
};

export default App;
