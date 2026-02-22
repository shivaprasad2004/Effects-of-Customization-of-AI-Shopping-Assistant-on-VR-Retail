import { motion } from 'framer-motion';

interface Props {
    fullscreen?: boolean;
    size?: 'sm' | 'md' | 'lg';
    message?: string;
}

export default function LoadingSpinner({ fullscreen, size = 'md', message }: Props) {
    const sizes = { sm: 'w-6 h-6', md: 'w-12 h-12', lg: 'w-20 h-20' };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-4">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className={`${sizes[size]} rounded-full border-2 border-white/10 border-t-highlight`}
            />
            {message && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-white/50 font-heading"
                >
                    {message}
                </motion.p>
            )}
        </div>
    );

    if (fullscreen) {
        return (
            <div
                className="fixed inset-0 flex items-center justify-center z-50"
                style={{ background: 'linear-gradient(180deg, #0D0D1A 0%, #1A1A2E 100%)' }}
            >
                <div className="text-center">
                    <div className="text-3xl font-black font-heading text-white mb-6">
                        VR<span className="text-highlight">Retail</span>
                    </div>
                    {spinner}
                </div>
            </div>
        );
    }

    return spinner;
}
