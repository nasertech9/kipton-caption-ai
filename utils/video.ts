
// A Blob has no filename, so we need to add it
export function fileToGenerativePart(file: File) {
    return new Promise<{ inlineData: { data: string; mimeType: string; }; }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                // remove the header from the base64 string
                const base64Data = reader.result.split(',')[1];
                resolve({
                    inlineData: {
                        data: base64Data,
                        mimeType: file.type,
                    },
                });
            } else {
                reject(new Error("Failed to read file as base64 string"));
            }
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsDataURL(file);
    });
}

export function getVideoPoster(file: File, returnBase64: boolean = false): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.crossOrigin = 'anonymous';
    
    video.onloadeddata = () => {
      video.currentTime = 1; // seek to 1 second
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      URL.revokeObjectURL(video.src);
      
      if (returnBase64) {
          resolve(dataUrl.split(',')[1]); // return only the base64 part
      } else {
          resolve(dataUrl);
      }
    };

    video.onerror = (e) => {
      reject(e);
      URL.revokeObjectURL(video.src);
    };
  });
}
