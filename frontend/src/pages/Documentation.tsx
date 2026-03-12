import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function Documentation() {
    return (
        <div className="page-container px-6 py-12 min-h-screen bg-[#050510] text-white">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl mx-auto mb-16 text-center"
            >
                <div className="inline-block px-4 py-1 rounded-full bg-highlight/10 border border-highlight/20 text-highlight text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
                    Project Roadmap & Technical Overview
                </div>
                <h1 className="heading-xl text-5xl md:text-6xl mb-6">Technical Documentation</h1>
                <p className="text-white/50 text-lg max-w-3xl mx-auto">
                    A deep dive into the architecture, research foundation, and multi-layered implementation of the AI-Powered Conversational Agent in VR Retail.
                </p>
            </motion.div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-5xl mx-auto space-y-20"
            >
                {/* Section 1: Foundation */}
                <motion.section variants={itemVariants} className="relative">
                    <div className="absolute -left-12 top-0 text-6xl font-black text-white/5 select-none hidden lg:block">01</div>
                    <div className="flex flex-col md:flex-row gap-12 items-start">
                        <div className="flex-1">
                            <h2 className="text-highlight font-heading font-bold uppercase tracking-widest text-xs mb-4">Phase 1: Foundation & Analysis</h2>
                            <h3 className="text-3xl font-black mb-6 tracking-tighter uppercase italic">1.1 Project Introduction</h3>
                            <div className="prose prose-invert max-w-none text-white/70 leading-relaxed space-y-4 text-sm md:text-base">
                                <p>
                                    This project aims to develop an <span className="text-white font-bold">intelligent, adaptive shopping assistant</span> that operates within a fully immersive 3D virtual store. 
                                    By converging Virtual Reality (VR) and Artificial Intelligence (AI), we transcend the limitations of traditional 2D e-commerce.
                                </p>
                                <p>
                                    The system functions as a conversational agent, accessible via voice or text, capable of understanding natural language, guiding users through aisles, and providing hyper-personalized recommendations.
                                </p>
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-8">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Development Team</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-bold uppercase tracking-wider">
                                        <div className="text-white/80">G. Shiva Prasad</div>
                                        <div className="text-white/80">P. Likitha</div>
                                        <div className="text-white/80">V. Aashritha</div>
                                        <div className="text-white/80">V. Nikhil</div>
                                    </div>
                                    <p className="mt-4 text-[10px] text-highlight/60 italic">Under the guidance of Asst. Professor J. Venkat Ramana</p>
                                </div>
                            </div>
                        </div>
                        <div className="md:w-1/3 glass-card p-8 border-highlight/20 bg-highlight/5">
                            <div className="text-4xl mb-4">🎯</div>
                            <h4 className="font-bold mb-2 uppercase text-xs tracking-widest text-white">Core Objective</h4>
                            <p className="text-xs text-white/40 leading-relaxed">
                                Combine the sensory-rich experience of physical shopping with the convenience and intelligent scale of modern AI.
                            </p>
                        </div>
                    </div>
                </motion.section>

                {/* Section 2: Literature Survey */}
                <motion.section variants={itemVariants} className="relative">
                    <div className="absolute -left-12 top-0 text-6xl font-black text-white/5 select-none hidden lg:block">02</div>
                    <div className="glass-card p-8 md:p-12 border-white/5">
                        <h3 className="text-3xl font-black mb-8 tracking-tighter uppercase italic">1.2 Literature Survey Highlights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { 
                                    ref: "Tussyadiah & Miller (2023)", 
                                    focus: "Immersive Presence", 
                                    content: "VR influences consumer behavior by creating a 'sense of presence' that differentiates it from standard online shopping." 
                                },
                                { 
                                    ref: "Kim & Park (2021)", 
                                    focus: "Conversational AI", 
                                    content: "NLP-based chatbots simulate human sales assistants, significantly enhancing customer engagement and purchase intention." 
                                },
                                { 
                                    ref: "Adamopoulou & Moussiades (2020)", 
                                    focus: "LLM Architectures", 
                                    content: "Evolution from rule-based systems to modern Large Language Models (LLMs) for free-flowing, natural conversations." 
                                },
                                { 
                                    ref: "Zhang et al. (2020)", 
                                    focus: "Deep Learning Recs", 
                                    content: "Hybrid recommender models combining collaborative and content-based filtering represent the state-of-the-art." 
                                }
                            ].map((item, i) => (
                                <div key={i} className="border-l-2 border-highlight/30 pl-6">
                                    <p className="text-[10px] font-bold text-highlight uppercase tracking-widest mb-1">{item.ref}</p>
                                    <h4 className="font-bold text-white mb-2 text-sm">{item.focus}</h4>
                                    <p className="text-xs text-white/40 leading-relaxed">{item.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* Section 3: The Problem */}
                <motion.section variants={itemVariants} className="relative">
                    <div className="absolute -left-12 top-0 text-6xl font-black text-white/5 select-none hidden lg:block">03</div>
                    <div className="flex flex-col md:flex-row gap-12">
                        <div className="md:w-1/3 bg-rose-500/10 border border-rose-500/20 rounded-3xl p-8">
                            <div className="text-4xl mb-4">⚠️</div>
                            <h3 className="text-xl font-black text-rose-500 mb-4 uppercase tracking-tighter">The Critical Flaw</h3>
                            <p className="text-sm text-white/60 leading-relaxed italic">
                                "Most existing AI shopping assistants adopt a one-size-fits-all approach, treating every shopper as a generic user."
                            </p>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-3xl font-black mb-6 tracking-tighter uppercase italic">1.3 The Core Problem</h3>
                            <div className="space-y-6 text-white/70 text-sm md:text-base leading-relaxed">
                                <p>
                                    Despite high immersion, the absence of <span className="text-rose-500 font-bold">meaningful personalization</span> paradoxically leads to lower user satisfaction and reduced trust.
                                </p>
                                <ul className="space-y-4">
                                    <li className="flex gap-3">
                                        <span className="text-rose-500">✕</span>
                                        <span>Failure to adapt to real-time emotional states.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-rose-500">✕</span>
                                        <span>Lack of memory regarding user style and past behavior.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-rose-500">✕</span>
                                        <span>High cart abandonment due to "robotic" and generic interactions.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Section 4: Architecture Summary */}
                <motion.section variants={itemVariants} className="relative">
                    <div className="absolute -left-12 top-0 text-6xl font-black text-white/5 select-none hidden lg:block">04</div>
                    <h3 className="text-3xl font-black mb-12 tracking-tighter uppercase italic text-center">System Architecture Overview</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {[
                            { title: "VR Env", desc: "Immersive 3D World Setup", color: "bg-blue-500" },
                            { title: "NLP Engine", desc: "Core Conversational Interface", color: "bg-purple-500" },
                            { title: "Emotion AI", desc: "Adaptive Affective Response", color: "bg-rose-500" },
                            { title: "Personalizer", desc: "Hyper-Profile Recommendations", color: "bg-emerald-500" },
                            { title: "Blockchain", desc: "Trust & Secure Payments", color: "bg-yellow-500" }
                        ].map((layer, i) => (
                            <div key={i} className="glass-card p-6 border-white/5 text-center flex flex-col items-center justify-center group hover:border-highlight/40 transition-all">
                                <div className={`w-10 h-10 rounded-full ${layer.color} mb-4 flex items-center justify-center font-black text-white text-xs shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
                                    {i + 1}
                                </div>
                                <h4 className="font-bold text-white text-[10px] uppercase tracking-widest mb-2">{layer.title}</h4>
                                <p className="text-[10px] text-white/30 leading-tight">{layer.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* Section 5: Phase 2 - Core Interaction Layers */}
                <motion.section variants={itemVariants} className="relative">
                    <div className="absolute -left-12 top-0 text-6xl font-black text-white/5 select-none hidden lg:block">05</div>
                    <h2 className="text-highlight font-heading font-bold uppercase tracking-widest text-xs mb-4">Phase 2: System Architecture - Core Interaction Layers</h2>
                    
                    <div className="space-y-16">
                        {/* 2.1 Layer 1 */}
                        <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="flex-1">
                                    <h3 className="text-2xl font-black mb-4 tracking-tight uppercase text-blue-400">2.1 Layer 1: Immersive VR Environment</h3>
                                    <p className="text-white/60 text-sm leading-relaxed mb-6">
                                        The physical touchpoint designed to simulate a real-world shopping mall with high fidelity. Not merely a backdrop, but an integral functional space featuring categorized shelves, navigation paths, virtual trial rooms, and checkout counters.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {['Unity 3D', 'Unreal Engine', 'OpenXR SDK', 'Oculus/SteamVR SDK'].map(t => (
                                            <span key={t} className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold">{t}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="lg:w-1/3 bg-blue-500/10 rounded-2xl p-6 flex flex-col justify-center">
                                    <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Key Goal</h4>
                                    <p className="text-xs text-white/40 italic">"Minimize the learning curve by creating a space that feels intuitive and familiar to a physical shopper."</p>
                                </div>
                            </div>
                        </div>

                        {/* 2.2 Layer 2 */}
                        <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="flex-1">
                                    <h3 className="text-2xl font-black mb-4 tracking-tight uppercase text-purple-400">2.2 Layer 2: AI Chatbot & NLP Engine</h3>
                                    <p className="text-white/60 text-sm leading-relaxed mb-6">
                                        The heart of user interaction. Processes voice and text inputs using a sophisticated pipeline: STT conversion, intent classification, and entity extraction to query a comprehensive product knowledge base. Now powered by <span className="text-purple-400 font-bold">GPT-4o</span> for real-time intelligence.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {['OpenAI GPT API', 'Whisper STT', 'Rasa NLP', 'MongoDB NoSQL'].map(t => (
                                            <span key={t} className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold">{t}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="lg:w-1/3 bg-purple-500/10 rounded-2xl p-6">
                                    <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2">Capabilities</h4>
                                    <ul className="text-[10px] text-white/40 space-y-1">
                                        <li>• Real-time Intent Classification</li>
                                        <li>• Contextual Entity Extraction</li>
                                        <li>• Human-like Conversational Flow</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* 2.3 Layer 3 */}
                        <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="flex-1">
                                    <h3 className="text-2xl font-black mb-4 tracking-tight uppercase text-rose-400">2.3 Layer 3: Emotion Recognition & Adaptive Response</h3>
                                    <p className="text-white/60 text-sm leading-relaxed mb-6">
                                        Affective AI that reads user facial expressions and physiological signals via VR sensors. This data modulates the assistant's tone and recommendations to create an empathetic shopping experience.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {['OpenCV', 'DeepFace / FER', 'TensorFlow / Keras', 'WebSockets'].map(t => (
                                            <span key={t} className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold">{t}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="lg:w-1/3 bg-rose-500/10 rounded-2xl p-6">
                                    <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-2">The Pipeline</h4>
                                    <p className="text-[10px] text-white/40 leading-relaxed">
                                        Headset Sensors → OpenCV Analysis → CNN Classification → Real-time Modulation of Chatbot Response.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Section 6: Phase 3 - Intelligence Layer */}
                <motion.section variants={itemVariants} className="relative">
                    <div className="absolute -left-12 top-0 text-6xl font-black text-white/5 select-none hidden lg:block">06</div>
                    <h2 className="text-highlight font-heading font-bold uppercase tracking-widest text-xs mb-4">Phase 3: System Architecture - Intelligence and Trust Layers</h2>
                    
                    <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
                        <div className="flex flex-col lg:flex-row gap-12">
                            <div className="flex-1">
                                <h3 className="text-3xl font-black mb-6 tracking-tighter uppercase italic text-emerald-400">3.1 Layer 4: The Hyper-Personalisation Engine</h3>
                                <div className="space-y-6 text-white/70 text-sm leading-relaxed">
                                    <p>
                                        While the previous layers handle real-time interaction and affect, this layer is the analytical brain of the system, responsible for building a deep, evolving understanding of each individual user. The <span className="text-emerald-400 font-bold">Hyper-Personalisation Engine</span> moves beyond simple rule-based recommendations to create a truly customized shopping experience.
                                    </p>
                                    <p>
                                        The profile is constructed by analyzing a wide array of behavioral data: browsing history within the VR store, the amount of time spent dwelling on specific products (dwell time), past purchase records, interaction patterns with the chatbot, and emotional responses detected by Layer 3.
                                    </p>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                                            <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Personalized Suggestions</h4>
                                            <p className="text-[10px] text-white/40 leading-tight">Dynamically generated product recommendations displayed to the user.</p>
                                        </div>
                                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                                            <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Custom VR Layouts</h4>
                                            <p className="text-[10px] text-white/40 leading-tight">Adapts shelves and categories based on preferred brands and history.</p>
                                        </div>
                                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                                            <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Targeted Offers</h4>
                                            <p className="text-[10px] text-white/40 leading-tight">Unique, real-time discounts tailored specifically to the shopper's profile.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:w-1/3 flex flex-col gap-4">
                                <div className="glass-card p-6 border-emerald-500/20 bg-emerald-500/5">
                                    <div className="text-3xl mb-4">🧠</div>
                                    <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-4">Tech Stack & Logic</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[9px] text-emerald-400/60 uppercase font-bold mb-1">Core Algorithm</p>
                                            <p className="text-[10px] text-white/50 italic leading-tight">Hybrid Model: Collaborative + Content-Based Filtering</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {['Python', 'TensorFlow', 'Scikit-learn', 'Apache Kafka', 'AWS Personalize'].map(t => (
                                                <span key={t} className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] font-mono text-emerald-400/70 border border-white/5">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Section 7: Phase 4 - Trust Layer */}
                <motion.section variants={itemVariants} className="relative pb-24">
                    <div className="absolute -left-12 top-0 text-6xl font-black text-white/5 select-none hidden lg:block">07</div>
                    <h3 className="text-3xl font-black mb-8 tracking-tighter uppercase italic text-yellow-500">3.2 Layer 5: Blockchain-Based Trust & Payment System</h3>
                    
                    <div className="bg-white/5 rounded-3xl p-8 border border-white/10 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
                        <div className="relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <p className="text-white/60 text-sm leading-relaxed">
                                        In an environment where AI handles transactions, trust is paramount. This layer introduces a <span className="text-yellow-500 font-bold">decentralized, immutable ledger</span> for all sensitive operations.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0 mt-1">
                                                <span className="text-yellow-500 text-xs">⛓️</span>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-white uppercase mb-1">Authenticity Certificates</h4>
                                                <p className="text-[10px] text-white/40">Verify provenance and genuineness of luxury items and electronics.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0 mt-1">
                                                <span className="text-yellow-500 text-xs">📜</span>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-white uppercase mb-1">Smart Contracts</h4>
                                                <p className="text-[10px] text-white/40">Self-executing contracts automate origin verification and secure escrow-style payments.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0 mt-1">
                                                <span className="text-yellow-500 text-xs">🛡️</span>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-white uppercase mb-1">Data Sovereignty</h4>
                                                <p className="text-[10px] text-white/40">User purchase histories are stored on the blockchain, giving users full ownership of their data.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl">
                                        <h4 className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mb-4">Architecture Stack</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { t: 'Hyperledger Fabric', d: 'Permissioned Framework' },
                                                { t: 'Solidity', d: 'Smart Contract Logic' },
                                                { t: 'MetaMask', d: 'Wallet Integration' },
                                                { t: 'IPFS', d: 'Off-chain Cert Storage' }
                                            ].map(item => (
                                                <div key={item.t} className="p-3 bg-black/40 rounded-lg border border-white/5">
                                                    <div className="text-[10px] font-mono text-white mb-1">{item.t}</div>
                                                    <div className="text-[8px] text-white/30 uppercase tracking-tighter">{item.d}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-highlight/5 border border-highlight/10">
                                        <p className="text-[10px] text-highlight/60 italic leading-tight">
                                            "Actual certificates are stored on IPFS, while their unique content hashes are recorded on-chain, providing a verifiable link to tamper-proof files."
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 p-8 bg-gradient-to-br from-highlight/10 to-transparent border border-highlight/20 rounded-3xl text-center">
                        <p className="text-highlight font-bold uppercase tracking-[0.2em] text-xs mb-2">Final Documentation Status</p>
                        <p className="text-white/60 text-sm">
                            System Architecture Phase 3 & 4 (Intelligence and Trust Layers) are now fully integrated.
                        </p>
                    </div>
                </motion.section>
            </motion.div>
        </div>
    );
}
