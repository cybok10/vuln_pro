
import React from 'react';
import { Finding, Severity } from '../types';
import { SEVERITY_COLORS, SEVERITY_ICONS } from '../constants';
import { ExternalLink, Search } from 'lucide-react';

interface FindingsTableProps {
  findings: Finding[];
}

const FindingsTable: React.FC<FindingsTableProps> = ({ findings }) => {
  const [filter, setFilter] = React.useState('');

  const filtered = findings.filter(f => 
    f.title.toLowerCase().includes(filter.toLowerCase()) ||
    f.target.toLowerCase().includes(filter.toLowerCase()) ||
    f.plugin.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          Detected Vulnerabilities
          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
            {filtered.length}
          </span>
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input 
            type="text"
            placeholder="Search findings..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-700 w-full md:w-64"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-zinc-950/50 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Severity</th>
              <th className="px-6 py-4">Title / ID</th>
              <th className="px-6 py-4">Target</th>
              <th className="px-6 py-4">Plugin</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filtered.map((finding) => (
              <tr key={finding.id} className="hover:bg-zinc-800/30 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${SEVERITY_COLORS[finding.severity]}`}>
                    {SEVERITY_ICONS[finding.severity]}
                    {finding.severity}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-zinc-200">{finding.title}</div>
                  <div className="text-xs text-zinc-500 truncate max-w-xs">{finding.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-zinc-400 terminal-font">{finding.target}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-xs font-medium bg-zinc-800 text-zinc-300 px-2 py-1 rounded">
                    {finding.plugin}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-zinc-500 hover:text-white transition-colors">
                    <ExternalLink size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  No vulnerabilities found yet.
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
