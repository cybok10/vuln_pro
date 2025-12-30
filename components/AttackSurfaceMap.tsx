
import React from 'react';
import { Globe, Server, Database, Shield, Zap } from 'lucide-react';
import { Finding } from '../types';

interface AttackSurfaceMapProps {
  findings: Finding[];
  target: string;
}

const AttackSurfaceMap: React.FC<AttackSurfaceMapProps> = ({ findings, target }) => {
  // Extract unique targets from findings to simulate discovered nodes
  const nodes = Array.from(new Set(findings.map(f => f.target))).slice(0, 8);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden h-[400px]">
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <Globe size={16} className="text-indigo-400" /> Attack Surface Topology
          </h3>
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Real-time infrastructure mapping</p>
        </div>
        <div className="flex gap-2">
          <div className="px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-[9px] font-bold text-zinc-400">NODES: {nodes.length + 1}</div>
        </div>
      </div>

      <div className="relative h-full flex items-center justify-center">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#6366f1 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

        {/* Central Node */}
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-full bg-indigo-600/20 border-2 border-indigo-500 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.4)] animate-pulse">
            <Shield size={24} className="text-indigo-400" />
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black uppercase tracking-widest text-white bg-zinc-950 px-2 py-0.5 border border-zinc-800 rounded">
            {target}
          </div>
        </div>

        {/* Discovered Nodes (Simulated positioning) */}
        {nodes.map((node, i) => {
          const angle = (i / nodes.length) * Math.PI * 2;
          const radius = 120;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div 
              key={node}
              className="absolute animate-in fade-in zoom-in duration-500"
              style={{ transform: `translate(${x}px, ${y}px)` }}
            >
              {/* Connection Line */}
              <div 
                className="absolute top-1/2 left-1/2 h-[1px] bg-gradient-to-r from-indigo-500/50 to-transparent origin-left opacity-30"
                style={{ 
                  width: `${radius}px`, 
                  transform: `rotate(${angle + Math.PI}rad) translateY(-50%)`,
                  left: '50%'
                }}
              />
              
              <div className="group relative">
                <div className="w-8 h-8 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center hover:border-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all cursor-pointer">
                  {node.includes('db') ? <Database size={14} className="text-zinc-500 group-hover:text-indigo-400" /> : 
                   node.includes('api') ? <Zap size={14} className="text-zinc-500 group-hover:text-indigo-400" /> :
                   <Server size={14} className="text-zinc-500 group-hover:text-indigo-400" />}
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold text-zinc-500 uppercase opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 px-1 rounded border border-zinc-800">
                  {node}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttackSurfaceMap;
