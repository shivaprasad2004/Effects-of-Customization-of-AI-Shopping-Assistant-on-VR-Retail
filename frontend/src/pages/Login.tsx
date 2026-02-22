import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loginUser, clearError } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Login() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading, error } = useAppSelector((state) => state.auth);
    const [form, setForm] = useState({ email: '', password: '' });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        dispatch(clearError());
        const result = await dispatch(loginUser(form));
        if (loginUser.fulfilled.match(result)) {
            navigate('/products');
        }
    }

    return (
        <div className="page-container min-h-screen flex items-center justify-center p-4">
            {/* Background orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-highlight/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="heading-xl text-4xl mb-2">VR<span>Retail</span></h1>
                    <p className="text-white/50 text-sm">AI-Powered Virtual Shopping Experience</p>
                </div>

                <div className="glass-card-elevated p-8">
                    <h2 className="heading-lg text-xl mb-6">Welcome Back</h2>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-heading text-white/60 mb-1.5 uppercase tracking-wider">Email</label>
                            <input
                                id="login-email"
                                type="email"
                                required
                                className="input-field"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-heading text-white/60 mb-1.5 uppercase tracking-wider">Password</label>
                            <input
                                id="login-password"
                                type="password"
                                required
                                className="input-field"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                            />
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full mt-2" id="login-submit">
                            {loading ? <LoadingSpinner size="sm" /> : 'Enter the VR Store →'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-white/40 mt-6">
                        New participant?{' '}
                        <Link to="/register" className="text-highlight hover:underline font-medium">Register here</Link>
                    </p>
                </div>

                <p className="text-center text-xs text-white/20 mt-4">
                    Research Study Platform · All data is anonymized
                </p>
            </motion.div>
        </div>
    );
}
