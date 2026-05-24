import serviceOrderRepo from '../repos/service-order.repo';
import * as ServiceOrderModel from '../models/service-order.model';

export const serviceOrderService = {
  async getServiceOrders(params: { tagNo?: number; page?: number; limit?: number; offset?: number }) {
    params.page = params.page && params.page > 0 ? params.page : 1;
    params.limit = params.limit && params.limit > 0 ? params.limit : 10;
    params.offset = (params.page - 1) * params.limit;
    const [orders, total] = await serviceOrderRepo.getServiceOrders(params);
    return { orders, total, page: params.page, limit: params.limit };
  },

  async createServiceOrder(data: ServiceOrderModel.CreateServiceOrder) {
    return await serviceOrderRepo.createServiceOrder(data);
  },

  async getServiceOrderByID(id: string) {
    return await serviceOrderRepo.getServiceOrderByID(id);
  },

  async updateServiceOrder(id: string, data: ServiceOrderModel.PatchServiceOrder) {
    const result = await serviceOrderRepo.updateServiceOrder(id, data);
    if (result === null) return 'No updates performed or service order not found';
    return result;
  },

  async deleteServiceOrder(id: string) {
    return await serviceOrderRepo.deleteServiceOrder(id);
  },
};

export default serviceOrderService;
