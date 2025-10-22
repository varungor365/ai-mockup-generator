import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import type { DesignFile, DesignTransform } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';

interface RealtimeConfiguratorProps {
    designFile: DesignFile | null;
    tshirtColor: string;
    onTransformChange: (transform: DesignTransform) => void;
    transform?: DesignTransform;
}

const RealtimeConfigurator: React.FC<RealtimeConfiguratorProps> = ({ designFile, tshirtColor, onTransformChange, transform }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const modelUrl = 'https://raw.githubusercontent.com/emilyxxie/3d_tshirt_configurator/main/public/shirt_baked.glb';
    const hdriUrl = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/venice_sunset_1k.hdr';
    
    // Refs for Three.js objects to persist across re-renders
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const tshirtMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
    const designPlaneRef = useRef<THREE.Mesh | null>(null);
    const transformControlsRef = useRef<any>(null); // Using 'any' for simplicity as TransformControls is not in default three types
    const textureLoaderRef = useRef(new THREE.TextureLoader());


    // Effect for initializing the 3D scene
    useEffect(() => {
        if (!mountRef.current) return;
        const currentMount = mountRef.current;
        let animationFrameId: number;

        const init = () => {
            // Scene
            const scene = new THREE.Scene();
            sceneRef.current = scene;
            scene.background = new THREE.Color(0x111827);

            // Camera
            const camera = new THREE.PerspectiveCamera(50, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
            camera.position.set(0, 0, 2);
            cameraRef.current = camera;
            
            // Renderer
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.outputEncoding = THREE.sRGBEncoding;
            rendererRef.current = renderer;
            currentMount.appendChild(renderer.domElement);

            // Controls
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.minDistance = 1;
            controls.maxDistance = 5;
            controlsRef.current = controls;
            
            // Lighting (HDRI)
            new RGBELoader().load(hdriUrl, (texture) => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                scene.environment = texture;
            }, undefined, () => setError("Failed to load lighting environment."));

            // Load 3D Model
            const loader = new GLTFLoader();
            loader.load(modelUrl, (gltf) => {
                const model = gltf.scene;
                model.scale.setScalar(15);
                model.position.y = -0.7;
                
                model.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        const material = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(tshirtColor),
                            roughness: 1,
                            metalness: 0,
                            envMapIntensity: 0.5,
                        });
                        child.material = material;
                        tshirtMaterialRef.current = material;
                    }
                });
                scene.add(model);
                
                // Design Plane (Decal)
                const planeGeometry = new THREE.PlaneGeometry(1, 1);
                const planeMaterial = new THREE.MeshStandardMaterial({
                    transparent: true,
                    opacity: 1,
                    map: new THREE.Texture(), // Start with empty texture
                    side: THREE.DoubleSide,
                    polygonOffset: true, // Prevent z-fighting
                    polygonOffsetFactor: -4,
                });

                const designPlane = new THREE.Mesh(planeGeometry, planeMaterial);
                designPlane.position.z = 0.22; // Position it slightly in front of the shirt
                designPlaneRef.current = designPlane;
                scene.add(designPlane);
                
                setIsLoading(false);

            }, undefined, () => setError("An error happened while loading the 3D model. Please try refreshing."));

            const animate = () => {
                animationFrameId = requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            };
            animate();
        };

        init();

        const handleResize = () => {
            if (!rendererRef.current || !cameraRef.current || !mountRef.current) return;
            const { clientWidth, clientHeight } = mountRef.current;
            rendererRef.current.setSize(clientWidth, clientHeight);
            cameraRef.current.aspect = clientWidth / clientHeight;
            cameraRef.current.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
            if (currentMount && rendererRef.current?.domElement) {
                currentMount.removeChild(rendererRef.current.domElement);
            }
            // Dispose of Three.js objects
            sceneRef.current?.traverse(object => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        };
    }, []);
    
    // Effect to update T-shirt color
    useEffect(() => {
        if (tshirtMaterialRef.current) {
            tshirtMaterialRef.current.color.set(tshirtColor);
        }
    }, [tshirtColor]);

    // Effect to update design texture
    useEffect(() => {
        if (designPlaneRef.current && designFile?.previewUrl) {
            textureLoaderRef.current.load(designFile.previewUrl, (texture) => {
                texture.encoding = THREE.sRGBEncoding;
                texture.anisotropy = 16;
                const material = designPlaneRef.current?.material as THREE.MeshStandardMaterial;
                material.map = texture;
                material.needsUpdate = true;
            }, undefined, () => setError("Failed to load design texture."));
        }
    }, [designFile]);

    // Effect to update design transform from external controls (sliders)
    useEffect(() => {
        if (designPlaneRef.current && transform) {
            const { position, scale, rotation } = transform;
            designPlaneRef.current.position.x = (position.x - 0.5) * 0.7; // Map 0-1 range to an appropriate 3D space range
            designPlaneRef.current.position.y = -(position.y - 0.5) * 1.5;
            designPlaneRef.current.scale.set(scale * 0.5, scale * 0.5, 1);
            designPlaneRef.current.rotation.z = THREE.MathUtils.degToRad(rotation);
        }
    }, [transform]);

    return (
        <div className="w-full h-full aspect-square lg:aspect-[4/3] bg-gray-800 rounded-lg relative">
            {(isLoading || error) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50 z-10">
                    {isLoading ? <SpinnerIcon /> : null}
                    <p className={`ml-4 ${error ? 'text-red-400' : ''}`}>
                        {error ? error : 'Loading 3D Model...'}
                    </p>
                </div>
            )}
            <div ref={mountRef} className="w-full h-full"></div>
             {!isLoading && (
                <div className="absolute bottom-4 left-4 text-xs text-gray-400 p-2 bg-black/30 rounded">
                    Orbit: Click & Drag | Zoom: Scroll
                </div>
            )}
        </div>
    );
};

export default RealtimeConfigurator;