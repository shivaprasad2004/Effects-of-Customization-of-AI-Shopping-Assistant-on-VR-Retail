import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { motion } from 'framer-motion';

/**
 * WalletConnect Component: Displays MetaMask status and address details with futuristic badges.
 */
export default function WalletConnect() {
    const { user } = useSelector((state: RootState) => state.auth);
    const walletAddress = user?.walletAddress;
    const isConnected = !!walletAddress;


    return (
        <div className="flex items-center gap-3">
            {isConnected ? (
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl"
                >
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <div className="flex flex-col">
                        <span className="text-[8px] font-heading text-green-400 uppercase tracking-tighter">Wallet Linked</span>
                        <span className="text-[10px] font-mono text-white/70">{walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</span>
                    </div>
                </motion.div>
            ) : (
                <span className="text-[9px] font-heading text-white/30 uppercase tracking-widest">MetaMask Not Linked</span>
            )}
        </div>
    );
}
