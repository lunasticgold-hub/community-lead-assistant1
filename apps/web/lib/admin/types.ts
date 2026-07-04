export type AdminModuleSlug =
  | "analytics"
  | "users"
  | "workspaces"
  | "campaigns"
  | "outreach-sequences"
  | "outreach-queue"
  | "lead-sequences"
  | "leads"
  | "knowledge-base"
  | "blogs"
  | "seo"
  | "marketing"
  | "billing"
  | "ai-monitoring"
  | "extension"
  | "extension-events"
  | "outreach-activity"
  | "system-logs"
  | "settings"
  | "profile";

export type AdminFieldType =
  | "text"
  | "email"
  | "number"
  | "date"
  | "datetime"
  | "status"
  | "select"
  | "textarea"
  | "markdown"
  | "boolean"
  | "json"
  | "url";

export type AdminRow = Record<string, unknown> & { id?: string };

export type AdminColumn = {
  key: string;
  label: string;
  type?: AdminFieldType;
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
};

export type AdminAction =
  | "view"
  | "edit"
  | "delete"
  | "suspend"
  | "unsuspend"
  | "resetTrial"
  | "extendTrial"
  | "upgradePlan"
  | "downgradePlan"
  | "impersonate"
  | "pause"
  | "resume"
  | "transferOwnership"
  | "disableWorkspace"
  | "publish"
  | "draft"
  | "schedule";

export type AdminModuleConfig = {
  slug: AdminModuleSlug;
  title: string;
  description: string;
  table: string;
  defaultSort: string;
  searchable: string[];
  actions: AdminAction[];
  columns: AdminColumn[];
  createEnabled?: boolean;
  exportEnabled?: boolean;
  optionalTable?: boolean;
};

export type AdminMetric = {
  label: string;
  value: string | number;
  tone?: "blue" | "green" | "amber" | "red" | "slate";
};

export type AdminChartPoint = {
  label: string;
  value: number;
};

export type AdminDashboardData = {
  metrics: AdminMetric[];
  charts: Record<string, AdminChartPoint[]>;
};

export type AdminListResult = {
  rows: AdminRow[];
  count: number;
  page: number;
  pageSize: number;
  tableMissing?: boolean;
};
