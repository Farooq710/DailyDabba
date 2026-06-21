import { supabase } from './supabase';
import type { Tables, TablesInsert } from './database.types';
import type { DaySummary } from '../app/data/mockData';

type QR<T> = { data: T | null; error: { message: string } | null };
function qr<T>(result: unknown): QR<T> { return result as QR<T>; }

/**
 * Fetches all orders + items for `date`, computes day metrics, upserts to
 * `daily_summaries` (idempotent — UNIQUE constraint on owner_id, summary_date),
 * and returns the DaySummary object for the UI to display.
 */
export async function computeAndSaveDaySummary(ownerId: string, date: string): Promise<DaySummary> {
  // 1. Fetch orders for the day
  const { data: ordersData } = qr<Tables<'orders'>[]>(
    await supabase
      .from('orders')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('order_date', date)
  );
  const orders = ordersData ?? [];

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total_amount), 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  let bestSellerName = '';
  let bestSellerQty = 0;
  let slowestSellerName = '';
  let slowestSellerQty = 0;
  let busiestHour = 12;

  if (totalOrders > 0) {
    // 2. Fetch all order_items for these orders
    const { data: itemsData } = qr<Tables<'order_items'>[]>(
      await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orders.map(o => o.id))
    );
    const items = itemsData ?? [];

    // 3. Aggregate item sales
    const itemSales: Record<string, { qty: number; name: string }> = {};
    for (const item of items) {
      const key = item.menu_item_id ?? item.item_name;
      if (!itemSales[key]) itemSales[key] = { qty: 0, name: item.item_name };
      itemSales[key].qty += item.quantity;
    }
    const salesArr = Object.values(itemSales).sort((a, b) => b.qty - a.qty);
    if (salesArr.length > 0) {
      bestSellerName = salesArr[0].name;
      bestSellerQty = salesArr[0].qty;
      if (salesArr.length > 1) {
        const last = salesArr[salesArr.length - 1];
        slowestSellerName = last.name;
        slowestSellerQty = last.qty;
      }
    }

    // 4. Busiest hour (by order count)
    const hourCounts: Record<number, number> = {};
    for (const order of orders) {
      const h = new Date(order.order_time).getHours();
      hourCounts[h] = (hourCounts[h] ?? 0) + 1;
    }
    const busiestEntry = Object.entries(hourCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0];
    if (busiestEntry) busiestHour = parseInt(busiestEntry[0]);
  }

  const summary: DaySummary = {
    date,
    totalOrders,
    totalRevenue,
    bestSellerName,
    bestSellerQty,
    slowestSellerName,
    slowestSellerQty,
    avgOrderValue,
    busiestHour,
    orders: [],
  };

  // 5. Upsert to daily_summaries — idempotent via UNIQUE(owner_id, summary_date)
  const payload: TablesInsert<'daily_summaries'> = {
    owner_id: ownerId,
    summary_date: date,
    total_orders: totalOrders,
    total_revenue: totalRevenue,
    best_seller_name: bestSellerName || null,
    best_seller_quantity: bestSellerQty,
    slowest_seller_name: slowestSellerName || null,
    slowest_seller_quantity: slowestSellerQty,
    avg_order_value: avgOrderValue,
    busiest_hour: busiestHour,
  };

  qr<never>(
    await supabase
      .from('daily_summaries')
      .upsert(payload, { onConflict: 'owner_id,summary_date' })
  );

  return summary;
}
