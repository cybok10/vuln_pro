
export enum Severity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

export enum Confidence {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum ScanStatus {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export type ToolCategory = 'recon' | 'web' | 'network' | 'cloud' | 'fuzzing';

export interface LogEntry {
  id: string | number;
  timestamp: string;
  plugin: string;
  level: 'info' | 'error' | 'warning' | 'success';
  message: string;
}

export interface Finding {
  id: string;
  scan_id: string;
  target: string;
  tool: string;
  plugin: string;
  category: ToolCategory;
  type: 'vulnerability' | 'informational' | 'misconfiguration';
  severity: Severity;
  title: string;
  description: string;
  evidence?: string;
  confidence: Confidence;
  timestamp: string;
  status: 'open' | 'resolved' | 'risk_accepted';
}

export interface ScanSession {
  id: string;
  name: string;
  target: string;
  status: ScanStatus;
  progress: number;
  start_time: string;
  findings_count: number;
  config: {
    nmapProfile: string;
    portRange: string;
    intensity: 'Stealth' | 'Balanced' | 'Aggressive';
  };
}

export interface SystemHealth {
  cpu_usage: number;
  mem_usage: number;
  workers_active: number;
  db_status: 'online' | 'offline';
  throughput: number;
}
