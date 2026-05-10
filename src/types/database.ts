export type UserRole = 'ADMIN' | 'SUPERVISOR';

export interface User {
  id: number;
  full_name: string;
  username: string;
  password?: string; // Optional because we don't want to leak it
  mobile_number: string | null;
  role: UserRole;
  enabled: boolean;
  created_at: string;
}

export interface Site {
  site_id: number;
  site_name: string;
  site_location: string;
  client_name: string;
  project_type: string | null;
  assigned_supervisor_id: number | null;
  status: string;
  created_at: string;
}

export interface DailyReport {
  report_id: number;
  site_id: number;
  supervisor_id: number;
  report_date: string;
  work_progress: string | null;
  remarks: string | null;
  deleted: boolean;
  created_at: string;
}

export interface LabourEntry {
  id: number;
  report_id: number;
  labour_type: string;
  count: number;
}

export interface LabourAdvanceEntry {
  id: number;
  report_id: number;
  labour_name: string;
  amount: number;
}

export interface MaterialExpenseEntry {
  id: number;
  report_id: number;
  material_name: string;
  amount: number;
}

export interface MaterialInwardEntry {
  id: number;
  report_id: number;
  material_name: string;
  quantity: number;
}

export interface RemainingStockEntry {
  id: number;
  report_id: number;
  material_name: string;
  quantity: string;
}

export interface ReportPhoto {
  id: number;
  report_id: number;
  photo_url: string;
}

export interface Holiday {
  id: number;
  date: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Notification {
  id: number;
  type: string | null;
  title: string | null;
  description: string | null;
  site: string | null;
  unread: boolean;
  created_at: string;
}

export interface WorkAllocation {
  id: number;
  site_id: number;
  allocation_date: string;
  work_allocated: boolean;
  remarks: string | null;
}
