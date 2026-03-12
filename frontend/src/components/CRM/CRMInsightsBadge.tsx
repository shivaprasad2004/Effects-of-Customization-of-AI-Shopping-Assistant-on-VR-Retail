import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CRMInsights } from '../../store/productSlice';

interface Props {
    insights: CRMInsights;
    compact?: boolean;
}

export default function CRMInsightsBadge({ insights, compact = false }: Props) {
    const [showPopover, setShowPopover] = useState(false);

    if (compact) {
        return (
            <div className="relative inline-block">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    onMouseEnter={() => setShowPopover(true)}
                    onMouseLeave={() => setShowPopover(false)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-medium border border-amber-500/20"
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    CRM
                </motion.button>

                <AnimatePresence>
                    {showPopover && (
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            className="absolute z-50 bottom-full left-0 mb-2 w-64 glass-card-elevated p-4 rounded-xl shadow-2xl"
                        >
                            <InsightsContent insights={insights} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="glass-card p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-xs font-['Orbitron'] text-amber-400 tracking-wider">CRM INSIGHTS</span>
                <span className="text-[10px] text-white/30 ml-auto">Dynamics 365</span>
            </div>
            <InsightsContent insights={insights} />
        </div>
    );
}

function InsightsContent({ insights }: { insights: CRMInsights }) {
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-[10px] text-white/40 uppercase">Conversion</p>
                    <p className="text-sm font-bold text-green-400">{insights.conversionRate}%</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-[10px] text-white/40 uppercase">Engagement</p>
                    <p className="text-sm font-bold text-blue-400">{insights.engagementScore}/100</p>
                </div>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
                <p className="text-[10px] text-white/40 uppercase">Target Audience</p>
                <p className="text-xs text-white/80 mt-0.5">{insights.targetAudience}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
                <p className="text-[10px] text-white/40 uppercase">Avg. Session</p>
                <p className="text-xs text-white/80 mt-0.5">{Math.floor(insights.avgSessionTime / 60)}m {insights.avgSessionTime % 60}s</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-white/30">
                <span>Powered by</span>
                <span className="text-amber-400/60">Salesforce / Dynamics 365</span>
            </div>
        </div>
    );
}
