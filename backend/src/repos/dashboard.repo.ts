import { sql } from 'kysely';
import db from '../db/index';
import { env } from '../config/env';
import { DEFAULT_STATUS, STATUS, TERMINAL_STATUSES, WORK_DONE_STATUSES } from '../lib/statuses';

/**
 * Period starts in the shop's timezone. `now() AT TIME ZONE tz` gives local
 * wall-clock time; truncating it and converting back gives the instant the
 * local day/week/month/year began. date_trunc('week') starts on Monday.
 */
const periodStart = (unit: 'day' | 'week' | 'month' | 'year') =>
  sql`date_trunc(${unit}, now() at time zone ${env.appTimezone}) at time zone ${env.appTimezone}`;

export const dashboardRepo = {
  /** Counts based on creation time and each order's latest status. */
  async getOrderCounts() {
    const result = await sql<{
      receivedToday: number;
      receivedWeek: number;
      receivedMonth: number;
      receivedYear: number;
      open: number;
      overdue: number;
      awaitingPickup: number;
    }>`
      with latest as (
        select so.created_at,
               so.estimated_completion_date,
               coalesce(ls.status_name, ${DEFAULT_STATUS}) as status
        from service_order so
        left join lateral (
          select st.status_name
          from service_status ss
          join status st on st.status_id = ss.status_id
          where ss.service_order_id = so.service_order_id
          order by ss.created_at desc, ss.service_status_id desc
          limit 1
        ) ls on true
      )
      select
        count(*) filter (where created_at >= ${periodStart('day')})   as received_today,
        count(*) filter (where created_at >= ${periodStart('week')})  as received_week,
        count(*) filter (where created_at >= ${periodStart('month')}) as received_month,
        count(*) filter (where created_at >= ${periodStart('year')})  as received_year,
        count(*) filter (where status not in (${sql.join(TERMINAL_STATUSES)})) as open,
        count(*) filter (
          where estimated_completion_date < now()
            and status not in (${sql.join(WORK_DONE_STATUSES)})
        ) as overdue,
        count(*) filter (where status = ${STATUS.COMPLETED}) as awaiting_pickup
      from latest
    `.execute(db);
    return result.rows[0];
  },

  /** Orders that reached COMPLETED / DELIVERED during a period, counted once each. */
  async getTransitionCounts() {
    const result = await sql<{
      completedToday: number;
      completedWeek: number;
      deliveredWeek: number;
    }>`
      select
        count(distinct ss.service_order_id) filter (
          where st.status_name = ${STATUS.COMPLETED} and ss.created_at >= ${periodStart('day')}
        ) as completed_today,
        count(distinct ss.service_order_id) filter (
          where st.status_name = ${STATUS.COMPLETED} and ss.created_at >= ${periodStart('week')}
        ) as completed_week,
        count(distinct ss.service_order_id) filter (
          where st.status_name = ${STATUS.DELIVERED} and ss.created_at >= ${periodStart('week')}
        ) as delivered_week
      from service_status ss
      join status st on st.status_id = ss.status_id
      where ss.created_at >= least(${periodStart('day')}, ${periodStart('week')})
    `.execute(db);
    return result.rows[0];
  },
};

export default dashboardRepo;
