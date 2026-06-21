import type { Tables } from './database.types';
import type { MenuItem, Order, OrderItem, DaySummary } from '../app/data/mockData';

type DbMenuItem = Tables<'menu_items'>;
type DbOrder = Tables<'orders'>;
type DbOrderItem = Tables<'order_items'>;
type DbSummary = Tables<'daily_summaries'>;

export function dbMenuItemToUI(row: DbMenuItem): MenuItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category ?? '',
    price: row.price,
    isAvailable: row.is_available,
    sortOrder: row.sort_order,
  };
}

export function dbOrderWithItemsToUI(order: DbOrder, items: DbOrderItem[]): Order {
  const orderItems: OrderItem[] = items.map(it => ({
    menuItemId: it.menu_item_id ?? '',
    name: it.item_name,
    price: it.item_price,
    quantity: it.quantity,
    subtotal: it.subtotal,
  }));
  return {
    id: order.id,
    time: new Date(order.order_time),
    items: orderItems,
    total: order.total_amount,
    paymentMode: order.payment_mode as Order['paymentMode'],
    tokenNumber: order.token_number ?? undefined,
  };
}

export function dbSummaryToUI(row: DbSummary, orders: Order[] = []): DaySummary {
  return {
    date: row.summary_date,
    totalOrders: row.total_orders,
    totalRevenue: row.total_revenue,
    bestSellerName: row.best_seller_name ?? '',
    bestSellerQty: row.best_seller_quantity,
    slowestSellerName: row.slowest_seller_name ?? '',
    slowestSellerQty: row.slowest_seller_quantity,
    avgOrderValue: row.avg_order_value ?? 0,
    busiestHour: row.busiest_hour ?? 12,
    orders,
  };
}
