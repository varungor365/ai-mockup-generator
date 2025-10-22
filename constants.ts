import type { ColorOption, Template, Background, ArtStyle, FabricTexture, DesignPlacement, DesignScale, MockupOptions } from './types';

export const TSHIRT_COLORS: ColorOption[] = [
  { name: 'White', value: '#FFFFFF', type: 'solid' },
  { name: 'Black', value: '#111827', type: 'solid' },
  { name: 'Heather Grey', value: '#B2B2B2', type: 'solid' },
  { name: 'Navy', value: '#0a1d3e', type: 'solid' },
  { name: 'Red', value: '#B91C1C', type: 'solid' },
  { name: 'Royal Blue', value: '#2563EB', type: 'solid' },
  { name: 'Forest Green', value: '#166534', type: 'solid' },
  { name: 'Charcoal', value: '#374151', type: 'solid' },
  { name: 'Sunset', value: 'linear-gradient(to right, #ff7e5f, #feb47b)', type: 'gradient' },
  { name: 'Ocean', value: 'linear-gradient(to right, #2c3e50, #4ca1af)', type: 'gradient' },
  { name: 'Twilight', value: 'linear-gradient(to right, #0f2027, #203a43, #2c5364)', type: 'gradient' },
];

export const ART_STYLES: { name: string, value: ArtStyle }[] = [
    { name: 'Photorealistic', value: 'photorealistic' },
    { name: 'Vintage Film', value: 'vintage' },
    { name: 'Cinematic', value: 'cinematic' },
    { name: 'Minimalist', value: 'minimalist' },
    { name: 'Grungy', value: 'grungy' },
];

export const FABRIC_TEXTURES: { name: string, value: FabricTexture }[] = [
    { name: 'Standard Cotton', value: 'standard cotton' },
    { name: 'Heavyweight Cotton', value: 'heavyweight cotton' },
    { name: 'Heather Blend', value: 'heather blend' },
    { name: 'Tri-blend Jersey', value: 'tri-blend jersey' },
];

export const DESIGN_PLACEMENTS: { name: string, value: DesignPlacement }[] = [
    { name: 'Center Chest', value: 'center chest' },
    { name: 'Left Chest (Pocket)', value: 'left chest (pocket)' },
    { name: 'Large Graphic', value: 'large graphic' },
    { name: 'Custom', value: 'custom' },
];

export const DESIGN_SCALES: { name: string, value: DesignScale }[] = [
    { name: 'Small', value: 'small' },
    { name: 'Medium', value: 'medium' },
    { name: 'Large', value: 'large' },
    { name: 'Custom', value: 'custom' },
];

export const CUSTOM_BACKGROUND_PROMPT = 'Custom Prompt...';

export const BACKGROUNDS: Background[] = [
    'Minimalist Studio (White)',
    'Urban Street',
    'City Rooftop at Dusk',
    'Sun-drenched Beach',
    'Modern Interior',
    'Nature Trail',
    'Dark Abstract Texture',
    CUSTOM_BACKGROUND_PROMPT,
];

const defaultOptions: MockupOptions = {
    color: TSHIRT_COLORS[0],
    fit: 'regular',
    mockupType: 'fullBody',
    gender: 'any',
    angle: 'front',
    background: BACKGROUNDS[0],
    artStyle: 'photorealistic',
    placement: 'center chest',
    scale: 'medium',
    texture: 'standard cotton',
    sceneAdditions: '',
    modelAppearance: '',
    designTransform: {
        position: { x: 0.5, y: 0.5 },
        scale: 0.25,
        rotation: 0
    },
};

export const TEMPLATES: Template[] = [
    {
        name: 'Studio Minimal (Default)',
        description: 'Clean and professional.',
        options: {
            ...defaultOptions
        }
    },
    {
        name: 'Streetwear Vibe',
        description: 'Modern and urban style.',
        options: {
            ...defaultOptions,
            color: TSHIRT_COLORS[1],
            fit: 'oversized',
            gender: 'male',
            background: BACKGROUNDS[1],
            artStyle: 'grungy',
            placement: 'large graphic',
            scale: 'large',
            texture: 'heavyweight cotton',
            modelAppearance: 'male model with a confident, urban style',
            designTransform: {
                position: { x: 0.5, y: 0.5 },
                scale: 0.4,
                rotation: 0
            },
        }
    },
    {
        name: 'Product Flatlay',
        description: 'For e-commerce stores.',
        options: {
            ...defaultOptions,
            color: TSHIRT_COLORS[2],
            mockupType: 'tshirtOnly',
            background: BACKGROUNDS[6],
            artStyle: 'minimalist',
            modelAppearance: '',
            designTransform: {
                position: { x: 0.5, y: 0.5 },
                scale: 0.3,
                rotation: 0
            },
        }
    },
];