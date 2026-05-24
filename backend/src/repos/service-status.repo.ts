import db from '../db/index';
import * as ServiceStatusModel from '../models/service-status.model';

export const serviceStatusRepo = {
  async getServiceStatuses(params: { serviceOrderId?: string; page?: number; limit?: number; offset?: number }) {
    let query = `SELECT * FROM service_status WHERE 1=1`;
    const values: any[] = [];
    let idx = 1;
    if (params.serviceOrderId) {
      query += ` AND service_order_id = $${idx}::uuid`;
      values.push(params.serviceOrderId);
      idx++;
    }

    query += ` LIMIT $${idx}::int`;
    values.push(params.limit ?? 10);
    idx++;
    query += ` OFFSET $${idx}::int`;
    values.push(params.offset ?? 0);

    const result = await db.query(query, values);
    return [result.rows, result.rowCount ?? 0];
  },

  async createServiceStatus(data: ServiceStatusModel.CreateServiceStatus) {
    const query = `
      INSERT INTO service_status (service_order_id, status_id, assigned_to, comment, notify_customer)
      VALUES ($1::uuid, $2::uuid, $3::uuid, $4::text, $5::boolean)
      RETURNING *;
    `;
    const values = [data.serviceOrderId, data.statusId, data.assignedTo, data.comment ?? null, data.notifyCustomer ?? false];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  async getServiceStatusByID(id: string) {
    const query = `SELECT * FROM service_status WHERE service_status_id = $1::uuid;`;
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  async updateServiceStatus(id: string, data: ServiceStatusModel.PatchServiceStatus) {
    let query = `UPDATE service_status SET `;
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.serviceOrderId !== undefined) {
      updates.push(`service_order_id = $${idx}::uuid`);
      values.push(data.serviceOrderId);
      idx++;
    }
    if (data.statusId !== undefined) {
      updates.push(`status_id = $${idx}::uuid`);
      values.push(data.statusId);
      idx++;
    }
    if (data.assignedTo !== undefined) {
      updates.push(`assigned_to = $${idx}::uuid`);
      values.push(data.assignedTo);
      idx++;
    }
    if (data.comment !== undefined) {
      updates.push(`comment = $${idx}::text`);
      values.push(data.comment);
      idx++;
    }
    if (data.notifyCustomer !== undefined) {
      updates.push(`notify_customer = $${idx}::boolean`);
      values.push(data.notifyCustomer);
      idx++;
    }

    if (updates.length === 0) return null;

    query += updates.join(', ') + ` WHERE service_status_id = $${idx}::uuid RETURNING *;`;
    values.push(id);
    const result = await db.query(query, values);
    return result.rows[0] ?? null;
  },

  async deleteServiceStatus(id: string) {
    const query = `DELETE FROM service_status WHERE service_status_id = $1::uuid;`;
    return await db.query(query, [id]);
  },
};

export default serviceStatusRepo;
