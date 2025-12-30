
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
  FileText,
  Network,
  Fingerprint,
  Link,
  Lock,
  Eye,
  Crosshair,
  ShieldCheck,
  Cloud,
  Key,
  Scan,
  Server,
  FlaskConical,
  Target
} from 'lucide-react';
import { 
  Severity, 
  ScanStatus, 
  Finding, 
  EventMessage,
  ScanSession,
  Confidence,
  LogEntry,
  ToolCategory
} from './types';
import { SAMPLE_TARGETS, SEVERITY_COLORS } from './constants';
import LiveTerminal from './components/LiveTerminal';
import FindingsTable from './components/FindingsTable';
import DashboardStats from './components/DashboardStats';
import VulnerabilityDetailModal from './components/VulnerabilityDetailModal';
import AttackSurfaceMap from './components/AttackSurfaceMap';
import { analyzeFindings } from './services/geminiService';

const TOOLS: { name: string; icon: React.ReactNode; desc: string; category: ToolCategory }[] = [
  { name: 'VirusTotal', icon: <Fingerprint size={16} />, desc: 'Threat Intel & Reputation', category: 'recon' },
  { name: 'Amass', icon: <Globe size={16} />, desc: 'In-depth DNS Mapping', category: 'recon' },
  { name: 'Masscan', icon: <Scan size={16} />, desc: 'High-Velocity Port Sweep', category: 'network' },
  { name: 'Nmap-NSE', icon: <Cpu size={16} />, desc: 'Deep Service Fingerprinting', category: 'network' },
  { name: 'ZAP-API', icon: <Zap size={16} />, desc: 'API Security Testing', category: 'web' },
  { name: 'Nikto', icon: <Server size={16} />, desc: 'Web Server Misconfig Audit', category: 'web' },
  { name: 'Sqlmap', icon: <FlaskConical size={16} />, desc: 'DB Exploitation & Injection', category: 'fuzzing' },
  { name: 'Nuclei', icon: <Activity size={16} />, desc: 'CVE Template Matching', category: 'web' },
  { name: 'Gitleaks', icon: <Key size={16} />, desc: 'Secret & Credential Discovery', category: 'recon' },
  { name: 'Kube-Hunter', icon: <Cloud size={16} />, desc: 'K8s Cluster Auditing', category: 'cloud' },
  { name: 'Checkov', icon: <ShieldCheck size={16} />, desc: 'IaC Security Scanning', category: 'cloud' },
];

const App: React.FC = () => {
  const [session, setSession] = useState<ScanSession>({
    id: 'ENT-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
    target: 'hq.enterprise-defense.com',
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
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  const timerRef = useRef<number | null>(null);

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
        timestamp: new Date().toISOString()
      };
      setFindings(prev => [newFinding, ...prev]);
      setSession(s => ({ ...s, findings_count: s.findings_count + 1 }));
    }
  }, [session.id]);

  const startScan = () => {
    setShowConfig(false);
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
      const currentProgress = Math.min(step * 1.05, 100);
      setSession(s => ({ ...s, progress: currentProgress }));

      // PHASE 1: INTELLIGENCE & RECON (0-25%)
      if (step === 2) simulateEvent('log', { plugin: 'core', message: 'Mission Context Initialized. Target Scope: hq.enterprise-defense.com', level: 'info' });
      if (step === 5) simulateEvent('log', { plugin: 'recon', message: 'Subfinder: Active subdomain enumeration via passive datasets...', level: 'info' });
      if (step === 8) simulateEvent('log', { plugin: 'recon', message: 'Amass: Correlating DNS records with WHOIS data...', level: 'info' });
      if (step === 10) {
        simulateEvent('finding', { 
          tool: 'Amass', category: 'recon', severity: Severity.INFO, 
          title: 'Unlisted Staging Subdomain Found', 
          description: 'Discovered dev-staging.enterprise-defense.com via cert transparency logs.',
          confidence: Confidence.HIGH, target: 'dev-staging.enterprise-defense.com'
        });
      }
      if (step === 15) simulateEvent('log', { plugin: 'recon', message: 'Gitleaks: Checking GitHub/GitLab for leaked .env files...', level: 'info' });
      if (step === 20) {
        simulateEvent('finding', { 
          tool: 'Gitleaks', category: 'recon', severity: Severity.CRITICAL, 
          title: 'Hardcoded SSH Private Key', 
          description: 'A build script on public-facing CDN leaked an RSA private key for the dev jumpbox.',
          confidence: Confidence.HIGH, target: 'cdn.enterprise-defense.com'
        });
      }

      // PHASE 2: ATTACK SURFACE ENUMERATION (25-50%)
      if (step === 25) simulateEvent('log', { plugin: 'network', message: 'Masscan: SYN Scanning 65535 ports at 50,000 pps...', level: 'info' });
      if (step === 30) simulateEvent('log', { plugin: 'network', message: 'Nmap: Detected Open Ports: 22, 80, 443, 3306, 5432, 8080.', level: 'success' });
      if (step === 35) simulateEvent('log', { plugin: 'network', message: 'Nmap-NSE: Executing default vulnerability scripts (http-enum, ssl-cert)...', level: 'info' });
      if (step === 38) {
        simulateEvent('finding', { 
          tool: 'Nmap-NSE', category: 'network', severity: Severity.HIGH, 
          title: 'Unencrypted MySQL Protocol', 
          description: 'Port 3306 is open to external traffic and accepting connections without TLS forcing.',
          confidence: Confidence.HIGH, target: 'db-master.internal.lan'
        });
      }

      // PHASE 3: ACTIVE EXPLOITATION RESEARCH (50-75%)
      if (step === 50) simulateEvent('log', { plugin: 'web', message: 'Nikto: Identified legacy Telerik UI library on /admin endpoint.', level: 'warning' });
      if (step === 55) simulateEvent('log', { plugin: 'fuzzing', message: 'Sqlmap: Testing blind injection on search parameters...', level: 'info' });
      if (step === 60) {
        simulateEvent('finding', { 
          tool: 'Sqlmap', category: 'fuzzing', severity: Severity.CRITICAL, 
          title: 'Second-Order SQL Injection', 
          description: 'Vulnerability in user profile update allows arbitrary DB queries via username field.',
          confidence: Confidence.HIGH, target: 'auth.enterprise-defense.com'
        });
      }
      if (step === 65) simulateEvent('log', { plugin: 'web', message: 'Nuclei: Running 2024 CVE Template Library...', level: 'info' });
      if (step === 70) {
        simulateEvent('finding', { 
          tool: 'Nuclei', category: 'web', severity: Severity.HIGH, 
          title: 'CVE-2024-21887: Ivanti Connect Secure RCE', 
          description: 'Detected vulnerable VPN appliance endpoint allowing command injection.',
          confidence: Confidence.MEDIUM, target: 'vpn.enterprise-defense.com'
        });
      }

      // PHASE 4: CLOUD & POST-EXPLOITATION (75-100%)
      if (step === 80) simulateEvent('log', { plugin: 'cloud', message: 'Checkov: Analyzing Terraform state files found on exposed S3 bucket.', level: 'info' });
      if (step === 85) simulateEvent('log', { plugin: 'cloud', message: 'Kube-Hunter: Mapping Kubernetes cluster internal networking...', level: 'info' });
      if (step === 90) {
        simulateEvent('finding', { 
          tool: 'Kube-Hunter', category: 'cloud', severity: Severity.HIGH, 
          title: 'Privileged Container Found', 
          description: 'Logging pod running with --privileged flag, allowing node-level escape.',
          confidence: Confidence.HIGH, target: 'k8s-cluster.prod.local'
        });
      }

      if (step >= 96) {
        if (timerRef.current) clearInterval(timerRef.current);
        setSession(s => ({ ...s, status: ScanStatus.COMPLETED, progress: 100 }));
        simulateEvent('log', { plugin: 'core', message: 'Full Mission Telemetry Aggregated. 12 High/Critical findings identified.', level: 'success' });
      }
    }, 500);
  };

  const stopScan = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSession(s => ({ ...s, status: ScanStatus.IDLE, progress: 0 }));
    simulateEvent('log', { plugin: 'core', message: 'Emergency Brake Protocol Active. Data persisted to SQLite.', level: 'warning' });
  };

  const getToolStatus = (idx: number) => {
    const range = 100 / TOOLS.length;
    const start = idx * range;
    const end = (idx + 1) * range;
    if (session.status === ScanStatus.IDLE) return 'QUEUED';
    if (session.progress >= end) return 'COMPLETED';
    if (session.progress > start && session.progress < end) return 'RUNNING';
    return 'QUEUED';
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'RUNNING': return { bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30', icon: <RefreshCw size={10} className="animate-spin" /> };
      case 'COMPLETED': return { bg: 'bg-green-500/10 text-green-500 border-green-500/30', icon: <CheckCircle2 size={10} /> };
      default: return { bg: 'bg-zinc-900 text-zinc-600 border-zinc-800', icon: <Clock size={10} /> };
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
            <span className="font-black text-lg tracking-tight uppercase tracking-tighter">Pentest-Pro</span>
          </div>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-indigo-600/10 text-indigo-400 font-bold border border-indigo-500/20 shadow-inner' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'}`}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button onClick={() => setActiveTab('findings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'findings' ? 'bg-indigo-600/10 text-indigo-400 font-bold border border-indigo-500/20 shadow-inner' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'}`}>
            <AlertCircle size={18} /> Vulnerabilities
          </button>
          <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'reports' ? 'bg-indigo-600/10 text-indigo-400 font-bold border border-indigo-500/20 shadow-inner' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'}`}>
            <Download size={18} /> PDF Reports
          </button>
          <div className="pt-6 pb-2 px-4 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Operations</div>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800/50 transition-colors">
            <Target size={18} /> Scope Manager
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800/50 transition-colors">
            <Settings size={18} /> Engine Config
          </button>
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="text-xs font-bold text-zinc-400">Node US-W-1: ACTIVE</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-600 uppercase font-black">
              <span>LATENCY: 8ms</span>
              <span>IO: 450MB/s</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
              <input type="text" placeholder="Search target assets..." className="bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm w-full focus:border-indigo-500/50 outline-none transition-all" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 px-4 py-2 rounded-xl">
              <span className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Scoped Target</span>
              <span className="text-sm font-bold text-indigo-400 truncate max-w-[200px]">{session.target}</span>
            </div>
            <button className="p-2 text-zinc-400 hover:text-white relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-zinc-950" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
          {activeTab === 'overview' && (
            <>
              {/* Stat Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Critical/High" value={findings.filter(f => f.severity === Severity.CRITICAL || f.severity === Severity.HIGH).length} color="red" icon={<Shield size={24} />} />
                <StatCard label="Infrastructure Nodes" value={new Set(findings.map(f => f.target)).size + 1} color="orange" icon={<Globe size={24} />} />
                <StatCard label="Scan Velocity" value={`${Math.floor(session.progress)}%`} color="indigo" icon={<Zap size={24} />} />
                <StatCard label="Events Streamed" value={logs.length} color="zinc" icon={<Terminal size={24} />} />
              </div>

              {/* Main Visualization Row */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <AttackSurfaceMap findings={findings} target={session.target} />
                    <LiveTerminal logs={logs} />
                  </div>
                  <DashboardStats findings={findings} />
                </div>
                <div className="space-y-8">
                  {/* Gemini Intelligence Hub */}
                  <div className="bg-[#09090b] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
                    <div className="p-6 border-b border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
                      <div className="flex gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-xl">
                          <Bot className="text-purple-400" size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">Gemini AI Engine</h3>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">Automated Exploit Chaining</p>
                        </div>
                      </div>
                      <button 
                        onClick={async () => {
                          setIsAnalyzing(true);
                          const res = await analyzeFindings(findings);
                          setAiAnalysis(res);
                          setIsAnalyzing(false);
                        }} 
                        disabled={isAnalyzing || findings.length === 0} 
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-[10px] font-black px-4 py-2 rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                      >
                        {isAnalyzing ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
                        Analyze
                      </button>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto scrollbar-thin">
                      {aiAnalysis ? (
                        <div className="text-zinc-300 text-xs terminal-font leading-relaxed whitespace-pre-wrap animate-in fade-in slide-in-from-bottom-2">
                          {aiAnalysis}
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                          <Bot size={48} className="mb-4 animate-bounce duration-1000" />
                          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-400">Stream finding telemetry to start AI Correlation</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Execution Control & Monitor */}
                  <div className="bg-[#09090b] border border-zinc-800 rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-6 border-b border-zinc-800/50 pb-4">
                      <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Active Orchestrator</h3>
                      <button onClick={() => setShowConfig(!showConfig)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors">
                        <Settings size={14} />
                      </button>
                    </div>

                    {showConfig ? (
                      <div className="space-y-4 mb-6 animate-in slide-in-from-top-4 duration-300">
                        <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                          <label className="text-[10px] font-black uppercase text-zinc-500 block mb-2">Scan Intensity</label>
                          <div className="flex gap-2">
                            {['Stealth', 'Balanced', 'Aggressive'].map(opt => (
                              <button key={opt} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${opt === 'Balanced' ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400' : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:border-zinc-700'}`}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                          <span className="text-[10px] font-black uppercase text-zinc-500">Enable Cloud Audits</span>
                          <div className="w-10 h-5 bg-indigo-600 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 h-[250px] overflow-y-auto scrollbar-thin pr-2 mb-6">
                        {TOOLS.map((tool, idx) => {
                          const status = getToolStatus(idx);
                          const styles = getStatusStyles(status);
                          return (
                            <div key={tool.name} className={`p-4 rounded-2xl border transition-all duration-300 ${status === 'RUNNING' ? 'bg-indigo-500/5 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.05)] scale-[1.02]' : 'bg-zinc-950 border-zinc-800/50 opacity-60'}`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-xl ${status === 'RUNNING' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-900 text-zinc-600'}`}>{tool.icon}</div>
                                  <div>
                                    <div className={`text-sm font-bold ${status === 'RUNNING' ? 'text-white' : 'text-zinc-300'}`}>{tool.name}</div>
                                    <div className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">{tool.category}</div>
                                  </div>
                                </div>
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[8px] font-black tracking-widest transition-all ${styles.bg}`}>
                                  {styles.icon} {status}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    <button 
                      onClick={session.status === ScanStatus.RUNNING ? stopScan : startScan} 
                      className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 ${session.status === ScanStatus.RUNNING ? 'bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600/20 shadow-red-500/5' : 'bg-indigo-600 text-white shadow-indigo-500/20 hover:bg-indigo-500'}`}
                    >
                      {session.status === ScanStatus.RUNNING ? <><Square size={14} /> HALT MISSION</> : <><Play size={14} /> COMMENCE ENGAGEMENT</>}
                    </button>
                  </div>
                </div>
              </div>

              <FindingsTable findings={findings} onSelectFinding={setSelectedFinding} />
            </>
          )}

          {activeTab === 'findings' && <FindingsTable findings={findings} onSelectFinding={setSelectedFinding} />}
          
          {activeTab === 'reports' && (
             <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-16 text-center animate-in zoom-in-95 duration-300 shadow-2xl">
               <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-zinc-800 shadow-inner">
                <FileText size={40} className="text-zinc-500" />
               </div>
               <h2 className="text-3xl font-black mb-4 tracking-tight">Enterprise Artifact Package</h2>
               <p className="text-zinc-500 max-w-md mx-auto mb-10 text-sm leading-relaxed">
                 Generate an executive-ready forensic dossier including detailed attack chain maps, raw technical evidence, and prioritized remediation playbooks.
               </p>
               <button className="bg-white text-black px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 active:scale-95">
                 Export Dossier
               </button>
             </div>
          )}
        </main>
      </div>

      {selectedFinding && (
        <VulnerabilityDetailModal 
          finding={selectedFinding} 
          onClose={() => setSelectedFinding(null)} 
        />
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
        <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800/50 group-hover:border-zinc-700 transition-colors">{icon}</div>
        <div className="text-5xl font-black tracking-tighter">{value}</div>
      </div>
      <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{label}</div>
    </div>
  );
};

export default App;
