import db from '../db/index';
import * as ServiceStatus from '../models/service-status.model';

const statusWithNames = () =>
  db
    .selectFrom('service_status')
    .innerJoin('status', 'status.statusId', 'service_status.statusId')
    .innerJoin('user_data', 'user_data.userId', 'service_status.assignedTo')
    .select([
      'service_status.serviceStatusId',
      'service_status.serviceOrderId',
      'service_status.statusId',
      'service_status.assignedTo',
      'service_status.comment',
      'service_status.notifyCustomer',
      'service_status.createdAt',
      'service_status.updatedAt',
      'status.statusName',
      'user_data.userName as assignedToName',
    ]);

export const serviceStatusRepo = {
  async getServiceStatuses(
    params: ServiceStatus.ServiceStatusQueryParams & { limit: number; offset: number }
  ): Promise<[ServiceStatus.ServiceStatusWithNames[], number]> {
    const filtered = statusWithNames().$if(!!params.serviceOrderId, (qb) =>
      qb.where('service_status.serviceOrderId', '=', params.serviceOrderId!)
    );

    const statuses = await filtered
      .orderBy('service_status.createdAt', 'desc')
      .limit(params.limit)
      .offset(params.offset)
      .execute();

    const { total } = await filtered
      .clearSelect()
      .select((eb) => eb.fn.countAll<number>().as('total'))
      .executeTakeFirstOrThrow();

    return [statuses, total];
  },

  async getServiceStatusByID(
    serviceStatusId: string
  ): Promise<ServiceStatus.ServiceStatusWithNames | undefined> {
    return statusWithNames()
      .where('service_status.serviceStatusId', '=', serviceStatusId)
      .executeTakeFirst();
  },

  async createServiceStatus(
    data: ServiceStatus.CreateServiceStatus
  ): Promise<ServiceStatus.ServiceStatus> {
    return db
      .insertInto('service_status')
      .values({
        serviceOrderId: data.serviceOrderId,
        statusId: data.statusId,
        assignedTo: data.assignedTo,
        comment: data.comment ?? null,
        notifyCustomer: data.notifyCustomer ?? false,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  async updateServiceStatus(
    serviceStatusId: string,
    data: ServiceStatus.PatchServiceStatus
  ): Promise<ServiceStatus.ServiceStatus | undefined> {
    return db
      .updateTable('service_status')
      .set({
        statusId: data.statusId,
        assignedTo: data.assignedTo,
        comment: data.comment,
        notifyCustomer: data.notifyCustomer,
      })
      .where('serviceStatusId', '=', serviceStatusId)
      .returningAll()
      .executeTakeFirst();
  },

  async deleteServiceStatus(serviceStatusId: string): Promise<boolean> {
    const result = await db
      .deleteFrom('service_status')
      .where('serviceStatusId', '=', serviceStatusId)
      .executeTakeFirst();
    return result.numDeletedRows > 0n;
  },
};

export default serviceStatusRepo;
