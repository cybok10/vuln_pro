
import React from 'react';
import { Finding, Severity } from '../types';
import { SEVERITY_COLORS, SEVERITY_ICONS } from '../constants';
// Fix: Added ShieldAlert to imports from lucide-react
import { ExternalLink, Search, Eye, ShieldAlert } from 'lucide-react';

interface FindingsTableProps {
  findings: Finding[];
  onSelectFinding: (finding: Finding) => void;
}

const FindingsTable: React.FC<FindingsTableProps> = ({ findings, onSelectFinding }) => {
  const [filter, setFilter] = React.useState('');

  const filtered = findings.filter(f => 
    f.title.toLowerCase().includes(filter.toLowerCase()) ||
    f.target.toLowerCase().includes(filter.toLowerCase()) ||
    f.plugin.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-6 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/30">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-3">
            Detected Vulnerabilities
            <span className="text-[10px] font-black bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full uppercase tracking-widest border border-zinc-700">
              {filtered.length} DISCOVERED
            </span>
          </h3>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input 
            type="text"
            placeholder="Search findings..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-indigo-500/50 outline-none w-full md:w-80"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-zinc-950/80 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
            <tr>
              <th className="px-6 py-4">Severity</th>
              <th className="px-6 py-4">Finding Name</th>
              <th className="px-6 py-4">Target Endpoint</th>
              <th className="px-6 py-4">Source Tool</th>
              <th className="px-6 py-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {filtered.map((finding) => (
              <tr 
                key={finding.id} 
                className="hover:bg-zinc-800/20 transition-all group cursor-pointer"
                onClick={() => onSelectFinding(finding)}
              >
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${SEVERITY_COLORS[finding.severity]}`}>
                    {SEVERITY_ICONS[finding.severity]}
                    {finding.severity}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm font-bold text-zinc-100">{finding.title}</div>
                  <div className="text-[10px] text-zinc-500 truncate max-w-sm mt-0.5">{finding.description}</div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="text-xs text-zinc-400 terminal-font bg-zinc-950 px-2 py-1 rounded border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                    {finding.target}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="text-[10px] font-black bg-zinc-800/50 text-zinc-400 px-3 py-1.5 rounded-lg border border-zinc-800">
                    {finding.plugin.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="p-2 text-zinc-500 group-hover:text-indigo-400 transition-all hover:bg-indigo-500/10 rounded-xl">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-30">
                    {/* Fixed: Use ShieldAlert icon which is now correctly imported */}
                    <ShieldAlert size={40} />
                    <p className="text-sm font-bold uppercase tracking-widest">No Security Defects Identified</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FindingsTable;
