export type QueueStatus = 
  | 'waiting' 
  | 'called' 
  | 'serving' 
  | 'completed' 
  | 'skipped' 
  | 'cancelled';

export interface Store {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  opening_time: string; // "08:00"
  closing_time: string; // "21:00"
  is_open: boolean;
  average_service_duration: number; // minutes per customer
  daily_queue_limit: number;
  accepting_queue: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface QueueItem {
  id: string;
  store_id: string;
  queue_number: string; // e.g. "A-001"
  queue_sequence: number;
  queue_date: string; // YYYY-MM-DD
  customer_name: string;
  customer_phone: string;
  access_token: string;
  status: QueueStatus;
  created_at: string;
  called_at?: string | null;
  serving_at?: string | null;
  completed_at?: string | null;
  updated_at: string;
}

export interface QueueStats {
  total_today: number;
  waiting: number;
  serving: number;
  completed: number;
  cancelled: number;
  skipped: number;
  current_serving_number: string | null;
  next_queue_number: string | null;
  estimated_wait_time: number; // in minutes
}

export interface CustomerQueueDetail {
  queue: QueueItem;
  store: Store;
  position_in_front: number;
  estimated_wait_minutes: number;
  current_serving_number: string | null;
  total_waiting_today: number;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

