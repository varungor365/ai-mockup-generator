import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { MockupOptions, DesignFile, EcommerceKitResult, TryOnOptions } from '../types';

// FIX: The global `window.aistudio` is assumed to be defined by the execution environment.
// The local declaration was removed to resolve a conflict with the globally provided type.

// A single GoogleGenAI instance for most calls
let ai: GoogleGenAI;
const getAiInstance = () => {
    if (!ai) {
        if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set");
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};

// A separate, on-demand instance for Veo models which require special key handling
const getVeoAiInstance = () => {
    if (!process.env.API_KEY) throw new Error("API_KEY environment variable not set");
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const imageModel = 'gemini-2.5-flash-image';
const textModel = 'gemini-2.5-flash';
const advancedTextModel = 'gemini-2.5-pro';
const videoModel = 'veo-3.1-fast-generate-preview';

function createPrompt(options: MockupOptions): string {
    const { color, fit, mockupType, gender, angle, background, artStyle, placement, scale, texture, sceneAdditions, customBackground, modelAppearance, designTransform } = options;

    const angleText = `The camera view is showing the ${angle} of the t-shirt.`;
    const colorText = color.type === 'gradient' ? `a t-shirt with a ${color.name} color scheme` : `a ${color.name} t-shirt`;
    const backgroundDesc = background === 'Custom Prompt...' && customBackground ? customBackground : background;
    
    let designDetails: string;
    if (placement === 'custom' && designTransform) {
        designDetails = `The user-provided design is placed precisely on the shirt. The placement is custom: position the center of the graphic at ${Math.round(designTransform.position.x * 100)}% from the left and ${Math.round(designTransform.position.y * 100)}% from the top of the printable area. The graphic should be scaled to ${Math.round(designTransform.scale * 100)}% of the printable area width, and rotated by ${designTransform.rotation} degrees.`;
    } else {
       designDetails = `The user-provided design is placed on the ${placement}. The graphic should appear at a ${scale} size relative to the shirt.`;
    }

    let basePrompt = `Create a high-resolution, 4K, ${artStyle} fashion mockup. The mockup must feature a ${colorText} with a ${fit} fit. The fabric should look like realistic ${texture}. ${designDetails}`;
    
    if (artStyle === 'vintage') basePrompt += ' The image should have a nostalgic, vintage film aesthetic with subtle grain and desaturated tones.';
    if (artStyle === 'cinematic') basePrompt += ' The image should have a cinematic look with dramatic lighting, shallow depth of field, and a professional color grade.';
    if (artStyle === 'grungy') basePrompt += ' The image should have a gritty, urban, grungy aesthetic with high contrast and texture.';

    let stylePrompt: string;
    if (mockupType === 'fullBody') {
        let modelDescription = gender === 'any' ? 'model (male or female)' : `${gender} model`;
        if (modelAppearance) {
            modelDescription += ` described as: "${modelAppearance}"`;
        }
        
        stylePrompt = `The t-shirt is worn by a photorealistic ${modelDescription} with a natural, confident pose. ${angleText} The background is: "${backgroundDesc}". The lighting must be professional and flattering, matching the art style and background.`;
        if (sceneAdditions) {
            stylePrompt += ` The scene also includes the following elements: "${sceneAdditions}".`;
        }
    } else {
        stylePrompt = `The t-shirt should be presented as a high-quality product shot, such as a "flat lay" on a clean, textured surface or on a minimalistic hanger. ${angleText} The background should match the '${backgroundDesc}' theme and '${artStyle}' style. The lighting must be professional studio quality.`;
    }

    const finalPrompt = `The final image must look like a professional photograph from a high-end fashion lookbook or e-commerce store. Do not add any text, logos, or watermarks to the image.`;

    return `${basePrompt} ${stylePrompt} ${finalPrompt}`;
}


const callImageGenerationAPI = async (contents: { parts: any[] }) => {
     try {
        const response = await getAiInstance().models.generateContent({
            model: imageModel,
            contents,
            config: { responseModalities: [Modality.IMAGE] },
        });

        const firstPart = response.candidates?.[0]?.content?.parts?.[0];
        if (firstPart && 'inlineData' in firstPart && firstPart.inlineData) {
            return `data:${firstPart.inlineData.mimeType};base64,${firstPart.inlineData.data}`;
        }
        throw new Error(response.text || 'No image was generated.');
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error(`Failed to generate image. Reason: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}

export const generateMockup = (options: MockupOptions, design: DesignFile): Promise<string> => {
    const prompt = createPrompt(options);
    const imagePart = { inlineData: { data: design.base64, mimeType: design.mimeType } };
    const textPart = { text: prompt };
    return callImageGenerationAPI({ parts: [imagePart, textPart] });
};

export const generateVirtualTryOn = (userPhoto: DesignFile, design: DesignFile, options: TryOnOptions): Promise<string> => {
    const { clothingType, color } = options;
    const colorText = color.type === 'gradient' ? `a t-shirt with a ${color.name} color scheme` : `a ${color.name} t-shirt`;

    const prompt = `
        **TASK: VIRTUAL TRY-ON**
        You are an expert at creating realistic virtual try-on images.
        1.  **Analyze the primary input image:** This is a photo of a person.
        2.  **Identify the clothing:** The user has specified they are wearing a '${clothingType}'.
        3.  **Use the secondary input image:** This is a graphic design.
        4.  **Your goal:** Realistically replace the '${clothingType}' the person is wearing with a new, photorealistic ${colorText}.
        5.  **Apply the design:** Place the provided graphic design from the second image onto the chest of the new t-shirt. Ensure it conforms to the fabric's folds and shape.

        **CRITICAL RULES:**
        -   **DO NOT CHANGE THE PERSON:** The person's face, hair, body shape, pose, and skin tone must remain exactly the same as in the original photo.
        -   **DO NOT CHANGE THE BACKGROUND:** The background of the original photo must be perfectly preserved.
        -   **SEAMLESS INTEGRATION:** The new t-shirt must blend seamlessly with the original image, perfectly matching the lighting, shadows, and perspective of the original photo.
        -   The final output must be a high-resolution, photorealistic image that looks like a real photo of the person wearing the new t-shirt.
    `;

    const userPhotoPart = { inlineData: { data: userPhoto.base64, mimeType: userPhoto.mimeType } };
    const designPart = { inlineData: { data: design.base64, mimeType: design.mimeType } };
    const textPart = { text: prompt };

    return callImageGenerationAPI({ parts: [userPhotoPart, designPart, textPart] });
};


export const generate360View = (options: MockupOptions, design: DesignFile): Promise<string[]> => {
    const angles: MockupOptions['angle'][] = ['front', 'back', 'left side', 'right side'];
    const promises = angles.map(angle => generateMockup({ ...options, angle }, design));
    return Promise.all(promises);
};

export const editMockup = (originalMockup: DesignFile, editPrompt: string): Promise<string> => {
    const imagePart = { inlineData: { data: originalMockup.base64, mimeType: originalMockup.mimeType } };
    const textPart = { text: `Edit the provided image based on this instruction: "${editPrompt}". Maintain the original style and quality.` };
    return callImageGenerationAPI({ parts: [imagePart, textPart] });
};

export const upscaleImage = (originalMockup: DesignFile): Promise<string> => {
    const imagePart = { inlineData: { data: originalMockup.base64, mimeType: originalMockup.mimeType } };
    const textPart = { text: `Upscale this image to 4x its original resolution. Enhance details, sharpness, and clarity while maintaining photorealism. Do not add or change any content.` };
    return callImageGenerationAPI({ parts: [imagePart, textPart] });
};

export const generateTshirtDesign = (prompt: string): Promise<string> => {
    const fullPrompt = `Generate a t-shirt graphic based on the following description: "${prompt}". The design must be isolated on a transparent background. The output should be a high-quality PNG format graphic suitable for printing. Do not include a t-shirt, only the graphic itself.`;
    return callImageGenerationAPI({ parts: [{ text: fullPrompt }] });
}

export const removeDesignBackground = (design: DesignFile): Promise<string> => {
    const imagePart = { inlineData: { data: design.base64, mimeType: design.mimeType } };
    const textPart = { text: "Analyze this image and accurately isolate the main subject. Remove the background entirely, making it transparent. The output must be a PNG with a transparent background." };
    return callImageGenerationAPI({ parts: [imagePart, textPart] });
};

export const suggestColors = async (design: DesignFile, colorNames: string[]): Promise<string[]> => {
    const prompt = `Analyze the provided image and determine the 3 best complementary T-shirt colors from this list: ${colorNames.join(', ')}. Consider color theory and aesthetic harmony.`;
    const imagePart = { inlineData: { data: design.base64, mimeType: design.mimeType } };
    
    try {
        const response = await getAiInstance().models.generateContent({
            model: textModel,
            contents: { parts: [{ text: prompt }, imagePart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { suggested_colors: { type: Type.ARRAY, items: { type: Type.STRING } } }
                }
            }
        });
        return JSON.parse(response.text).suggested_colors || [];
    } catch (error) {
        console.error("Error suggesting colors:", error);
        return [];
    }
};

export const generateEcommerceKit = async (design: DesignFile): Promise<EcommerceKitResult> => {
    const designPart = { inlineData: { data: design.base64, mimeType: design.mimeType } };
    const prompt = `Analyze this T-shirt design. Generate a complete e-commerce and marketing kit with the following structure:
    1.  **title**: A creative, catchy product title (5-8 words).
    2.  **description**: A compelling e-commerce product description (60-80 words), highlighting the design's style and appeal. Use paragraphs.
    3.  **socialCaption**: A short, engaging Instagram caption (20-30 words).
    4.  **tags**: A list of 10-15 relevant, high-traffic hashtags.`;

    try {
        const response = await getAiInstance().models.generateContent({
            model: advancedTextModel,
            contents: { parts: [{ text: prompt }, designPart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        socialCaption: { type: Type.STRING },
                        tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating e-commerce kit:", error);
        throw new Error("Failed to generate AI content.");
    }
};

export const generateVideoMockup = async (options: MockupOptions, design: DesignFile): Promise<string> => {
    // 1. Check for Veo API key and prompt user if needed
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
        await window.aistudio.openSelectKey();
    }
    
    // 2. Create a fresh instance of the AI client to ensure the latest key is used
    const veoAI = getVeoAiInstance();

    // 3. Generate a descriptive prompt for the video
    const { gender, fit, color, background } = options;
    const genderText = gender === 'any' ? 'A model' : `A ${gender} model`;
    const prompt = `${genderText} wearing a ${color.name} ${fit} t-shirt with the provided design on the chest. The model makes a subtle, natural movement like turning slightly or adjusting their shirt. The background is a ${background}. The style is photorealistic and cinematic.`;
    
    // 4. Start the video generation operation
    let operation = await veoAI.models.generateVideos({
        model: videoModel,
        prompt,
        image: { imageBytes: design.base64, mimeType: design.mimeType },
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '9:16' }
    });

    // 5. Poll for completion
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        operation = await veoAI.operations.getVideosOperation({ operation: operation });
    }

    // 6. Get the download link and fetch the video blob
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation completed but no download link was found.");
    }
    
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
        throw new Error(`Failed to download the generated video. Status: ${videoResponse.statusText}`);
    }
    const videoBlob = await videoResponse.blob();
    
    // 7. Convert blob to a data URL to display in the browser
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(videoBlob);
    });
};