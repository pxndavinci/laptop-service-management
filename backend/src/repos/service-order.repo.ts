import db from '../db/index';
import * as ServiceOrder from '../models/service-order.model';

/**
 * Service orders joined with their customer/device context plus the latest
 * status, so lists and details can be rendered from a single query.
 */
const orderSummary = () =>
  db
    .selectFrom('service_order as so')
    .innerJoin('user_product as up', 'up.userProductId', 'so.userProductId')
    .innerJoin('user_data as u', 'u.userId', 'up.userId')
    .innerJoin('product as p', 'p.productId', 'up.productId')
    .innerJoin('brand as b', 'b.brandId', 'p.brandId')
    .select((eb) => [
      'so.serviceOrderId',
      'so.tagNo',
      'so.userProductId',
      'so.estimatedPrice',
      'so.finalPrice',
      'so.paymentMethod',
      'so.paymentStatus',
      'so.priorityLevel',
      'so.estimatedCompletionDate',
      'so.actualCompletionDate',
      'so.issueDescription',
      'so.issueNotes',
      'so.entryBy',
      'so.createdAt',
      'so.updatedAt',
      'u.userId',
      'u.userName',
      'p.productName',
      'b.brandName',
      'up.serialNumber',
      eb
        .selectFrom('contact as c')
        .select('c.contactNumber')
        .whereRef('c.userId', '=', 'u.userId')
        .orderBy('c.createdAt', 'asc')
        .limit(1)
        .as('contactNumber'),
      eb
        .selectFrom('service_status as ss')
        .innerJoin('status as st', 'st.statusId', 'ss.statusId')
        .select('st.statusName')
        .whereRef('ss.serviceOrderId', '=', 'so.serviceOrderId')
        .orderBy('ss.createdAt', 'desc')
        .limit(1)
        .as('currentStatus'),
    ]);

export const serviceOrderRepo = {
  async getServiceOrders(
    params: ServiceOrder.ServiceOrderQueryParams & { limit: number; offset: number }
  ): Promise<[ServiceOrder.ServiceOrderSummary[], number]> {
    const filtered = orderSummary()
      .$if(params.tagNo !== undefined, (qb) => qb.where('so.tagNo', '=', params.tagNo!))
      .$if(!!params.userProductId, (qb) =>
        qb.where('so.userProductId', '=', params.userProductId!)
      )
      .$if(!!params.paymentMethod, (qb) =>
        qb.where('so.paymentMethod', '=', params.paymentMethod!)
      )
      .$if(!!params.paymentStatus, (qb) =>
        qb.where('so.paymentStatus', '=', params.paymentStatus!)
      )
      .$if(params.priorityLevel !== undefined, (qb) =>
        qb.where('so.priorityLevel', '=', params.priorityLevel!)
      )
      .$if(!!params.issueDescription, (qb) =>
        qb.where('so.issueDescription', '=', params.issueDescription!)
      )
      .$if(!!params.entryBy, (qb) => qb.where('so.entryBy', '=', params.entryBy!));

    const orders = await filtered
      .orderBy('so.createdAt', 'desc')
      .limit(params.limit)
      .offset(params.offset)
      .execute();

    const { total } = await filtered
      .clearSelect()
      .select((eb) => eb.fn.countAll<number>().as('total'))
      .executeTakeFirstOrThrow();

    return [orders, total];
  },

  async getServiceOrderByID(
    serviceOrderId: string
  ): Promise<ServiceOrder.ServiceOrderSummary | undefined> {
    return orderSummary().where('so.serviceOrderId', '=', serviceOrderId).executeTakeFirst();
  },

  async createServiceOrder(data: ServiceOrder.CreateServiceOrder): Promise<ServiceOrder.ServiceOrder> {
    return db
      .insertInto('service_order')
      .values({
        userProductId: data.userProductId,
        estimatedPrice: data.estimatedPrice ?? null,
        priorityLevel: data.priorityLevel,
        estimatedCompletionDate: data.estimatedCompletionDate ?? null,
        issueDescription: data.issueDescription,
        issueNotes: data.issueNotes ?? null,
        entryBy: data.entryBy,
        paymentMethod: null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  async updateServiceOrder(
    serviceOrderId: string,
    data: ServiceOrder.PatchServiceOrder
  ): Promise<ServiceOrder.ServiceOrder | undefined> {
    return db
      .updateTable('service_order')
      .set({
        userProductId: data.userProductId,
        estimatedPrice: data.estimatedPrice,
        finalPrice: data.finalPrice,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus,
        priorityLevel: data.priorityLevel,
        estimatedCompletionDate: data.estimatedCompletionDate,
        actualCompletionDate: data.actualCompletionDate,
        issueDescription: data.issueDescription,
        issueNotes: data.issueNotes,
      })
      .where('serviceOrderId', '=', serviceOrderId)
      .returningAll()
      .executeTakeFirst();
  },

  async deleteServiceOrder(serviceOrderId: string): Promise<boolean> {
    const result = await db
      .deleteFrom('service_order')
      .where('serviceOrderId', '=', serviceOrderId)
      .executeTakeFirst();
    return result.numDeletedRows > 0n;
  },
};

export default serviceOrderRepo;
