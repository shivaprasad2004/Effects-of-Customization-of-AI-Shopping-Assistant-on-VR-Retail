import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '../store';
import { logout } from '../store/authSlice';
import { toggleTheme, toggleMusic, setFontSize } from '../store/uiSlice';
import { toggleEmotionPanel } from '../store/uiSlice';
import { useBlockchain } from '../hooks/useBlockchain';

export default function Navbar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const { cart } = useSelector((state: RootState) => state.product);
    const { theme } = useSelector((state: RootState) => state.ui);
    const { loyaltyTokens } = user || {};
    const { walletAddress, connectWallet, isConnected } = useBlockchain();
    const [menuOpen, setMenuOpen] = useState(false);

    function handleLogout() {
        dispatch(logout());
        navigate('/login');
    }

    const truncateWallet = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

    return (
        <motion.nav
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-50 glass-card border-b border-white/10 px-6 py-3"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Left: Logo */}
                <NavLink to="/" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-glow flex items-center justify-center text-white text-sm font-black font-heading">
                        VR
                    </div>
                    <span className="font-heading text-lg font-bold text-white hidden md:block">
                        VR<span className="text-highlight">Retail</span>
                    </span>
                </NavLink>

                {/* Center: Nav Links */}
                <div className="hidden md:flex items-center gap-1">
                    <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
                    <NavLink to="/vr-store" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>VR Store</NavLink>
                    <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Analytics</NavLink>
                    <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Profile</NavLink>
                </div>

                {/* Right: Controls */}
                <div className="flex items-center gap-3">
                    {/* Loyalty tokens */}
                    {loyaltyTokens != null && loyaltyTokens > 0 && (
                        <div className="badge-highlight hidden md:flex">
                            🪙 {loyaltyTokens} SHOP
                        </div>
                    )}

                    {/* Cart */}
                    <NavLink to="/checkout" className="relative btn-ghost p-2">
                        🛒
                        {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-highlight rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                                {cart.length}
                            </span>
                        )}
                    </NavLink>

                    {/* Emotion toggle */}
                    <button onClick={() => dispatch(toggleEmotionPanel())} className="btn-ghost p-2 text-lg" title="Emotion Detector">😊</button>

                    {/* Wallet connect */}
                    {isConnected ? (
                        <div className="badge-success hidden md:flex text-xs">{truncateWallet(walletAddress as string)}</div>
                    ) : (
                        <button onClick={connectWallet} className="btn-secondary text-xs px-3 py-1.5 hidden md:flex">Connect Wallet</button>
                    )}

                    {/* Theme toggle */}
                    <button onClick={() => dispatch(toggleTheme())} className="btn-ghost p-2">
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>

                    {/* Music toggle */}
                    <button onClick={() => dispatch(toggleMusic())} className="btn-ghost p-2">🎵</button>

                    {/* User avatar / logout */}
                    <div className="relative">
                        <button onClick={() => setMenuOpen(o => !o)} className="flex items-center gap-2 btn-ghost px-3 py-1.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-glow flex items-center justify-center text-white text-xs font-bold">
                                {user?.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="text-sm text-white/80 hidden md:block">{user?.name}</span>
                        </button>

                        <AnimatePresence>
                            {menuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="absolute right-0 mt-2 w-48 glass-card-elevated rounded-xl overflow-hidden z-50"
                                >
                                    <div className="px-4 py-2 border-b border-white/10">
                                        <p className="text-xs text-white/50 font-heading">Signed in as</p>
                                        <p className="text-sm text-white truncate">{user?.email}</p>
                                        <span className="badge-highlight text-[10px] mt-1">{user?.role} · Group {user?.groupType}</span>
                                    </div>
                                    {['small', 'medium', 'large'].map(size => (
                                        <button key={size} onClick={() => dispatch(setFontSize(size as any))}
                                            className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors capitalize">
                                            {size} text
                                        </button>
                                    ))}
                                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-highlight hover:bg-highlight/10 transition-colors">
                                        Sign Out
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
