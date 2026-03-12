import React from 'react';

export default function SkeletonCard() {
    return (
        <div className="glass-card rounded-2xl overflow-hidden animate-pulse">
            <div className="h-52 bg-white/5" />
            <div className="p-4 space-y-3">
                <div className="h-3 bg-white/10 rounded w-1/3" />
                <div className="h-5 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-full" />
                <div className="flex gap-2 mt-2">
                    <div className="h-6 w-6 bg-white/10 rounded-full" />
                    <div className="h-6 w-6 bg-white/10 rounded-full" />
                    <div className="h-6 w-6 bg-white/10 rounded-full" />
                </div>
                <div className="flex justify-between items-center mt-3">
                    <div className="h-6 bg-white/10 rounded w-20" />
                    <div className="h-8 bg-white/10 rounded-lg w-24" />
                </div>
            </div>
        </div>
    );
}
