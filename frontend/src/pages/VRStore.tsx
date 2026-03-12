import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, PointerLockControls, Loader, KeyboardControls } from '@react-three/drei';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setVRZone } from '../store/uiSlice';
import VRScene from '../components/VRStore/VRScene';
import ChatWindow from '../components/Chatbot/ChatWindow';
import EmotionDetector from '../components/EmotionDetector/EmotionDetector';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import MiniMap from '../components/VRStore/MiniMap';

/**
 * VRStore Page: The main entry point for the 3D experience.
 * Manages the R3F Canvas, keyboard controls mapping, and 2D HUD overlays.
 */
export default function VRStore() {
    const dispatch = useDispatch();
    const { vrZone } = useSelector((state: RootState) => state.ui);

    // Keyboard map for WASD controls
    const map = [
        { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
        { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
        { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
        { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
        { name: 'jump', keys: ['Space'] },
    ];

    return (
        <div className="vr-canvas-container bg-[#050510]">
            <KeyboardControls map={map}>
                <Canvas
                    shadows
                    camera={{ fov: 45, position: [0, 5, 10] }}
                    gl={{ antialias: true, alpha: false }}
                >
                    <Suspense fallback={null}>
                        <Sky sunPosition={[100, 20, 100]} />
                        <ambientLight intensity={0.5} />
                        <pointLight position={[10, 10, 10]} castShadow intensity={1} />

                        <VRScene />

                        <PointerLockControls />
                    </Suspense>
                </Canvas>
            </KeyboardControls>

            {/* HUD Overlays */}
            <div className="vr-hud">
                {/* Top Left: Zone Indicator */}
                <div className="absolute top-6 left-6 p-4 glass-card border-l-4 border-l-highlight">
                    <p className="text-[10px] font-heading text-white/40 uppercase tracking-widest leading-none mb-1">Current Sector</p>
                    <h2 className="text-xl font-black font-heading text-white capitalize">{vrZone}</h2>
                </div>

                {/* Top Right: MiniMap */}
                <div className="absolute top-6 right-6">
                    <MiniMap />
                </div>

                {/* Bottom Left: Emotion Mirror */}
                <EmotionDetector />

                {/* Interaction Crosshair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-2 border-highlight/50 rounded-full flex items-center justify-center pointer-events-none">
                    <div className="w-1 h-1 bg-highlight rounded-full" />
                </div>

                {/* Controls Hint */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 glass-card rounded-full text-[10px] text-white/50 font-heading uppercase tracking-widest flex gap-6">
                    <span>WASD : Move</span>
                    <span>Space : Jump</span>
                    <span>Click : Pointer Lock</span>
                    <span>Esc : Release</span>
                </div>
            </div>

            <Loader />
        </div>
    );
}
