export type Category = "sales" | "expense" | "udhaar";
export type ActionType = "add" | "edit" | "delete" | "delete_last" | "report" | "unknown";

export interface Transaction {
  id: string;
  category: Category;
  amount: number;
  item?: string;
  customerName?: string;
  status?: "paid" | "unpaid"; // for udhaar
  timestamp: number;
}

export interface ParseResult {
  action: ActionType;
  category?: Category;
  amount?: number;
  item?: string;
  customerName?: string;
  targetId?: string; // if editing/deleting a specific entry
  needsClarification?: boolean;
  clarificationMessage?: string;
  responseMessage?: string;
}
