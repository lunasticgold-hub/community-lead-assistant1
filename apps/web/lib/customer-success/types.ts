export type ProjectStatus = "pending_review" | "verified" | "rejected";
export type CustomerHealthStatus = "Healthy" | "Moderate" | "At Risk";

export type SuccessProject = {
  id: string;
  workspaceId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  workspaceName: string;
  clientName: string;
  projectTitle: string;
  leadSource: string;
  projectCategory: string;
  projectDescription: string;
  dateWon: string;
  currency: string;
  projectValue: number;
  isRecurringRevenue: boolean;
  notes: string;
  invoiceUrl: string;
  status: ProjectStatus;
  reviewNotes: string;
  createdAt: string;
  updatedAt: string;
};

export type CustomerSuccessSummary = {
  key: string;
  userId: string;
  workspaceId: string;
  customerName: string;
  customerEmail: string;
  workspaceName: string;
  totalRevenue: number;
  verifiedProjects: number;
  pendingProjects: number;
  rejectedProjects: number;
  averageProjectValue: number;
  largestProject: number;
  smallestProject: number;
  lastProjectWon: string;
  revenueGrowthPercent: number;
  sessions: number;
  totalUsageSeconds: number;
  averageSessionSeconds: number;
  lastActiveAt: string;
  healthScore: number;
  healthStatus: CustomerHealthStatus;
  mostUsedModule: string;
  projects: SuccessProject[];
};

export type CustomerSuccessMetric = {
  label: string;
  value: string | number;
  tone?: "blue" | "green" | "amber" | "red" | "slate";
};

export type CustomerSuccessChartPoint = {
  label: string;
  value: number;
};

export type CustomerActivityItem = {
  id: string;
  customerName: string;
  customerEmail: string;
  workspaceName: string;
  eventType: string;
  moduleKey: string;
  eventLabel: string;
  occurredAt: string;
};

export type CustomerProgressRow = {
  id: string;
  customerName: string;
  customerEmail: string;
  progressDate: string;
  blogsPublished: number;
  pagesEdited: number;
  campaignsCreated: number;
  aiCreditsUsed: number;
  leadsAdded: number;
  knowledgeUpdates: number;
  seoTasksCompleted: number;
  outreachActivities: number;
  filesUploaded: number;
  productivityScore: number;
};

export type SuccessNotification = {
  id: string;
  title: string;
  body: string;
  severity: string;
  status: string;
  createdAt: string;
};

export type CustomerSuccessDashboardData = {
  metrics: CustomerSuccessMetric[];
  charts: {
    monthlyRevenue: CustomerSuccessChartPoint[];
    weeklyRevenue: CustomerSuccessChartPoint[];
    dailyUsage: CustomerSuccessChartPoint[];
    featureUsage: CustomerSuccessChartPoint[];
    dailyProgress: CustomerSuccessChartPoint[];
  };
  projects: SuccessProject[];
  customers: CustomerSuccessSummary[];
  leaderboard: {
    highestRevenue: CustomerSuccessSummary[];
    mostProjects: CustomerSuccessSummary[];
    highestAverageValue: CustomerSuccessSummary[];
    fastestGrowing: CustomerSuccessSummary[];
    mostActive: CustomerSuccessSummary[];
  };
  activityTimeline: CustomerActivityItem[];
  progressRows: CustomerProgressRow[];
  notifications: SuccessNotification[];
  schemaReady: boolean;
};

export type SuccessProjectInput = {
  workspaceId?: string;
  userId?: string;
  clientName: string;
  projectTitle: string;
  leadId?: string;
  leadSource?: string;
  projectCategory: string;
  projectDescription?: string;
  dateWon: string;
  currency: string;
  projectValue: number;
  isRecurringRevenue?: boolean;
  notes?: string;
  invoiceUrl?: string;
};
