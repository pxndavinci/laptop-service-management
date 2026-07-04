import serviceStatusRepo from '../repos/service-status.repo';
import * as ServiceStatus from '../models/service-status.model';
import { NotFoundError } from '../middlewares/error.middleware';
import { paginate, requireAnyField } from '../lib/utils';

export const serviceStatusService = {
  async getServiceStatuses(params: ServiceStatus.ServiceStatusQueryParams) {
    const { page, limit, offset } = paginate(params.page, params.limit);
    const [data, total] = await serviceStatusRepo.getServiceStatuses({ ...params, limit, offset });
    return { data, total, page, limit };
  },

  async getServiceStatusByID(serviceStatusId: string) {
    const status = await serviceStatusRepo.getServiceStatusByID(serviceStatusId);
    if (!status) throw new NotFoundError('Service status not found');
    return status;
  },

  async createServiceStatus(data: ServiceStatus.CreateServiceStatus) {
    return serviceStatusRepo.createServiceStatus(data);
  },

  async updateServiceStatus(serviceStatusId: string, data: ServiceStatus.PatchServiceStatus) {
    requireAnyField(data);
    const status = await serviceStatusRepo.updateServiceStatus(serviceStatusId, data);
    if (!status) throw new NotFoundError('Service status not found');
    return status;
  },

  async deleteServiceStatus(serviceStatusId: string) {
    const deleted = await serviceStatusRepo.deleteServiceStatus(serviceStatusId);
    if (!deleted) throw new NotFoundError('Service status not found');
  },
};

export default serviceStatusService;
