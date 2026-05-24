import db from '../db/index';
import * as ServiceOrderModel from '../models/service-order.model';

export const serviceOrderRepo = {
  async getServiceOrders(params: { tagNo?: number; page?: number; limit?: number; offset?: number }): Promise<[any[], number]> {
    let query = `SELECT * FROM service_order WHERE 1=1`;
    const values: any[] = [];
    let idx = 1;
    if (params.tagNo !== undefined) {
      query += ` AND tag_no = $${idx}::numeric`;
      values.push(params.tagNo);
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

  async createServiceOrder(data: ServiceOrderModel.CreateServiceOrder): Promise<any> {
    const query = `
      INSERT INTO service_order (
        user_product_id, estimated_price, payment_method, payment_status, priority_level, estimated_completion_date, issue_description, issue_notes, entry_by
      ) VALUES ($1::uuid, $2::numeric, $3::text, $4::text, $5::int, $6::timestamptz, $7::text, $8::text, $9::uuid)
      RETURNING *;
    `;
    const values = [
      data.userProductId,
      data.estimatedPrice ?? null,
      data.paymentMethod ?? null,
      data.paymentStatus ?? 'PENDING',
      data.priorityLevel,
      data.estimatedCompletionDate ?? null,
      data.issueDescription,
      data.issueNotes ?? null,
      data.entryByUserId,
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  async getServiceOrderByID(serviceOrderId: string) {
    const query = `SELECT * FROM service_order WHERE service_order_id = $1::uuid;`;
    const result = await db.query(query, [serviceOrderId]);
    return result.rows[0];
  },

  async updateServiceOrder(serviceOrderId: string, data: ServiceOrderModel.PatchServiceOrder) {
    let query = `UPDATE service_order SET `;
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.userProductId !== undefined) {
      updates.push(`user_product_id = $${idx}::uuid`);
      values.push(data.userProductId);
      idx++;
    }
    if (data.estimatedPrice !== undefined) {
      updates.push(`estimated_price = $${idx}::numeric`);
      values.push(data.estimatedPrice);
      idx++;
    }
    if (data.finalPrice !== undefined) {
      updates.push(`final_price = $${idx}::numeric`);
      values.push(data.finalPrice);
      idx++;
    }
    if (data.paymentMethod !== undefined) {
      updates.push(`payment_method = $${idx}::text`);
      values.push(data.paymentMethod);
      idx++;
    }
    if (data.paymentStatus !== undefined) {
      updates.push(`payment_status = $${idx}::text`);
      values.push(data.paymentStatus);
      idx++;
    }
    if (data.priorityLevel !== undefined) {
      updates.push(`priority_level = $${idx}::int`);
      values.push(data.priorityLevel);
      idx++;
    }
    if (data.estimatedCompletionDate !== undefined) {
      updates.push(`estimated_completion_date = $${idx}::timestamptz`);
      values.push(data.estimatedCompletionDate);
      idx++;
    }
    if (data.actualCompletionDate !== undefined) {
      updates.push(`actual_completion_date = $${idx}::timestamptz`);
      values.push(data.actualCompletionDate);
      idx++;
    }
    if (data.issueDescription !== undefined) {
      updates.push(`issue_description = $${idx}::text`);
      values.push(data.issueDescription);
      idx++;
    }
    if (data.issueNotes !== undefined) {
      updates.push(`issue_notes = $${idx}::text`);
      values.push(data.issueNotes);
      idx++;
    }

    if (updates.length === 0) return null;

    query += updates.join(', ') + ` WHERE service_order_id = $${idx}::uuid RETURNING *;`;
    values.push(serviceOrderId);
    const result = await db.query(query, values);
    return result.rows[0] ?? null;
  },

  async deleteServiceOrder(serviceOrderId: string) {
    const query = `DELETE FROM service_order WHERE service_order_id = $1::uuid;`;
    return await db.query(query, [serviceOrderId]);
  },
};

export default serviceOrderRepo;
