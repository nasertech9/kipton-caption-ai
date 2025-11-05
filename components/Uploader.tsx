
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './icons';

interface UploaderProps {
  onFileUploads: (files: File[]) => void;
}

const validFileTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];

export const Uploader: React.FC<UploaderProps> = ({ onFileUploads }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((incomingFiles: FileList | null) => {
    if (!incomingFiles) return;
    const files = Array.from(incomingFiles).filter(file => validFileTypes.includes(file.type));
    if (files.length > 0) {
      onFileUploads(files);
    }
  }, [onFileUploads]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
        if(items[i].kind === 'file' && validFileTypes.includes(items[i].type)) {
            const file = items[i].getAsFile();
            if (file) {
                files.push(file);
            }
        }
    }
    if (files.length > 0) {
        onFileUploads(files);
    }
  }, [onFileUploads]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onPaste={handlePaste}
      tabIndex={0}
      className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-gray-700/50' : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/30'}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        className="hidden"
        multiple
        accept={validFileTypes.join(',')}
      />
      <UploadIcon className="w-8 h-8 text-gray-400 mb-2"/>
      <p className="text-sm text-center text-gray-400">
        <span className="font-semibold text-blue-400">Click to upload</span>, drag & drop, or paste
      </p>
      <p className="text-xs text-gray-500 text-center mt-1">Images or Videos (MP4, WEBM)</p>
    </div>
  );
};
