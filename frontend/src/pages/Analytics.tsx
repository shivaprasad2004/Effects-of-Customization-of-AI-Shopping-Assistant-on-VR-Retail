import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { useEffect, useState } from 'react';
import api from '../services/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Analytics() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await api.get('/analytics/experiment');
                setData(res.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        }
        fetchData();
    }, []);

    if (loading) return <LoadingSpinner fullscreen message="Aggregating research data..." />;
    if (!data) return <div className="page-container flex items-center justify-center">Error loading analytics</div>;

    const groupMetrics = [
        { name: 'Conversion (%)', A: (data.metrics.A?.avgConversionRate * 100).toFixed(1), B: (data.metrics.B?.avgConversionRate * 100).toFixed(1) },
        { name: 'Rec. Acceptance (%)', A: (data.metrics.A?.avgRecommendationAcceptance * 100).toFixed(1), B: (data.metrics.B?.avgRecommendationAcceptance * 100).toFixed(1) },
        { name: 'CSAT (1-5)', A: data.metrics.A?.avgCsat?.toFixed(2), B: data.metrics.B?.avgCsat?.toFixed(2) },
        { name: 'Trust (1-5)', A: data.metrics.A?.avgTrust?.toFixed(2), B: data.metrics.B?.avgTrust?.toFixed(2) },
    ];

    const COLORS = ['#10B981', '#6B7280', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6'];

    const emotionPieData = Object.entries(data.emotionData.B || {}).map(([name, value]) => ({ name, value: value as number }));

    return (
        <div className="page-container p-6 md:p-12 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="heading-xl text-4xl mb-2">Research Analytics</h1>
                        <p className="text-white/40">Comparing User Behavior Variants: Protocol A vs Protocol B</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="btn-secondary text-xs px-4 py-2">Export CSV</button>
                        <button className="btn-primary text-xs px-4 py-2">Download PDF Report</button>
                    </div>
                </header>

                {/* Top Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Total Participants', value: data.totalParticipants },
                        { label: 'Avg Engagement', value: `${((data.metrics.A?.avgEngagementTime + data.metrics.B?.avgEngagementTime) / 2 / 60).toFixed(1)}m` },
                        { label: 'Purchases (Group B)', value: data.metrics.B?.totalPurchases || 0 },
                        { label: 'Trust Score Gap', value: `+${(data.metrics.B?.avgTrust - data.metrics.A?.avgTrust).toFixed(2)}` }
                    ].map((s, i) => (
                        <motion.div key={i} whileHover={{ y: -5 }} className="glass-card p-6 border-l-4 border-l-highlight">
                            <p className="text-[10px] font-heading text-white/30 uppercase tracking-widest mb-1">{s.label}</p>
                            <p className="text-3xl font-black text-white">{s.value}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Performance Comparison */}
                    <div className="glass-card p-8">
                        <h2 className="heading-lg text-lg mb-8">Group Performance Matrix</h2>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={groupMetrics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="A" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Control (A)" />
                                    <Bar dataKey="B" fill="#E94560" radius={[4, 4, 0, 0]} name="Experimental (B)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-[10px] text-white/30 mt-6 italic text-center">
                            Protocol B includes personalized AI assistance and emotion-aware discounting.
                        </p>
                    </div>

                    {/* Emotion Distribution (Group B) */}
                    <div className="glass-card p-8">
                        <h3 className="heading-lg text-lg mb-8">Emotion Distribution (Group B)</h3>
                        <div className="h-80 w-full flex items-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={emotionPieData}
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {emotionPieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 ml-4">
                                {emotionPieData.map((e, i) => (
                                    <div key={e.name} className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="text-[10px] text-white/50 uppercase">{e.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Zone Activity (Secondary Section) */}
                <div className="glass-card p-8">
                    <h3 className="heading-lg text-lg mb-8">Store Hotspots: Zone Engagement Time</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.zoneHeatmap.filter((z: any) => z._id.group === 'B')}>
                                <defs>
                                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#E94560" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#E94560" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="_id.zone" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                                <Tooltip contentStyle={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)' }} />
                                <Area type="monotone" dataKey="avgDwell" stroke="#E94560" fillOpacity={1} fill="url(#colorVisits)" name="Avg Dwell Time (sec)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
