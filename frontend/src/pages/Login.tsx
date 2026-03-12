import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { loginUser, clearError } from '../store/authSlice';
import { useAppSelector } from '../store';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useAppSelector((state) => state.auth);
    const [form, setForm] = useState({ email: '', password: '' });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        dispatch(clearError());
        const result = await dispatch(loginUser(form) as any);
        if (loginUser.fulfilled.match(result)) {
            navigate('/');
        }
    }

    return (
        <div className="min-h-screen bg-[#121212] flex flex-col lg:flex-row overflow-hidden font-sans">
            {/* Left Side: Branding & Illustration */}
            <div className="lg:w-3/5 relative flex flex-col justify-center px-12 py-20 bg-slate-900 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/10 blur-[120px] rounded-full z-0" />

                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative z-10"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-rose-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-rose-500/20">V</div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase">VR<span className="text-rose-500">Retail</span></h1>
                    </div>

                    <h2 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tighter mb-6">
                        AI-POWERED <br />
                        <span className="text-rose-500">FAKE STORE API</span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-md mb-10 leading-relaxed">
                        The perfect immersive shopping solution for your next e-commerce prototype or research project.
                    </p>

                    <button 
                        onClick={() => navigate('/landing')}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold uppercase tracking-widest transition-all border border-white/10"
                    >
                        View Docs <span>→</span>
                    </button>
                </motion.div>

                {/* Illustration Watermark */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="absolute bottom-0 right-0 w-full max-w-lg pointer-events-none select-none opacity-80"
                >
                    <img 
                        src="https://cdni.iconscout.com/illustration/premium/thumb/online-shopping-store-illustration-download-in-svg-png-gif-file-formats--e-commerce-digital-market-pack-business-illustrations-4631311.png" 
                        alt="Shopping Illustration" 
                        className="w-full h-auto object-contain"
                    />
                </motion.div>
            </div>

            {/* Right Side: Login Form */}
            <div className="lg:w-2/5 flex flex-col justify-center items-center px-8 py-12 bg-[#F8F9FA] relative">
                <div className="w-full max-w-md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-10 rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100"
                    >
                        <div className="mb-10 text-center">
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2 uppercase">Welcome Back</h3>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Sign in to your account</p>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-rose-500 focus:bg-white transition-all text-slate-900 font-bold"
                                    placeholder="Enter your email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-rose-500 focus:bg-white transition-all text-slate-900 font-bold"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-slate-900 hover:bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200 disabled:opacity-50 active:scale-95"
                            >
                                {loading ? <LoadingSpinner size="sm" /> : 'Sign In Now →'}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-slate-400 text-sm font-bold">
                                Don't have an account? {' '}
                                <Link to="/register" className="text-rose-500 hover:underline">Register Here</Link>
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Footer Copy */}
                <div className="absolute bottom-8 text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">
                    © 2026 VR Retail Pro · Authorized Access Only
                </div>
            </div>
        </div>
    );
}
