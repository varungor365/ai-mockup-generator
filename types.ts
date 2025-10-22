export type ColorOption = {
  name: string;
  value: string; // hex code or css gradient
  type: 'solid' | 'gradient';
};

export type Fit = 'regular' | 'oversized';
export type MockupType = 'fullBody' | 'tshirtOnly';
export type Gender = 'male' | 'female' | 'any';
export type Angle = 'front' | 'back' | 'left side' | 'right side';
export type Background = string; // Will use names from constants
export type ArtStyle = 'photorealistic' | 'vintage' | 'cinematic' | 'minimalist' | 'grungy';
export type DesignPlacement = 'center chest' | 'left chest (pocket)' | 'large graphic' | 'custom';
export type DesignScale = 'small' | 'medium' | 'large' | 'custom';
export type FabricTexture = 'standard cotton' | 'heavyweight cotton' | 'heather blend' | 'tri-blend jersey';
export type AppMode = 'ai_models' | 'virtual_try_on' | 'realtime_configurator';

export interface DesignTransform {
    position: { x: number, y: number }; // As a percentage of the texture area
    scale: number; // Multiplier
    rotation: number; // In degrees
}

export interface Template {
    name: string;
    description: string;
    options: Omit<MockupOptions, 'template'>;
}

export interface MockupOptions {
  color: ColorOption;
  fit: Fit;
  mockupType: MockupType;
  gender: Gender;
  angle: Angle;
  background: Background;
  artStyle: ArtStyle;
  placement: DesignPlacement;
  scale: DesignScale;
  texture: FabricTexture;
  sceneAdditions: string;
  modelAppearance: string;
  customBackground?: string;
  designTransform?: DesignTransform;
}

export interface TryOnOptions {
    clothingType: string;
    color: ColorOption;
}

export interface DesignFile {
  base64: string;
  mimeType: string;
  previewUrl: string;
}

export interface HistoryItem {
  id: number;
  image: string;
  options: MockupOptions;
}

export interface UserPreset {
  name: string;
  options: MockupOptions;
}

export interface EcommerceKitResult {
  title: string;
  description: string;
  socialCaption: string;
  tags: string[];
}

export interface BrandKit {
  logo: string | null;
  applyWatermark: boolean;
}