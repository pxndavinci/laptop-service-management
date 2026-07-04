import serviceOrderRepo from '../repos/service-order.repo';
import * as ServiceOrder from '../models/service-order.model';
import { NotFoundError } from '../middlewares/error.middleware';
import { paginate, requireAnyField } from '../lib/utils';

export const serviceOrderService = {
  async getServiceOrders(params: ServiceOrder.ServiceOrderQueryParams) {
    const { page, limit, offset } = paginate(params.page, params.limit);
    const [data, total] = await serviceOrderRepo.getServiceOrders({ ...params, limit, offset });
    return { data, total, page, limit };
  },

  async getServiceOrderByID(serviceOrderId: string) {
    const order = await serviceOrderRepo.getServiceOrderByID(serviceOrderId);
    if (!order) throw new NotFoundError('Service order not found');
    return order;
  },

  async createServiceOrder(data: ServiceOrder.CreateServiceOrder) {
    return serviceOrderRepo.createServiceOrder(data);
  },

  async updateServiceOrder(serviceOrderId: string, data: ServiceOrder.PatchServiceOrder) {
    requireAnyField(data);
    const order = await serviceOrderRepo.updateServiceOrder(serviceOrderId, data);
    if (!order) throw new NotFoundError('Service order not found');
    return order;
  },

  async deleteServiceOrder(serviceOrderId: string) {
    const deleted = await serviceOrderRepo.deleteServiceOrder(serviceOrderId);
    if (!deleted) throw new NotFoundError('Service order not found');
  },
};

export default serviceOrderService;
