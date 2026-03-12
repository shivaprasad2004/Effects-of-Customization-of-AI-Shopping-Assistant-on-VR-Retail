import React from 'react';

interface Props {
    children: React.ReactNode;
    className?: string;
}

export default function AnimatedGradientBg({ children, className = '' }: Props) {
    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Animated gradient mesh */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute w-[600px] h-[600px] -top-48 -left-48 rounded-full bg-gradient-to-r from-highlight/20 to-transparent blur-3xl animate-float" />
                <div className="absolute w-[500px] h-[500px] -bottom-32 -right-32 rounded-full bg-gradient-to-l from-accent-light/20 to-transparent blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
                <div className="absolute w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-purple-500/10 to-transparent blur-3xl animate-pulse-glow" />
            </div>
            {/* Content */}
            <div className="relative z-10">{children}</div>
        </div>
    );
}
