export interface Order {
  id: string;
  amount: number;
  concept: string;
  client?: string;
  reference: string;
  status: "pending" | "paid";
  createdAt: number;
}
