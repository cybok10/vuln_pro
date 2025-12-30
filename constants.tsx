
import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  ShieldQuestion, 
  Info, 
  AlertTriangle 
} from 'lucide-react';
import { Severity } from './types';

export const SEVERITY_COLORS: Record<Severity, string> = {
  [Severity.CRITICAL]: 'text-red-500 bg-red-500/10 border-red-500/20',
  [Severity.HIGH]: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  [Severity.MEDIUM]: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  [Severity.LOW]: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  [Severity.INFO]: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20',
};

export const SEVERITY_ICONS: Record<Severity, React.ReactNode> = {
  [Severity.CRITICAL]: <ShieldAlert size={16} />,
  [Severity.HIGH]: <AlertTriangle size={16} />,
  [Severity.MEDIUM]: <ShieldQuestion size={16} />,
  [Severity.LOW]: <ShieldCheck size={16} />,
  [Severity.INFO]: <Info size={16} />,
};

export const SAMPLE_TARGETS = [
  'api.enterprise-corp.com',
  'staging.enterprise-corp.com',
  'internal-auth.dev',
  'vpn-east.enterprise-corp.com'
];
