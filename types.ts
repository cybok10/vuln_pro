
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

/**
 * Log entry for the live terminal
 */
export interface LogEntry {
  id: string | number;
  timestamp: string;
  plugin: string;
  level: 'info' | 'error' | 'warning' | 'success';
  message: string;
}

/**
 * Mandatory Result Schema for all plugins
 */
export interface Finding {
  // Fix: Added unique identifier for the finding to resolve FindingsTable error
  id: string;
  scan_id: string;
  target: string;
  tool: string;
  // Fix: Added plugin property to match usage in FindingsTable
  plugin: string;
  category: 'recon' | 'web' | 'network' | 'fuzzing';
  type: 'vulnerability' | 'informational' | 'misconfiguration';
  severity: Severity;
  title: string;
  description: string;
  evidence?: string;
  confidence: Confidence;
  timestamp: string;
}

export interface EventMessage {
  type: 'log' | 'finding' | 'status_change';
  payload: any;
  timestamp: string;
}

export interface ScanSession {
  id: string;
  target: string;
  status: ScanStatus;
  progress: number;
  start_time: string;
  findings_count: number;
}
