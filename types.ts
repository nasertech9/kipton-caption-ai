
export type AssetType = 'image' | 'video';

export interface Caption {
  id: string;
  text: string;
}

export interface GeneratedCaptions {
  short: Caption;
  long: Caption;
  hashtags: Caption;
  seoTitle: Caption;
}

export interface Asset {
  id: string;
  file: File;
  previewUrl: string;
  type: AssetType;
  poster?: string;
  captions: GeneratedCaptions | null;
}

export interface CaptionOptions {
  tone: 'Friendly' | 'Professional' | 'Witty' | 'Casual' | 'Inspirational';
  length: 'Short' | 'Medium' | 'Long';
  language: string;
  includeHashtags: boolean;
}
