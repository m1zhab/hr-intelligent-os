
export enum EmployeePattern {
  NORMAL = 'normal',
  BURNOUT = 'burnout',
  TALENT = 'hidden_talent'
}

export interface Metric {
  week: number;
  commits: number;
  meeting_hours: number;
  after_hours_sessions: number;
  code_reviews_given: number;
  prs_merged: number;
  messages_sent: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  hire_date: string;
  nationality: string;
  visa_expiry: string;
  pattern: EmployeePattern;
  metrics: Metric[];
  peer_signals?: string;
}

export interface AnalysisResult {
  score: number;
  level: 'Low' | 'Medium' | 'High' | 'Critical';
  signals: string[];
  actions: string[];
  summary: string;
}

export interface TalentResult {
  is_hidden_talent: boolean;
  confidence: number;
  evidence: string[];
  recommendation: string;
}

export enum AppView {
  DASHBOARD = 'dashboard',
  ONBOARDING = 'onboarding',
  INTERVIEW = 'interview',
  COMPLIANCE = 'compliance',
  PULSE = 'pulse',
  L_AND_D = 'l_and_d'
}

export enum AIProvider {
  ADVANCED = 'advanced',
  LOCAL = 'local'
}

export interface GroundingLink {
  uri: string;
  title: string;
}

export interface SalaryResearchResult {
  range: string;
  sources: GroundingLink[];
  insight: string;
}
