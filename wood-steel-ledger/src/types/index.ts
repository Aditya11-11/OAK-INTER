export interface InventoryItem {
  id: string;
  name: string;
  category: "Hardware" | "Tools" | "Paint" | "Paint Tools";
  stock: number;
  unitPrice: number;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  type: "restock" | "sale";
  itemId: string;
  itemName: string;
  quantity: number;
  totalPrice: number;
  date: string;
  created_at?: string;
}

export type LaborStatus = "Available" | "Scheduled" | "Unavailable";

export interface LaborHistory {
  id: string;
  location: string;
  startDate: string;
  endDate: string;
  notes: string;
}

export interface Laborer {
  id: string;
  name: string;
  skill: string;
  assignedLocation: string;
  scheduleStart: string;
  scheduleEnd: string;
  status: LaborStatus;
  history: LaborHistory[];
  created_at?: string;
  updated_at?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  created_at?: string;
}

export interface DailyFinancial {
  date: string;
  totalSales: number;
  totalExpenses: number;
  profit: number;
}
