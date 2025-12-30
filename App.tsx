
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Shield, 
  Activity, 
  Terminal, 
  Database, 
  Bot, 
  Download, 
  RefreshCw,
  LayoutDashboard,
  Cpu,
  Layers,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  Search,
  Settings,
  Bell,
  HardDrive,
  Globe,
  Zap,
  Clock,
  CircleDashed,
  XCircle,
  SearchCode,
  Bug,
  Ghost,
  FileText
} from 'lucide-react';
import { 
  Severity, 
  ScanStatus, 
  Finding, 
  EventMessage,
  ScanSession,
  Confidence,
  LogEntry
} from './types';
import { SAMPLE_TARGETS, SEVERITY_COLORS } from './constants';
import LiveTerminal from './components/LiveTerminal';
import FindingsTable from './components/FindingsTable';
import DashboardStats from './components/DashboardStats';
import { analyzeFindings } from './services/geminiService';

const TOOLS = [
  { name: 'Subfinder', icon: <SearchCode size={16} />, desc: 'Passive discovery' },
  { name: 'Nuclei', icon: <Activity size={16} />, desc: 'Template-based scanning' },
  { name: 'Arjun', icon: <Bug size={16} />, desc: 'Parameter discovery' },
  { name: 'Katana', icon: <Globe size={16} />, desc: 'Web crawling engine' },
  { name: 'Metasploit', icon: <Zap size={16} />, desc: 'Exploitation framework' },
];

const App: React.FC = () => {
  const [session, setSession] = useState<ScanSession>({
    id: 'S-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
    target: 'enterprise-corp.com',
    status: ScanStatus.IDLE,
    progress: 0,
    start_time: '',
    findings_count: 0
  });

  const [findings, setFindings] = useState<Finding[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'findings' | 'reports'>('overview');

  const wsRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);

  // Mock WebSocket / EventBus connection
  const simulateEvent = useCallback((type: 'log' | 'finding', data: any) => {
    if (type === 'log') {
      setLogs(prev => [...prev.slice(-50), { 
        ...data, 
        id: Date.now(), 
        timestamp: new Date().toLocaleTimeString() 
      } as LogEntry]);
    } else if (type === 'finding') {
      const newFinding: Finding = {
        ...data,
        id: 'F-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
        plugin: data.tool,
        scan_id: session.id,
        timestamp: new Date().toISOString()
      };
      setFindings(prev => [newFinding, ...prev]);
      setSession(s => ({ ...s, findings_count: s.findings_count + 1 }));
    }
  }, [session.id]);

  const startScan = () => {
    setSession(s => ({ 
      ...s, 
      status: ScanStatus.RUNNING, 
      start_time: new Date().toISOString(),
      progress: 0,
      findings_count: 0
    }));
    setFindings([]);
    setLogs([]);
    setAiAnalysis(null);

    let step = 0;
    timerRef.current = window.setInterval(() => {
      step++;
      setSession(s => ({ ...s, progress: Math.min(step * 1.6, 100) }));

      // Simulated Pipeline Events
      if (step === 2) simulateEvent('log', { plugin: 'core', message: 'Orchestrator initialized. Loading plugins...', level: 'info' });
      if (step === 5) simulateEvent('log', { plugin: 'recon', message: 'Subfinder started: Enumerating subdomains', level: 'info' });
      if (step === 10) simulateEvent('finding', { 
        tool: 'nuclei', 
        category: 'web', 
        severity: Severity.HIGH, 
        title: 'CVE-2023-22515: Broken Access Control', 
        description: 'Exposed Confluence instance found on dev.enterprise-corp.com',
        confidence: Confidence.HIGH,
        target: 'dev.enterprise-corp.com'
      });
      if (step === 25) simulateEvent('finding', { 
        tool: 'arjun', 
        category: 'web', 
        severity: Severity.CRITICAL, 
        title: 'Blind SQL Injection', 
        description: 'Time-based injection on /api/v1/user/search?id=',
        confidence: Confidence.MEDIUM,
        target: 'api.enterprise-corp.com'
      });
      if (step >= 60) {
        if (timerRef.current) clearInterval(timerRef.current);
        setSession(s => ({ ...s, status: ScanStatus.COMPLETED, progress: 100 }));
        simulateEvent('log', { plugin: 'core', message: 'Scan complete. All results persisted to SQLite.', level: 'success' });
      }
    }, 1000);
  };

  const stopScan = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSession(s => ({ ...s, status: ScanStatus.IDLE, progress: 0 }));
  };

  const getToolStatus = (idx: number) => {
    const range = 100 / TOOLS.length;
    const start = idx * range;
    const end = (idx + 1) * range;
    
    if (session.status === ScanStatus.IDLE) return 'QUEUED';
    if (session.status === ScanStatus.FAILED) return 'FAILED';
    if (session.progress >= end) return 'COMPLETED';
    if (session.progress > start && session.progress < end) return 'RUNNING';
    return 'QUEUED';
  };

  const getToolProgress = (idx: number) => {
    const range = 100 / TOOLS.length;
    const start = idx * range;
    if (session.progress <= start) return 0;
    if (session.progress >= start + range) return 100;
    return ((session.progress - start) / range) * 100;
  };

  const getStatusStyles = (statusText: string) => {
    switch (statusText) {
      case 'RUNNING':
        return {
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
          icon: <RefreshCw size={10} className="animate-spin" />,
          dot: 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]'
        };
      case 'COMPLETED':
        return {
          bg: 'bg-green-500/10 text-green-500 border-green-500/30',
          icon: <CheckCircle2 size={10} />,
          dot: 'bg-green-500'
        };
      case 'FAILED':
        return {
          bg: 'bg-red-500/10 text-red-500 border-red-500/30',
          icon: <XCircle size={10} />,
          dot: 'bg-red-500'
        };
      default:
        return {
          bg: 'bg-zinc-900 text-zinc-500 border-zinc-800',
          icon: <Clock size={10} />,
          dot: 'bg-zinc-800'
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex font-sans selection:bg-indigo-500/30">
      {/* Side Navigation */}
      <aside className="w-64 border-r border-zinc-800 bg-[#09090b] flex flex-col hidden lg:flex">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <Shield size={20} className="text-white" />
            </div>
            <span className="font-black text-lg tracking-tight uppercase">Pentest-Pro</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-indigo-600/10 text-indigo-400 font-bold border border-indigo-500/20' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'}`}
          >
            <LayoutDashboard size={18} /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('findings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'findings' ? 'bg-indigo-600/10 text-indigo-400 font-bold border border-indigo-500/20' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'}`}
          >
            <AlertCircle size={18} /> Findings
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'reports' ? 'bg-indigo-600/10 text-indigo-400 font-bold border border-indigo-500/20' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'}`}
          >
            <Download size={18} /> Reports
          </button>
          <div className="pt-6 pb-2 px-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Inventory</div>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800/50">
            <Globe size={18} /> Attack Surface
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800/50">
            <Database size={18} /> Database
          </button>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              <span className="text-xs font-bold text-zinc-400">Node Cluster: US-EAST</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-600 uppercase font-bold">
              <span>CPU: 12%</span>
              <span>MEM: 1.4GB</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search scans, assets, or findings..." 
                className="bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-zinc-400 hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </button>
            <div className="h-8 w-px bg-zinc-800 mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-bold">Admin User</div>
                <div className="text-[10px] text-zinc-500 uppercase font-black">Enterprise Role</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-500/20">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Dashboard Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium mb-1">
                <span>Pentest-Pro</span>
                <ChevronRight size={14} />
                <span>Command Center</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight flex items-center gap-4">
                Active Operations
                {session.status === ScanStatus.RUNNING && (
                  <span className="bg-green-500/10 text-green-500 text-xs px-3 py-1 rounded-full border border-green-500/20 animate-pulse">
                    Live Session
                  </span>
                )}
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden p-1">
                <input 
                  type="text" 
                  value={session.target}
                  onChange={(e) => setSession({ ...session, target: e.target.value })}
                  disabled={session.status === ScanStatus.RUNNING}
                  className="bg-transparent px-4 py-2 outline-none text-sm font-bold min-w-[200px]"
                />
                <button 
                  onClick={session.status === ScanStatus.RUNNING ? stopScan : startScan}
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-black transition-all ${
                    session.status === ScanStatus.RUNNING 
                    ? 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/20' 
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'
                  }`}
                >
                  {session.status === ScanStatus.RUNNING ? <><Square size={16} fill="currentColor" /> STOP</> : <><Play size={16} fill="currentColor" /> LAUNCH</>}
                </button>
              </div>
            </div>
          </div>

          {activeTab === 'overview' && (
            <>
              {/* Performance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  label="Critical Risks" 
                  value={findings.filter(f => f.severity === Severity.CRITICAL).length} 
                  color="red" 
                  icon={<Shield size={24} />} 
                />
                <StatCard 
                  label="High Risks" 
                  value={findings.filter(f => f.severity === Severity.HIGH).length} 
                  color="orange" 
                  icon={<Activity size={24} />} 
                />
                <StatCard 
                  label="Scan Progress" 
                  value={`${Math.floor(session.progress)}%`} 
                  color="indigo" 
                  icon={<Zap size={24} />} 
                />
                <StatCard 
                  label="Total Assets" 
                  value={SAMPLE_TARGETS.length} 
                  color="zinc" 
                  icon={<Globe size={24} />} 
                />
              </div>

              {/* Real-time Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
                  <LiveTerminal logs={logs} />
                  <DashboardStats findings={findings} />
                </div>
                <div className="space-y-8">
                  {/* AI Remediation Panel */}
                  <div className="bg-[#09090b] border border-zinc-800 rounded-3xl overflow-hidden flex flex-col min-h-[500px] shadow-2xl">
                    <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-600/20 text-purple-400 p-2 rounded-xl">
                          <Bot size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">Gemini Insight Core</h3>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">Automated Analysis</p>
                        </div>
                      </div>
                      <button 
                        onClick={async () => {
                          setIsAnalyzing(true);
                          const result = await analyzeFindings(findings);
                          setAiAnalysis(result);
                          setIsAnalyzing(false);
                        }}
                        disabled={isAnalyzing || findings.length === 0}
                        className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-[10px] font-black px-4 py-2 rounded-xl transition-all uppercase tracking-widest border border-zinc-700"
                      >
                        Analyze
                      </button>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto">
                      {aiAnalysis ? (
                        <div className="text-zinc-400 text-xs terminal-font leading-relaxed whitespace-pre-wrap">
                          {aiAnalysis}
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                          <Bot size={48} className="text-zinc-800 mb-4" />
                          <h4 className="text-zinc-500 font-bold mb-2">Awaiting Intelligence Batch</h4>
                          <p className="text-zinc-600 text-[11px] max-w-[200px]">
                            Once findings are populated, Gemini can perform a prioritized remediation strategy analysis.
                          </p>
                        </div>
                      )}
                    </div>
                    {isAnalyzing && (
                      <div className="p-4 bg-indigo-600/10 border-t border-indigo-500/20 flex items-center gap-3">
                        <RefreshCw size={14} className="text-indigo-400 animate-spin" />
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Generating Strategy...</span>
                      </div>
                    )}
                  </div>

                  {/* Plugin Pipeline Monitor */}
                  <div className="bg-[#09090b] border border-zinc-800 rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Orchestration Pipeline</h3>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-800 text-[9px] text-zinc-500 font-bold uppercase">
                        <Layers size={10} />
                        {TOOLS.length} Units
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {TOOLS.map((tool, idx) => {
                        const statusText = getToolStatus(idx);
                        const styles = getStatusStyles(statusText);
                        const toolProgress = getToolProgress(idx);
                        
                        return (
                          <div key={tool.name} className="relative group p-4 rounded-2xl bg-zinc-950 border border-zinc-800/50 hover:border-zinc-700 transition-all overflow-hidden">
                            {/* Individual Tool Progress Bar Background */}
                            {statusText === 'RUNNING' && (
                              <div 
                                className="absolute bottom-0 left-0 h-0.5 bg-indigo-500/40 transition-all duration-300" 
                                style={{ width: `${toolProgress}%` }} 
                              />
                            )}
                            
                            <div className="flex items-start justify-between relative z-10 mb-2">
                              <div className="flex gap-3">
                                <div className={`mt-1 p-2 rounded-lg ${statusText === 'RUNNING' ? 'bg-indigo-600/20 text-indigo-400' : 'bg-zinc-900 text-zinc-600'}`}>
                                  {tool.icon}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-sm font-bold transition-colors ${statusText === 'RUNNING' ? 'text-white' : 'text-zinc-400'}`}>
                                      {tool.name}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-zinc-600 font-medium">
                                    {tool.desc}
                                  </div>
                                </div>
                              </div>
                              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black tracking-widest transition-all ${styles.bg}`}>
                                {styles.icon}
                                {statusText}
                              </div>
                            </div>

                            {/* Tool Detail Info when active */}
                            {statusText === 'RUNNING' && (
                              <div className="mt-3 flex items-center justify-between text-[9px] font-bold text-indigo-400/60 uppercase tracking-tighter">
                                <span className="animate-pulse">Processing metadata...</span>
                                <span>{Math.floor(toolProgress)}%</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <FindingsTable findings={findings} />
            </>
          )}

          {activeTab === 'findings' && <FindingsTable findings={findings} />}
          
          {activeTab === 'reports' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <Download size={48} className="text-zinc-800 mb-6" />
              <h2 className="text-2xl font-bold mb-2">Ready to Export Results?</h2>
              <p className="text-zinc-500 mb-8 max-w-md">
                Generate a professional PDF report containing the executive summary, tool-wise breakdown, and technical findings suitable for board-level review.
              </p>
              <button 
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-indigo-500/20 flex items-center gap-3 transition-all"
                onClick={() => alert('Generating PDF Report...')}
              >
                <Download size={20} /> Download Enterprise PDF
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color, icon }: any) => {
  const colors: any = {
    red: 'bg-red-500/10 text-red-500 border-red-500/20',
    orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    zinc: 'bg-zinc-800/30 text-zinc-400 border-zinc-800',
  };

  return (
    <div className={`p-6 rounded-3xl border transition-all hover:scale-[1.02] cursor-default bg-[#09090b] ${colors[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-2xl bg-zinc-950/50">
          {icon}
        </div>
        <div className="text-3xl font-black tracking-tighter">
          {value}
        </div>
      </div>
      <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
        {label}
      </div>
    </div>
  );
};

export default App;
