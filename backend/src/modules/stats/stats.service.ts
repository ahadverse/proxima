import type { AdminOverviewDTO } from '@/shared';
import { Order, toOrderDTO } from '../order/order.model';
import { User } from '../user/user.model';

const DAY_MS = 24 * 60 * 60 * 1000;
const DHAKA_TZ = 'Asia/Dhaka';

export async function overview(): Promise<AdminOverviewDTO> {
  const since = new Date(Date.now() - 29 * DAY_MS);
  since.setUTCHours(0, 0, 0, 0);

  const [allTime, last30, paid, pending, customers, members, daily, top, recent] = await Promise.all([
    Order.aggregate<{ total: number }>([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Order.aggregate<{ total: number; count: number }>([
      { $match: { status: 'paid', 'payment.paidAt': { $gte: since } } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]),
    Order.countDocuments({ status: 'paid' }),
    Order.countDocuments({ status: 'pending' }),
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ 'membership.active': true }),
    Order.aggregate<{ _id: string; revenue: number; orders: number }>([
      { $match: { status: 'paid', 'payment.paidAt': { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$payment.paidAt', timezone: DHAKA_TZ } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
    ]),
    Order.aggregate<{ _id: unknown; title: AdminOverviewDTO['topProducts'][number]['title']; slug: string; thumbnail: string; sales: number; revenue: number }>([
      { $match: { status: 'paid' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          title: { $last: '$items.title' },
          slug: { $last: '$items.slug' },
          thumbnail: { $last: '$items.thumbnail' },
          sales: { $sum: 1 },
          revenue: { $sum: '$items.price' },
        },
      },
      { $sort: { sales: -1, revenue: -1 } },
      { $limit: 5 },
    ]),
    Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  const byDay = new Map(daily.map((row) => [row._id, row]));
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: DHAKA_TZ });
  const series = Array.from({ length: 30 }, (_, i) => {
    const date = formatter.format(new Date(Date.now() - (29 - i) * DAY_MS));
    const row = byDay.get(date);
    return { date, revenue: row?.revenue ?? 0, orders: row?.orders ?? 0 };
  });

  return {
    revenue: { last30: last30[0]?.total ?? 0, allTime: allTime[0]?.total ?? 0 },
    orders: { paid, pending, last30: last30[0]?.count ?? 0 },
    customers,
    members,
    series,
    topProducts: top.map((row) => ({
      _id: String(row._id),
      title: row.title,
      slug: row.slug,
      thumbnail: row.thumbnail,
      sales: row.sales,
      revenue: row.revenue,
    })),
    recentOrders: recent.map(toOrderDTO),
  };
}
