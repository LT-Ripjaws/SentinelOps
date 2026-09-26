export type UserRole = 'analyst' | 'manager';

export type SessionUser = {
  sub: string;
  email: string;
  role: UserRole;
  sid: string;
};

export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentStatus = 'Open' | 'Investigating' | 'Resolved' | 'Closed';

export type IncidentSummary = {
  _id: string;
  title: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;
  createdAt: string;
};

export type IncidentsResponse = {
  items: IncidentSummary[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type UserSummary = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type TimelineEvent = {
  action: string;
  field?: string;
  oldValue?: unknown;
  newValue?: unknown;
  by: string;
  at: string;
};

export type EvidenceType = 'screenshot' | 'log' | 'note';

export type EvidenceItem = {
  _id: string;
  type: EvidenceType;
  filePath: string;
  originalName: string;
  mimeType: string;
  size: number;
  note?: string;
  uploadedBy: UserSummary;
  uploadedAt: string;
};

export type IncidentDetail = IncidentSummary & {
  assignedTo: UserSummary;
  createdBy: UserSummary;
  updatedAt: string;
  resolvedAt?: string;
  timeline: TimelineEvent[];
};

export type DashboardStats = {
  totals: {
    open: number;
    closed: number;
    critical: number;
    avgResolutionHours: number;
  };
  bySeverity: Array<{ severity: Severity; count: number }>;
  byStatus: Array<{ status: IncidentStatus; count: number }>;
  monthlyTrend: Array<{ month: string; count: number }>;
};
