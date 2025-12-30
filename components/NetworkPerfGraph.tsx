
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface NetworkPerfGraphProps {
  data: { time: string; throughput: number; latency: number }[];
}

const NetworkPerfGraph: React.FC<NetworkPerfGraphProps> = ({ data }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl h-[300px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Network Intelligence</h3>
          <p className="text-xs font-bold text-indigo-400">Packet Throughput & Engine Latency</p>
        </div>
      </div>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorThr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="time" hide />
            <YAxis hide domain={[0, 'auto']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
              itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
            />
            <Area 
              type="monotone" 
              dataKey="throughput" 
              stroke="#6366f1" 
              fillOpacity={1} 
              fill="url(#colorThr)" 
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NetworkPerfGraph;
