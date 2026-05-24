import { referenceRepo } from '../repos/reference.repo';
import * as RoleModel from '../models/role.model';
import * as BrandModel from '../models/brand.model';
import * as ProductTypeModel from '../models/product-type.model';
import * as StatusModel from '../models/status.model';

export const referenceService = {
  async getAllRole() {
    return await referenceRepo.getAllRole();
  },

  async createRole(data: RoleModel.CreateRole) {
    return await referenceRepo.createRole({
      roleName: data.roleName,
      isCustomer: data.isCustomer ?? false,
      isBusiness: data.isBusiness ?? false,
      isServicer: data.isServicer ?? false,
    });
  },

  async updateRole(roleId: number, data: RoleModel.PatchRole) {
    const result = await referenceRepo.updateRole(roleId, data);
    if (result === null) {
      return 'No updates performed or role not found';
    }
    return result;
  },

  async deleteRole(roleId: number) {
    return await referenceRepo.deleteRole(roleId);
  },

  async getAllBrand() {
    return await referenceRepo.getAllBrand();
  },

  async createBrand(data: BrandModel.CreateBrand) {
    return await referenceRepo.createBrand(data);
  },

  async updateBrand(brandId: string, data: BrandModel.PatchBrand) {
    const result = await referenceRepo.updateBrand(brandId, data);
    if (result === null) {
      return 'No updates performed or brand not found';
    }
    return result;
  },

  async deleteBrand(brandId: string) {
    return await referenceRepo.deleteBrand(brandId);
  },

  async getAllProductType() {
    return await referenceRepo.getAllProductType();
  },

  async createProductType(data: ProductTypeModel.CreateProductType) {
    return await referenceRepo.createProductType(data);
  },

  async updateProductType(productTypeId: string, data: ProductTypeModel.PatchProductType) {
    const result = await referenceRepo.updateProductType(productTypeId, data);
    if (result === null) {
      return 'No updates performed or product type not found';
    }
    return result;
  },

  async deleteProductType(productTypeId: string) {
    return await referenceRepo.deleteProductType(productTypeId);
  },

  async getAllStatus() {
    return await referenceRepo.getAllStatus();
  },

  async createStatus(data: StatusModel.CreateStatus) {
    return await referenceRepo.createStatus(data);
  },

  async updateStatus(statusId: string, data: StatusModel.PatchStatus) {
    const result = await referenceRepo.updateStatus(statusId, data);
    if (result === null) {
      return 'No updates performed or status not found';
    }
    return result;
  },

  async deleteStatus(statusId: string) {
    return await referenceRepo.deleteStatus(statusId);
  },
};