import serviceStatusRepo from '../repos/service-status.repo';
import * as ServiceStatusModel from '../models/service-status.model';

export const serviceStatusService = {
  async getServiceStatuses(params: { serviceOrderId?: string; page?: number; limit?: number; offset?: number }) {
    params.page = params.page && params.page > 0 ? params.page : 1;
    params.limit = params.limit && params.limit > 0 ? params.limit : 10;
    params.offset = (params.page - 1) * params.limit;
    const [rows, total] = await serviceStatusRepo.getServiceStatuses(params);
    return { rows, total, page: params.page, limit: params.limit };
  },

  async createServiceStatus(data: ServiceStatusModel.CreateServiceStatus) {
    return await serviceStatusRepo.createServiceStatus(data);
  },

  async getServiceStatusByID(id: string) {
    return await serviceStatusRepo.getServiceStatusByID(id);
  },

  async updateServiceStatus(id: string, data: ServiceStatusModel.PatchServiceStatus) {
    const result = await serviceStatusRepo.updateServiceStatus(id, data);
    if (result === null) return 'No updates performed or status not found';
    return result;
  },

  async deleteServiceStatus(id: string) {
    return await serviceStatusRepo.deleteServiceStatus(id);
  },
};

export default serviceStatusService;
