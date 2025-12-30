
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  Search,
  Settings,
  Bell,
  Globe,
  Zap,
  Clock,
  Key,
  Scan,
  Server,
  FlaskConical,
  Target,
  Hash,
  Box,
  Save,
  Trash2,
  HardDrive,
  Cloud,
  ShieldCheck,
  Fingerprint,
  ChevronRight,
  ChevronDown,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { 
  Severity, 
  ScanStatus, 
  Finding, 
  ScanSession,
  Confidence,
  LogEntry,
  ToolCategory,
  SystemHealth
} from './types';
import LiveTerminal from './components/LiveTerminal';
import FindingsTable from './components/FindingsTable';
import DashboardStats from './components/DashboardStats';
import VulnerabilityDetailModal from './components/VulnerabilityDetailModal';
import AttackSurfaceMap from './components/AttackSurfaceMap';
import NetworkPerfGraph from './components/NetworkPerfGraph';
import { analyzeFindings } from './services/geminiService';

const TOOLS: { name: string; icon: React.ReactNode; desc: string; category: ToolCategory; options?: string[] }[] = [
  { name: 'VirusTotal', icon: <Fingerprint size={16} />, desc: 'Threat Intel & Reputation', category: 'recon' },
  { name: 'Amass', icon: <Globe size={16} />, desc: 'In-depth DNS Mapping', category: 'recon' },
  { name: 'Subfinder', icon: <Search size={16} />, desc: 'Passive Subdomain Discovery', category: 'recon' },
  { name: 'Masscan', icon: <Scan size={16} />, desc: 'High-Velocity Port Sweep', category: 'network' },
  { name: 'Nmap-NSE', icon: <Cpu size={16} />, desc: 'Deep Service Fingerprinting', category: 'network' },
  { name: 'ZAP-API', icon: <Zap size={16} />, desc: 'API Security Testing', category: 'web' },
  { name: 'Nikto', icon: <Server size={16} />, desc: 'Web Server Misconfig Audit', category: 'web' },
  { 
    name: 'Sqlmap', 
    icon: <FlaskConical size={16} />, 
    desc: 'DB Exploitation & Injection', 
    category: 'fuzzing',
    options: ['--batch', '--level', '--risk', '--threads', '--dbs']
  },
  { name: 'Nuclei', icon: <Activity size={16} />, desc: 'CVE Template Matching', category: 'web' },
  { name: 'Gitleaks', icon: <Key size={16} />, desc: 'Secret & Credential Discovery', category: 'recon' },
  { name: 'Kube-Hunter', icon: <Cloud size={16} />, desc: 'K8s Cluster Auditing', category: 'cloud' },
  { name: 'Checkov', icon: <ShieldCheck size={16} />, desc: 'IaC Security Scanning', category: 'cloud' },
];

const NMAP_PROFILES = {
  'Standard': '-sV -sC',
  'Aggressive': '-A -T4',
  'Vuln-Audit': '-sV --script vuln',
  'Stealth': '-sS -Pn -T2'
};

const App: React.FC = () => {
  // --- STATE ---
  const [targetInput, setTargetInput] = useState('hq.enterprise-defense.com');
  const [sessionName, setSessionName] = useState('Quarterly Audit Alpha');
  const [nmapProfile, setNmapProfile] = useState('Aggressive');
  const [portRange, setPortRange] = useState('1-1000');
  const [intensity, setIntensity] = useState<'Stealth' | 'Balanced' | 'Aggressive'>('Balanced');
  
  // SQLMap Specific Config
  const [sqlmapConfig, setSqlmapConfig] = useState({
    batch: true,
    level: 3,
    risk: 2,
    threads: 10
  });

  const [session, setSession] = useState<ScanSession>({
    id: 'ENT-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
    name: sessionName,
    target: targetInput,
    status: ScanStatus.IDLE,
    progress: 0,
    start_time: '',
    findings_count: 0,
    config: { nmapProfile, portRange, intensity }
  });

  const [findings, setFindings] = useState<Finding[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'findings' | 'reports'>('overview');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  const [health, setHealth] = useState<SystemHealth>({
    cpu_usage: 12, mem_usage: 24, workers_active: 4, db_status: 'online', throughput: 0
  });

  const [perfHistory, setPerfHistory] = useState<{ time: string; throughput: number; latency: number }[]>([]);

  // --- REFS ---
  const timerRef = useRef<number | null>(null);

  // --- PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('pentest_pro_session');
    if (saved) {
      // resume logic if needed
    }
  }, []);

  // --- SIMULATION LOGIC ---
  const simulateEvent = useCallback((type: 'log' | 'finding', data: any) => {
    if (type === 'log') {
      setLogs(prev => [...prev.slice(-150), { 
        ...data, 
        id: Math.random().toString(36), 
        timestamp: new Date().toLocaleTimeString() 
      } as LogEntry]);
    } else if (type === 'finding') {
      const newFinding: Finding = {
        ...data,
        id: 'FIND-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
        plugin: data.tool,
        scan_id: session.id,
        timestamp: new Date().toISOString(),
        status: 'open'
      };
      setFindings(prev => [newFinding, ...prev]);
      setSession(s => ({ ...s, findings_count: s.findings_count + 1 }));
    }
  }, [session.id]);

  useEffect(() => {
    if (session.status === ScanStatus.RUNNING) {
      const interval = setInterval(() => {
        setHealth(h => ({
          ...h,
          cpu_usage: 30 + Math.random() * 40,
          mem_usage: 45 + Math.random() * 10,
          throughput: 200 + Math.random() * 800
        }));
        setPerfHistory(prev => [...prev.slice(-20), { 
          time: new Date().toLocaleTimeString(), 
          throughput: 200 + Math.random() * 800,
          latency: 5 + Math.random() * 15
        }]);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setHealth(h => ({ ...h, throughput: 0, cpu_usage: 12 }));
    }
  }, [session.status]);

  const startScan = () => {
    setShowConfig(false);
    setSession(s => ({ 
      ...s, 
      status: ScanStatus.RUNNING, 
      target: targetInput,
      name: sessionName,
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
      const currentProgress = Math.min(step * 1.05, 100);
      setSession(s => ({ ...s, progress: currentProgress }));

      // CORE SYSTEM BOOT
      if (step === 1) simulateEvent('log', { plugin: 'core', message: 'FastAPI Orchestrator: Initializing session context via Pydantic schemas.', level: 'info' });
      if (step === 3) simulateEvent('log', { plugin: 'db', message: 'SQLModel: Verifying database migrations for session storage.', level: 'success' });
      
      // RECON
      if (step === 5) simulateEvent('log', { plugin: 'recon', message: 'Asyncio: Spawning 4 parallel Subfinder subprocesses.', level: 'info' });
      if (step === 10) {
        simulateEvent('finding', { 
          tool: 'Amass', category: 'recon', severity: Severity.INFO, 
          title: 'Unlisted Subdomain Discovered', 
          description: `Identified vpn-internal.${targetInput} via passive DNS correlation.`,
          confidence: Confidence.HIGH, target: `vpn-internal.${targetInput}`
        });
      }

      // NETWORK
      if (step === 25) simulateEvent('log', { plugin: 'network', message: `Engine: Loading Nmap Profile [${nmapProfile}] into worker pool.`, level: 'info' });
      if (step === 30) simulateEvent('log', { plugin: 'network', message: `Masscan: High-efficiency sweep active. Target Range: ${portRange}`, level: 'info' });
      
      if (step === 38) {
        simulateEvent('finding', { 
          tool: 'Nmap-NSE', category: 'network', severity: Severity.HIGH, 
          title: 'Exposed Management Interface', 
          description: 'Port 8443 (Docker Swarm) detected with default credentials or no auth.',
          confidence: Confidence.MEDIUM, target: targetInput
        });
      }

      // WEB / FUZZING
      if (step === 50) {
        const sqlFlags = `--batch=${sqlmapConfig.batch} --level=${sqlmapConfig.level} --risk=${sqlmapConfig.risk} --threads=${sqlmapConfig.threads}`;
        simulateEvent('log', { plugin: 'fuzzing', message: `Sqlmap: Injecting Boolean-based payloads. Techniques: ${sqlFlags}`, level: 'warning' });
      }
      if (step === 60) {
        simulateEvent('finding', { 
          tool: 'Nuclei', category: 'web', severity: Severity.CRITICAL, 
          title: 'Remote Code Execution (CVE-2024-XXXX)', 
          description: 'Vulnerability in legacy template engine allows execution of arbitrary Python code.',
          confidence: Confidence.HIGH, target: `api.${targetInput}`
        });
      }

      if (step >= 96) {
        if (timerRef.current) clearInterval(timerRef.current);
        setSession(s => ({ ...s, status: ScanStatus.COMPLETED, progress: 100 }));
        simulateEvent('log', { plugin: 'core', message: 'Orchestrator: Tasks completed. Persisting artifacts to Redis/SQLite.', level: 'success' });
        localStorage.setItem('pentest_pro_session', JSON.stringify({ ...session, status: ScanStatus.COMPLETED }));
      }
    }, 500);
  };

  const stopScan = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSession(s => ({ ...s, status: ScanStatus.IDLE, progress: 0 }));
    simulateEvent('log', { plugin: 'core', message: 'SIGTERM: Gracefully terminating Python worker processes.', level: 'warning' });
  };

  // --- UI RENDER ---
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
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-indigo-600/10 text-indigo-400 font-bold border border-indigo-500/20' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'}`}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button onClick={() => setActiveTab('findings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'findings' ? 'bg-indigo-600/10 text-indigo-400 font-bold border border-indigo-500/20' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'}`}>
            <AlertCircle size={18} /> Vulnerabilities
          </button>
          <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'reports' ? 'bg-indigo-600/10 text-indigo-400 font-bold border border-indigo-500/20' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'}`}>
            <Download size={18} /> Artifacts
          </button>
          
          <div className="pt-6 pb-2 px-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Environment</div>
          <div className="px-4 space-y-4">
            <HealthIndicator label="Engine CPU" value={health.cpu_usage} color="indigo" />
            <HealthIndicator label="Memory" value={health.mem_usage} color="purple" />
            <div className="flex justify-between items-center bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <span className="text-[10px] font-bold text-zinc-500">DB: {health.db_status.toUpperCase()}</span>
              <div className={`h-2 w-2 rounded-full ${health.db_status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            </div>
          </div>
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <button className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:bg-zinc-800 transition-all">
            <Save size={14} /> SAVE WORKSPACE
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-28 border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-6 flex-1 max-w-4xl">
             <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Box size={14} className="text-zinc-500" />
                    <input 
                      value={sessionName}
                      onChange={(e) => setSessionName(e.target.value)}
                      placeholder="Session Name"
                      className="bg-transparent border-none outline-none text-[10px] font-black uppercase text-zinc-300 tracking-widest focus:text-indigo-400 w-48"
                    />
                  </div>
                  <div className="h-4 w-[1px] bg-zinc-800" />
                  <div className="flex items-center gap-2 flex-1">
                    <Target size={14} className="text-indigo-500" />
                    <input 
                      value={targetInput}
                      onChange={(e) => setTargetInput(e.target.value)}
                      disabled={session.status === ScanStatus.RUNNING}
                      placeholder="Target URL (e.g. hq.enterprise.com)"
                      className="bg-transparent border-none outline-none text-xs font-bold text-zinc-400 focus:text-indigo-400 w-full"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-tighter ${session.status === ScanStatus.RUNNING ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 animate-pulse' : 'bg-zinc-900 text-zinc-600 border-zinc-800'}`}>
                    {session.status}
                  </div>
                  <span className="text-[10px] font-bold text-zinc-600 terminal-font">ID: {session.id}</span>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-bold text-white tracking-tight">Active Workers: {health.workers_active}</div>
              <div className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter">FastAPI Core v3.1</div>
            </div>
            <button className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-white transition-all">
              <Settings size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
          {activeTab === 'overview' && (
            <>
              {/* Stats & Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Exploit Chains" value={findings.filter(f => f.severity === Severity.CRITICAL).length} color="red" icon={<FlaskConical size={24} />} />
                <StatCard label="Active Nodes" value={new Set(findings.map(f => f.target)).size + (session.status === ScanStatus.RUNNING ? 1 : 0)} color="orange" icon={<Globe size={24} />} />
                <StatCard label="Bandwidth" value={`${Math.floor(health.throughput)} Mbps`} color="indigo" icon={<Zap size={24} />} />
                <StatCard label="Events" value={logs.length} color="zinc" icon={<Activity size={24} />} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <AttackSurfaceMap findings={findings} target={session.target} />
                    <NetworkPerfGraph data={perfHistory} />
                  </div>
                  <LiveTerminal logs={logs} />
                </div>
                
                {/* Control Hub */}
                <div className="space-y-8">
                  <div className="bg-[#09090b] border border-zinc-800 rounded-3xl p-6 shadow-xl sticky top-8">
                    <div className="flex items-center justify-between mb-6 border-b border-zinc-800/50 pb-4">
                      <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Execution Panel</h3>
                      <button onClick={() => setShowConfig(!showConfig)} className={`p-2 rounded-lg transition-colors ${showConfig ? 'bg-indigo-600 text-white' : 'hover:bg-zinc-800 text-zinc-500'}`}>
                        <Settings size={14} />
                      </button>
                    </div>

                    {showConfig ? (
                      <div className="space-y-4 mb-6 animate-in slide-in-from-top-4 overflow-y-auto max-h-[400px] scrollbar-thin pr-1">
                        <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                          <label className="text-[10px] font-black uppercase text-zinc-500 block mb-3">Nmap Strategy</label>
                          <select 
                            value={nmapProfile} 
                            onChange={(e) => setNmapProfile(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs w-full outline-none focus:border-indigo-500 text-zinc-300 font-bold"
                          >
                            {Object.keys(NMAP_PROFILES).map(k => <option key={k} value={k}>{k}</option>)}
                          </select>
                        </div>
                        
                        <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                          <label className="text-[10px] font-black uppercase text-zinc-500 block mb-3">Target Port Range</label>
                          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1">
                            <Hash size={12} className="text-zinc-500" />
                            <input 
                              value={portRange} 
                              onChange={(e) => setPortRange(e.target.value)}
                              className="bg-transparent border-none outline-none text-xs text-indigo-400 font-bold w-full"
                            />
                          </div>
                        </div>

                        {/* SQLMap Advanced Tech Config */}
                        <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                          <div className="flex items-center gap-2 mb-4">
                            <FlaskConical size={14} className="text-indigo-400" />
                            <label className="text-[10px] font-black uppercase text-zinc-500 block">SQLMap Techniques</label>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-zinc-400">Batch Mode (--batch)</span>
                              <button 
                                onClick={() => setSqlmapConfig(c => ({...c, batch: !c.batch}))}
                                className={`transition-colors ${sqlmapConfig.batch ? 'text-indigo-500' : 'text-zinc-700'}`}
                              >
                                {sqlmapConfig.batch ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                              </button>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                                <span>Detection Level</span>
                                <span className="text-indigo-400">{sqlmapConfig.level}</span>
                              </div>
                              <input 
                                type="range" min="1" max="5" 
                                value={sqlmapConfig.level}
                                onChange={(e) => setSqlmapConfig(c => ({...c, level: parseInt(e.target.value)}))}
                                className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                                <span>Risk Level</span>
                                <span className="text-indigo-400">{sqlmapConfig.risk}</span>
                              </div>
                              <input 
                                type="range" min="1" max="3" 
                                value={sqlmapConfig.risk}
                                onChange={(e) => setSqlmapConfig(c => ({...c, risk: parseInt(e.target.value)}))}
                                className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                                <span>Thread Count</span>
                                <span className="text-indigo-400">{sqlmapConfig.threads}</span>
                              </div>
                              <input 
                                type="range" min="1" max="10" 
                                value={sqlmapConfig.threads}
                                onChange={(e) => setSqlmapConfig(c => ({...c, threads: parseInt(e.target.value)}))}
                                className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                          <label className="text-[10px] font-black uppercase text-zinc-500 block mb-2">Engine Intensity</label>
                          <div className="flex gap-2">
                            {['Stealth', 'Balanced', 'Aggressive'].map(opt => (
                              <button key={opt} onClick={() => setIntensity(opt as any)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold border transition-all ${intensity === opt ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-6 space-y-4">
                        <div className="p-4 bg-indigo-600/5 border border-indigo-500/20 rounded-2xl">
                          <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Active Target</p>
                          <p className="text-xs font-bold text-white truncate">{targetInput}</p>
                        </div>
                        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
                          <p className="text-[10px] font-black text-zinc-500 uppercase mb-2">Engine Load</p>
                          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                             <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${session.progress}%` }} />
                          </div>
                          <div className="flex justify-between mt-2">
                             <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{Math.floor(session.progress)}% COMPLETED</span>
                             <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{findings.length} FINDINGS</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <button 
                      onClick={session.status === ScanStatus.RUNNING ? stopScan : startScan} 
                      className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 ${session.status === ScanStatus.RUNNING ? 'bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600/20 shadow-red-500/5' : 'bg-indigo-600 text-white shadow-indigo-500/20 hover:bg-indigo-500'}`}
                    >
                      {session.status === ScanStatus.RUNNING ? <><Square size={14} /> ABORT MISSION</> : <><Play size={14} /> LAUNCH ORCHESTRATOR</>}
                    </button>
                  </div>

                   {/* AI Intel Summary */}
                   <div className="bg-[#09090b] border border-zinc-800 rounded-3xl p-6 shadow-xl h-[300px] flex flex-col">
                      <div className="flex items-center gap-3 mb-6">
                        <Bot className="text-purple-400" size={20} />
                        <h3 className="text-sm font-bold">Gemini Intel Core</h3>
                      </div>
                      <div className="flex-1 overflow-y-auto terminal-font text-[11px] text-zinc-400 leading-relaxed scrollbar-thin pr-2">
                        {aiAnalysis || "Orchestrator online. Awaiting data for AI threat correlation."}
                      </div>
                      <button 
                         onClick={async () => { setIsAnalyzing(true); setAiAnalysis(await analyzeFindings(findings)); setIsAnalyzing(false); }}
                         className="mt-4 w-full py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-indigo-400 transition-all flex items-center justify-center gap-2"
                         disabled={isAnalyzing || findings.length === 0}
                      >
                         {isAnalyzing ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
                         {isAnalyzing ? "Synthesizing..." : "Manual Correlation"}
                      </button>
                   </div>
                </div>
              </div>

              <FindingsTable findings={findings} onSelectFinding={setSelectedFinding} />
            </>
          )}

          {activeTab === 'findings' && <FindingsTable findings={findings} onSelectFinding={setSelectedFinding} />}
        </main>
      </div>

      {selectedFinding && (
        <VulnerabilityDetailModal finding={selectedFinding} onClose={() => setSelectedFinding(null)} />
      )}
    </div>
  );
};

const StatCard = ({ label, value, color, icon }: any) => {
  const themes: any = {
    red: 'bg-red-500/5 text-red-500 border-red-500/20 shadow-red-500/5',
    orange: 'bg-orange-500/5 text-orange-500 border-orange-500/20 shadow-orange-500/5',
    indigo: 'bg-indigo-500/5 text-indigo-400 border-indigo-500/20 shadow-indigo-500/5',
    zinc: 'bg-zinc-800/10 text-zinc-500 border-zinc-800 shadow-none',
  };
  return (
    <div className={`p-6 rounded-3xl border shadow-xl flex flex-col transition-all hover:translate-y-[-4px] group ${themes[color]}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 group-hover:border-zinc-700 transition-colors">{icon}</div>
        <div className="text-3xl font-black tracking-tighter truncate">{value}</div>
      </div>
      <div className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</div>
    </div>
  );
};

const HealthIndicator = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-[10px] font-bold text-zinc-500">
      <span>{label}</span>
      <span>{Math.floor(value)}%</span>
    </div>
    <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
      <div className={`h-full bg-${color}-500 transition-all duration-500`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

export default App;
