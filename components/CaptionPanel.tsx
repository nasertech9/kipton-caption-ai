
import React, { useState } from 'react';
import { Asset, CaptionOptions, GeneratedCaptions } from '../types';
// FIX: Removed LinkIcon as it's not exported from icons.tsx
import { CopyIcon, DownloadIcon, SparklesIcon, TextIcon, TitleIcon, HashtagIcon } from './icons';

interface CaptionPanelProps {
    selectedAssets: Asset[];
    activeAsset: Asset | null;
    onGenerate: (assetIds: string[], options: CaptionOptions) => Promise<void>;
    onCaptionUpdate: (assetId: string, captionType: keyof GeneratedCaptions, newText: string) => void;
    isLoading: boolean;
}

const CaptionEditor: React.FC<{ icon: React.ReactNode, label: string, value: string, onChange: (value: string) => void, placeholder: string }> = ({ icon, label, value, onChange, placeholder }) => (
    <div>
        <label className="flex items-center text-sm font-medium text-gray-400 mb-1">
            {icon}
            <span className="ml-2">{label}</span>
        </label>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-24 p-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
        />
    </div>
);

export const CaptionPanel: React.FC<CaptionPanelProps> = ({ selectedAssets, activeAsset, onGenerate, onCaptionUpdate, isLoading }) => {
    const [options, setOptions] = useState<CaptionOptions>({
        tone: 'Friendly',
        length: 'Medium',
        language: 'English',
        includeHashtags: true,
    });

    const handleGenerateClick = () => {
        const ids = selectedAssets.map(a => a.id);
        if (ids.length > 0) {
            onGenerate(ids, options);
        }
    };
    
    if (!activeAsset) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500 p-8 text-center">
                <p>Select an asset on the left to start generating captions.</p>
            </div>
        );
    }

    const { captions } = activeAsset;

    const copyAllToClipboard = () => {
        if (!captions) return;
        const textToCopy = `
SEO Title: ${captions.seoTitle.text}

Short Caption:
${captions.short.text}

Long Caption:
${captions.long.text}

Hashtags:
${captions.hashtags.text}
        `.trim();
        navigator.clipboard.writeText(textToCopy);
    };

    const downloadTxtFile = () => {
        if (!captions) return;
         const textToCopy = `
SEO Title: ${captions.seoTitle.text}

Short Caption:
${captions.short.text}

Long Caption:
${captions.long.text}

Hashtags:
${captions.hashtags.text}
        `.trim();
        const blob = new Blob([textToCopy], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeAsset.file.name.split('.')[0]}_captions.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    return (
        <div className="p-6 h-full flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/3 flex flex-col gap-6">
                {/* Preview */}
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-800">
                    {activeAsset.type === 'image' ? (
                        <img src={activeAsset.previewUrl} alt={activeAsset.file.name} className="w-full h-full object-contain" />
                    ) : (
                        <video controls src={activeAsset.previewUrl} poster={activeAsset.poster} className="w-full h-full object-contain" />
                    )}
                </div>
                {/* Options */}
                 <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Generation Options</h2>
                     {selectedAssets.length > 1 && (
                        <div className="p-3 bg-blue-900/50 border border-blue-700 rounded-md text-sm text-blue-200">
                            {selectedAssets.length} assets selected. Captions will be generated for all.
                        </div>
                    )}
                    <div>
                        <label htmlFor="tone" className="block text-sm font-medium text-gray-400">Tone</label>
                        <select id="tone" value={options.tone} onChange={(e) => setOptions(o => ({ ...o, tone: e.target.value as CaptionOptions['tone'] }))} className="mt-1 block w-full pl-3 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            {['Friendly', 'Professional', 'Witty', 'Casual', 'Inspirational'].map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="length" className="block text-sm font-medium text-gray-400">Length</label>
                        <select id="length" value={options.length} onChange={(e) => setOptions(o => ({ ...o, length: e.target.value as CaptionOptions['length'] }))} className="mt-1 block w-full pl-3 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            {['Short', 'Medium', 'Long'].map(l => <option key={l}>{l}</option>)}
                        </select>
                    </div>
                     <button onClick={handleGenerateClick} disabled={isLoading} className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all">
                        {isLoading ? (
                           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                        ) : (
                           <SparklesIcon className="w-5 h-5 mr-2" />
                        )}
                        {isLoading ? 'Generating...' : `Generate Captions (${selectedAssets.length})`}
                    </button>
                </div>
            </div>
            {/* Captions */}
            <div className="lg:w-2/3 flex-grow flex flex-col">
                {captions ? (
                    <div className="space-y-4 flex-grow">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold">Generated Captions</h2>
                             <div className="flex items-center space-x-2">
                                <button onClick={copyAllToClipboard} className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors" title="Copy All"><CopyIcon className="w-4 h-4"/></button>
                                <button onClick={downloadTxtFile} className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors" title="Download .txt"><DownloadIcon className="w-4 h-4"/></button>
                            </div>
                        </div>

                        <CaptionEditor icon={<TitleIcon />} label="SEO Title" value={captions.seoTitle.text} onChange={(val) => onCaptionUpdate(activeAsset.id, 'seoTitle', val)} placeholder="Enter SEO Title..."/>
                        <CaptionEditor icon={<TextIcon />} label="Short Caption" value={captions.short.text} onChange={(val) => onCaptionUpdate(activeAsset.id, 'short', val)} placeholder="Enter short caption..."/>
                        <CaptionEditor icon={<TextIcon />} label="Long Caption" value={captions.long.text} onChange={(val) => onCaptionUpdate(activeAsset.id, 'long', val)} placeholder="Enter long caption..."/>
                        <CaptionEditor icon={<HashtagIcon />} label="Hashtags" value={captions.hashtags.text} onChange={(val) => onCaptionUpdate(activeAsset.id, 'hashtags', val)} placeholder="#enter #hashtags..."/>
                    </div>
                ) : (
                    <div className="flex-grow flex items-center justify-center bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700 text-gray-500 text-center p-8">
                       {isLoading ? 'Generating captions, please wait...' : 'Your generated captions will appear here after you click "Generate".'}
                    </div>
                )}
            </div>
        </div>
    );
};
