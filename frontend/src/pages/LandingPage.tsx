import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useState, useEffect, useRef, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// ── 3D Hero Element ──────────────────────────────────────────
function OrbitingIcon({ angle, radius, color, speed = 1 }: { angle: number; radius: number; color: string; speed?: number }) {
    const ref = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (ref.current) {
            const t = state.clock.elapsedTime * speed;
            const rad = (angle * Math.PI) / 180 + t * 0.3;
            ref.current.position.x = Math.cos(rad) * radius;
            ref.current.position.z = Math.sin(rad) * radius;
            ref.current.position.y = Math.sin(t * 0.5) * 0.3;
            ref.current.rotation.y = t * 0.5;
        }
    });
    return (
        <group ref={ref}>
            <mesh castShadow>
                <boxGeometry args={[0.4, 0.6, 0.08]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} metalness={0.8} roughness={0.2} />
            </mesh>
        </group>
    );
}

function HeroScene() {
    const groupRef = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.08;
        }
    });
    return (
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.8}>
            <group ref={groupRef}>
                {/* Central VR Headset */}
                <group scale={1.5}>
                    <mesh castShadow>
                        <boxGeometry args={[1.4, 0.8, 0.7]} />
                        <MeshDistortMaterial color="#E94560" roughness={0.15} metalness={0.8} distort={0.1} speed={2} />
                    </mesh>
                    {/* Left lens */}
                    <mesh position={[-0.3, 0, 0.36]} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.18, 0.18, 0.08, 32]} />
                        <meshStandardMaterial color="#0a0a1a" metalness={0.95} roughness={0.05} />
                    </mesh>
                    {/* Right lens */}
                    <mesh position={[0.3, 0, 0.36]} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.18, 0.18, 0.08, 32]} />
                        <meshStandardMaterial color="#0a0a1a" metalness={0.95} roughness={0.05} />
                    </mesh>
                    {/* Strap */}
                    <mesh rotation={[0, 0, Math.PI / 2]}>
                        <torusGeometry args={[0.65, 0.04, 16, 32, Math.PI]} />
                        <meshStandardMaterial color="#333" metalness={0.5} roughness={0.4} />
                    </mesh>
                </group>

                {/* Orbiting product icons */}
                <OrbitingIcon angle={0} radius={2.8} color="#4FC3F7" speed={0.8} />
                <OrbitingIcon angle={120} radius={2.8} color="#81C784" speed={1.0} />
                <OrbitingIcon angle={240} radius={2.8} color="#FFB74D" speed={0.6} />

                {/* Orbital rings */}
                <mesh rotation={[Math.PI / 3, 0, 0]} scale={3.2}>
                    <torusGeometry args={[1, 0.015, 16, 64]} />
                    <meshStandardMaterial color="#0F3460" emissive="#0F3460" emissiveIntensity={1} transparent opacity={0.5} />
                </mesh>
                <mesh rotation={[Math.PI / 5, Math.PI / 4, 0]} scale={3.6}>
                    <torusGeometry args={[1, 0.01, 16, 64]} />
                    <meshStandardMaterial color="#E94560" emissive="#E94560" emissiveIntensity={0.5} transparent opacity={0.3} />
                </mesh>
            </group>
        </Float>
    );
}

// ── Technology Card ──────────────────────────────────────────
function TechCard({ icon, title, description, gradient, delay }: { icon: string; title: string; description: string; gradient: string; delay: number }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [5, -5]);
    const rotateY = useTransform(x, [-100, 100], [-5, 5]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.6 }}
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                x.set(e.clientX - rect.left - rect.width / 2);
                y.set(e.clientY - rect.top - rect.height / 2);
            }}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            className="glass-card-elevated p-8 rounded-2xl hover:border-highlight/30 transition-colors group cursor-default"
        >
            <div className={`w-14 h-14 rounded-2xl ${gradient} flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <h3 className="font-['Orbitron'] text-lg text-white mb-3">{title}</h3>
            <p className="text-white/50 text-sm leading-relaxed">{description}</p>
        </motion.div>
    );
}

// ── Animated Counter ─────────────────────────────────────────
function AnimatedStat({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !hasAnimated) {
                setHasAnimated(true);
                let start = 0;
                const step = value / 60;
                const interval = setInterval(() => {
                    start += step;
                    if (start >= value) { setCount(value); clearInterval(interval); }
                    else setCount(Math.floor(start));
                }, 16);
            }
        }, { threshold: 0.5 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [value, hasAnimated]);

    return (
        <div ref={ref} className="text-center">
            <div className="font-['Orbitron'] text-5xl md:text-6xl font-bold text-white mb-2">
                {count.toLocaleString()}{suffix}
            </div>
            <p className="text-white/40 text-sm uppercase tracking-widest">{label}</p>
        </div>
    );
}

export default function LandingPage() {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    const features = [
        { icon: '🎨', title: '3D Configurator', description: 'Make It Yours (MiY) — Interact with 3D models in real-time. Customize colors, materials, and sizes with instant visual feedback.', gradient: 'bg-gradient-to-br from-purple-500 to-pink-500' },
        { icon: '📱', title: 'Augmented Reality', description: 'See products in your own space. Virtual try-on for fashion, room placement for furniture, and 360° views for electronics.', gradient: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
        { icon: '🖥️', title: 'Digital Display Units', description: 'In-store tablets and screens showcase interactive 3D models. Full kiosk mode with auto-carousel and QR code scanning.', gradient: 'bg-gradient-to-br from-emerald-500 to-teal-500' },
        { icon: '📊', title: 'CRM Intelligence', description: 'Powered by Dynamics 365 & Salesforce integration. Unified customer profiles, engagement scoring, and personalized experiences.', gradient: 'bg-gradient-to-br from-amber-500 to-orange-500' },
    ];

    const heroTexts = [
        { main: 'The Future of Retail', highlight: 'is Immersive', sub: 'Step into a fully interactive VR shopping experience powered by AI, AR, and Blockchain' },
        { main: 'Make It Yours', highlight: 'with 3D', sub: 'Customize every product in real-time with our advanced 3D configurator technology' },
        { main: 'See Before', highlight: 'You Buy', sub: 'Augmented Reality lets you place products in your space or try them on virtually' },
    ];

    useEffect(() => {
        const timer = setInterval(() => setCurrentSlide(i => (i + 1) % heroTexts.length), 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative bg-gradient-to-b from-[#0A0A1A] via-[#1A1A2E] to-[#0D0D1A] text-white font-sans overflow-hidden">
            {/* ── Ambient Background Effects ─── */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute w-[800px] h-[800px] -top-64 -left-64 rounded-full bg-highlight/5 blur-[120px] animate-float" />
                <div className="absolute w-[600px] h-[600px] -bottom-32 -right-32 rounded-full bg-accent-light/5 blur-[100px] animate-float" style={{ animationDelay: '-4s' }} />
                <div className="absolute w-[400px] h-[400px] top-1/3 right-1/4 rounded-full bg-purple-500/3 blur-[80px] animate-pulse-glow" />
            </div>

            {/* ── Header ─── */}
            <header className="fixed top-0 left-0 w-full z-50 px-8 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between glass-card px-6 py-3 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-highlight to-highlight-dark flex items-center justify-center">
                            <span className="font-['Orbitron'] font-bold text-sm text-white">VR</span>
                        </div>
                        <span className="font-['Orbitron'] text-sm font-bold tracking-wider">VR<span className="text-highlight">Retail</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-xs font-medium text-white/60 hover:text-white transition-colors px-4 py-2">Login</Link>
                        <Link to="/register" className="btn-primary text-xs px-6 py-2.5">Get Started</Link>
                    </div>
                </div>
            </header>

            {/* ── HERO SECTION ─── */}
            <section className="relative min-h-screen flex items-center pt-24">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
                    {/* Left: Text */}
                    <div className="relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-8"
                        >
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-xs text-white/60">AI-Powered Immersive Shopping Platform</span>
                        </motion.div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                transition={{ duration: 0.6 }}
                            >
                                <h1 className="font-['Orbitron'] text-5xl md:text-7xl font-bold leading-[1.05] mb-6">
                                    {heroTexts[currentSlide].main}{' '}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-highlight to-highlight-light">
                                        {heroTexts[currentSlide].highlight}
                                    </span>
                                </h1>
                                <p className="text-lg text-white/50 max-w-lg mb-10 leading-relaxed">
                                    {heroTexts[currentSlide].sub}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex flex-wrap gap-4 mb-12">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/register')}
                                className="btn-primary px-8 py-4 text-sm font-bold"
                            >
                                Enter VR Store
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/login')}
                                className="btn-ghost px-8 py-4 text-sm font-bold"
                            >
                                Explore Products
                            </motion.button>
                        </div>

                        {/* Slide indicators */}
                        <div className="flex gap-2">
                            {heroTexts.map((_, i) => (
                                <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-10 bg-highlight' : 'w-3 bg-white/20'}`} />
                            ))}
                        </div>

                        {/* Tech badges */}
                        <div className="flex flex-wrap gap-3 mt-12">
                            {['VR', 'AR', 'AI', 'Blockchain', '3D'].map((tech) => (
                                <span key={tech} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium text-white/50 tracking-wider">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Right: 3D Scene */}
                    <div className="relative h-[500px] lg:h-[600px]">
                        <div className="absolute inset-0 rounded-3xl overflow-hidden">
                            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                                <ambientLight intensity={0.3} />
                                <directionalLight position={[5, 5, 5]} intensity={0.8} />
                                <pointLight position={[-3, 2, -2]} intensity={0.5} color="#E94560" />
                                <pointLight position={[3, -2, 2]} intensity={0.3} color="#0F3460" />
                                <Suspense fallback={null}>
                                    <HeroScene />
                                    <Environment preset="night" />
                                </Suspense>
                                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
                            </Canvas>
                        </div>
                        {/* Glow effect behind canvas */}
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-highlight/10 to-accent-light/10 blur-3xl -z-10 scale-110" />
                    </div>
                </div>
            </section>

            {/* ── TECHNOLOGY SHOWCASE ─── */}
            <section className="relative py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="text-xs font-['Orbitron'] text-highlight tracking-[0.3em] uppercase mb-4 block">Technologies</span>
                        <h2 className="font-['Orbitron'] text-4xl md:text-5xl font-bold mb-4">
                            Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-highlight to-highlight-light">Cutting-Edge Tech</span>
                        </h2>
                        <p className="text-white/40 max-w-2xl mx-auto">Four pillars of technology working together to create the most immersive retail experience ever built.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((f, i) => (
                            <TechCard key={f.title} {...f} delay={i * 0.1} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── STATS SECTION ─── */}
            <section className="relative py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="glass-card-elevated rounded-3xl p-12 md:p-16">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <AnimatedStat value={10000} suffix="+" label="Products" />
                            <AnimatedStat value={99} suffix="%" label="Accuracy" />
                            <AnimatedStat value={50} suffix="+" label="3D Models" />
                            <AnimatedStat value={5} suffix="" label="AI Layers" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ─── */}
            <section className="relative py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                        <span className="text-xs font-['Orbitron'] text-highlight tracking-[0.3em] uppercase mb-4 block">Experience</span>
                        <h2 className="font-['Orbitron'] text-4xl md:text-5xl font-bold">How It Works</h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'Enter the VR Store', desc: 'Walk through a fully immersive 3D retail environment. Browse fashion, electronics, and furniture zones.', icon: '🥽' },
                            { step: '02', title: 'Customize & Try On', desc: 'Use the 3D Configurator to personalize products. Try AR for virtual fitting or room placement.', icon: '✨' },
                            { step: '03', title: 'Trust & Purchase', desc: 'Every product is blockchain-verified. Pay securely with crypto and earn loyalty tokens.', icon: '🔗' },
                        ].map((item, i) => (
                            <motion.div
                                key={item.step}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                className="relative group"
                            >
                                <div className="glass-card p-8 rounded-2xl h-full hover:border-highlight/20 transition-all">
                                    <div className="text-4xl mb-4">{item.icon}</div>
                                    <div className="font-['Orbitron'] text-highlight/30 text-5xl font-bold absolute top-4 right-6">{item.step}</div>
                                    <h3 className="font-['Orbitron'] text-lg text-white mb-3">{item.title}</h3>
                                    <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA SECTION ─── */}
            <section className="relative py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-highlight/10 to-accent-light/10" />
                <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
                        <h2 className="font-['Orbitron'] text-5xl md:text-7xl font-bold mb-6">
                            Ready to <span className="text-highlight">Experience</span> the Future?
                        </h2>
                        <p className="text-white/50 text-lg mb-10 max-w-2xl mx-auto">
                            Join thousands of shoppers exploring products in VR with AI-powered recommendations and blockchain-verified authenticity.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/register')}
                            className="btn-primary px-12 py-5 text-lg font-bold shadow-glow-pink"
                        >
                            Start Your VR Journey
                        </motion.button>
                    </motion.div>
                </div>
            </section>

            {/* ── FOOTER ─── */}
            <footer className="relative z-10 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-highlight to-highlight-dark flex items-center justify-center">
                                    <span className="font-['Orbitron'] font-bold text-sm">VR</span>
                                </div>
                                <span className="font-['Orbitron'] text-sm font-bold">VR<span className="text-highlight">Retail</span></span>
                            </div>
                            <p className="text-white/30 text-sm max-w-xs leading-relaxed">
                                AI-Powered VR Shopping Platform combining immersive 3D experiences with emotion intelligence and blockchain trust.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-['Orbitron'] text-xs text-white/50 tracking-widest uppercase mb-6">Platform</h4>
                            <ul className="space-y-3 text-sm text-white/30">
                                <li><Link to="/login" className="hover:text-highlight transition-colors">VR Store</Link></li>
                                <li><Link to="/login" className="hover:text-highlight transition-colors">Products</Link></li>
                                <li><Link to="/register" className="hover:text-highlight transition-colors">Get Started</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-['Orbitron'] text-xs text-white/50 tracking-widest uppercase mb-6">Technology</h4>
                            <ul className="space-y-3 text-sm text-white/30">
                                <li>3D Configurator</li>
                                <li>Augmented Reality</li>
                                <li>Blockchain Verification</li>
                                <li>Emotion AI</li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-[10px] text-white/20 tracking-widest uppercase">
                        <span>&copy; 2026 VR Retail. Research & Educational Use.</span>
                        <div className="flex gap-8 mt-4 md:mt-0">
                            <span>Privacy</span>
                            <span>Terms</span>
                            <span>License</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
