// UI type interfaces — these are the shapes all screens consume.
// Data is now loaded from Supabase via src/lib/adapters.ts.

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  isAvailable: boolean;
  sortOrder: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  time: Date;
  items: OrderItem[];
  total: number;
  paymentMode: 'cash' | 'upi' | 'card';
  tokenNumber?: number;
}

export interface DaySummary {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  bestSellerName: string;
  bestSellerQty: number;
  slowestSellerName: string;
  slowestSellerQty: number;
  avgOrderValue: number;
  busiestHour: number;
  orders: Order[];
}
