import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { updateProfile, ThemeType } from '../store/authSlice';
import { useBlockchain } from '../hooks/useBlockchain';
import { useState } from 'react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Profile() {
    const dispatch = useDispatch<AppDispatch>();
    const { user, loading } = useSelector((state: RootState) => state.auth);
    const { isConnected, walletAddress, connectWallet } = useBlockchain();

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || '',
        theme: user?.preferences?.theme || 'futuristic',
        musicEnabled: user?.preferences?.musicEnabled ?? true,
    });

    if (!user) return <LoadingSpinner fullscreen />;

    const handleSave = async () => {
        await dispatch(updateProfile({
            name: form.name,
            preferences: { ...user.preferences, theme: form.theme as ThemeType, musicEnabled: form.musicEnabled }
        }));
        setEditing(false);
    };

    return (
        <div className="page-container p-6 md:p-12 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-32 h-32 rounded-3xl bg-gradient-glow flex items-center justify-center text-5xl shadow-glow-pink">
                        {user.name[0].toUpperCase()}
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="heading-xl text-3xl mb-2">{user.name}</h1>
                        <p className="text-white/40 mb-1">Email: {user.email}</p>
                        <p className="text-white/40 mb-4">Username: {user.email.split('@')[0]}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            <span className="badge-highlight">GROUP {user.groupType}</span>
                            <span className="badge-success lowercase capitalize">{user.role}</span>
                            <span className="badge-warning">LOYALTY: {user.loyaltyTokens} SHOP</span>
                        </div>
                    </div>
                    <div className="md:ml-auto flex gap-3">
                        <button
                            onClick={() => setEditing(!editing)}
                            className="btn-secondary px-6"
                        >
                            {editing ? 'Cancel' : 'Edit Profile'}
                        </button>
                        {editing && <button onClick={handleSave} disabled={loading} className="btn-primary">Save Changes</button>}
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Settings & Preferences */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="glass-card p-8">
                            <h2 className="heading-lg text-lg mb-6 flex items-center gap-3">
                                <span>⚙️</span> Account Settings
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-heading text-white/30 uppercase tracking-widest mb-2">Display Name</label>
                                        {editing ? (
                                            <input
                                                value={form.name}
                                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                                className="input-field"
                                            />
                                        ) : (
                                            <p className="text-white font-medium">{user.name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-heading text-white/30 uppercase tracking-widest mb-2">Experiment Variant</label>
                                        <p className="text-highlight font-bold">Protocol {user.groupType} Activated</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-heading text-white/30 uppercase tracking-widest mb-2">Store Theme</label>
                                        {editing ? (
                                            <select
                                                value={form.theme}
                                                onChange={e => setForm(f => ({ ...f, theme: e.target.value as ThemeType }))}
                                                className="input-field"
                                            >
                                                <option value="futuristic">Futuristic</option>
                                                <option value="minimalist">Minimalist</option>
                                                <option value="cozy">Cozy</option>
                                            </select>
                                        ) : (
                                            <p className="text-white capitalize">{user.preferences.theme}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-8">
                            <h2 className="heading-lg text-lg mb-6 flex items-center gap-3">
                                <span>⛓️</span> Web3 Integration
                            </h2>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white/60 text-sm mb-1">Blockchain Wallet</p>
                                    <p className="text-xs font-mono text-white/30">
                                        {isConnected ? walletAddress : 'No wallet connected'}
                                    </p>
                                </div>
                                {!isConnected && (
                                    <button onClick={connectWallet} className="btn-secondary text-xs px-4 py-2">Connect MetaMask</button>
                                )}
                                {isConnected && (
                                    <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                        CONNECTED
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Activity Sidebar */}
                    <div className="space-y-8">
                        <div className="glass-card p-6 bg-highlight/5 border-highlight/20 overflow-hidden relative">
                            <div className="absolute -right-8 -bottom-8 text-8xl opacity-10 rotate-12">🪙</div>
                            <h3 className="font-heading text-sm text-highlight mb-4 uppercase tracking-widest">Rewards Program</h3>
                            <div className="text-4xl font-black text-white mb-2">{user.loyaltyTokens}</div>
                            <p className="text-[10px] text-white/40 font-heading mb-4">TOTAL $SHOP ACCRUED</p>
                            <button className="w-full btn-secondary text-[10px] border-highlight/40 py-2">Redeem Tokens</button>
                        </div>

                        <div className="glass-card p-6">
                            <h3 className="font-heading text-sm text-white/70 mb-4 uppercase tracking-widest">Quick Stats</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-white/40">Total Sessions</span>
                                    <span className="text-xs font-bold text-white">12</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-white/40">Products Noted</span>
                                    <span className="text-xs font-bold text-white">45</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-white/40">Time in VR</span>
                                    <span className="text-xs font-bold text-white">3h 42m</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
