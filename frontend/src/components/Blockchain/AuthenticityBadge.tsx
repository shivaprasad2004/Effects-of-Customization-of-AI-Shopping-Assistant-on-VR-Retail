import { motion } from 'framer-motion';

/**
 * AuthenticityBadge: A glowing on-chain verification seal.
 */
export default function AuthenticityBadge({ verified = false }) {
    if (!verified) return null;

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-highlight px-3 py-1 rounded-full shadow-glow-blue border border-white/20"
        >
            <span className="text-[10px] text-white">📜</span>
            <span className="text-[9px] font-heading font-black text-white uppercase tracking-widest">On-Chain Verified</span>
        </motion.div>
    );
}
