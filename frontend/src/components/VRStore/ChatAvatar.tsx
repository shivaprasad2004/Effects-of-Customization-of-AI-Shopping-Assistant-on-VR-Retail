import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Html, Text, Box } from '@react-three/drei';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { toggleChatbot } from '../../store/chatbotSlice';
import * as THREE from 'three';

/**
 * ChatAvatar: A 3D representation of the AI assistant in the VR Store.
 * Floating, animated, and interactive.
 */
export default function ChatAvatar() {
    const dispatch = useDispatch();
    const { isTyping, isOpen } = useSelector((state: RootState) => state.chatbot);
    const [hovered, setHovered] = useState(false);
    const meshRef = useRef<THREE.Group>(null);

    // Animation loop for subtle rotation and floating
    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.getElapsedTime();
        meshRef.current.rotation.y = Math.sin(t * 0.5) * 0.2;
        meshRef.current.position.y = 1.5 + Math.sin(t * 2) * 0.1;
    });

    return (
        <group position={[0, 1.5, -5]} ref={meshRef}>
            {/* Interactive hit area */}
            <mesh 
                onPointerOver={() => setHovered(true)} 
                onPointerOut={() => setHovered(false)}
                onClick={() => dispatch(toggleChatbot())}
                visible={false}
            >
                <sphereGeometry args={[1.5]} />
            </mesh>

            {/* Avatar Body: A futuristic floating orb/robot */}
            <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                {/* Core Orb */}
                <Sphere args={[0.6, 64, 64]}>
                    <MeshDistortMaterial
                        color={isTyping ? "#FF3366" : hovered ? "#00D2FF" : "#A855F7"}
                        speed={isTyping ? 5 : 2}
                        distort={isTyping ? 0.6 : 0.3}
                        roughness={0}
                        metalness={1}
                    />
                </Sphere>

                {/* Floating "Eyes" or Sensors */}
                <group position={[0, 0.1, 0.5]}>
                    <Box args={[0.1, 0.05, 0.05]} position={[-0.15, 0, 0]}>
                        <meshStandardMaterial color="white" emissive="#00D2FF" emissiveIntensity={2} />
                    </Box>
                    <Box args={[0.1, 0.05, 0.05]} position={[0.15, 0, 0]}>
                        <meshStandardMaterial color="white" emissive="#00D2FF" emissiveIntensity={2} />
                    </Box>
                </group>

                {/* Status Indicator Halo */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]}>
                    <ringGeometry args={[0.7, 0.8, 32]} />
                    <meshStandardMaterial 
                        color={isTyping ? "#FF3366" : "#00D2FF"} 
                        transparent 
                        opacity={0.5} 
                        emissive={isTyping ? "#FF3366" : "#00D2FF"}
                        emissiveIntensity={1}
                    />
                </mesh>
            </Float>

            {/* Label / Interactive Hint */}
            <Html position={[0, 1.2, 0]} center distanceFactor={10}>
                <div className={`transition-opacity duration-300 ${hovered || !isOpen ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full whitespace-nowrap shadow-glow-pink">
                        <p className="text-[10px] font-heading font-bold text-white uppercase tracking-widest">
                            {isTyping ? 'ShopBot is thinking...' : hovered ? 'Click to Chat' : 'ShopBot AI'}
                        </p>
                    </div>
                </div>
            </Html>

            {/* Decorative Particles / Glow */}
            <pointLight 
                color={isTyping ? "#FF3366" : "#00D2FF"} 
                intensity={isTyping ? 2 : 1} 
                distance={5} 
            />
        </group>
    );
}
