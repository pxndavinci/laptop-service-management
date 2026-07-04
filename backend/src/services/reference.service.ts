import { referenceRepo } from '../repos/reference.repo';
import * as Role from '../models/role.model';
import * as Brand from '../models/brand.model';
import * as ProductType from '../models/product-type.model';
import * as Status from '../models/status.model';
import { NotFoundError } from '../middlewares/error.middleware';
import { requireAnyField } from '../lib/utils';

export const referenceService = {
  // ---------- Roles ----------
  async getAllRoles() {
    return referenceRepo.getAllRoles();
  },

  async createRole(data: Role.CreateRole) {
    return referenceRepo.createRole(data);
  },

  async updateRole(roleId: number, data: Role.PatchRole) {
    requireAnyField(data);
    const role = await referenceRepo.updateRole(roleId, data);
    if (!role) throw new NotFoundError('Role not found');
    return role;
  },

  async deleteRole(roleId: number) {
    const deleted = await referenceRepo.deleteRole(roleId);
    if (!deleted) throw new NotFoundError('Role not found');
  },

  // ---------- Brands ----------
  async getAllBrands() {
    return referenceRepo.getAllBrands();
  },

  async createBrand(data: Brand.CreateBrand) {
    return referenceRepo.createBrand(data);
  },

  async updateBrand(brandId: string, data: Brand.PatchBrand) {
    requireAnyField(data);
    const brand = await referenceRepo.updateBrand(brandId, data);
    if (!brand) throw new NotFoundError('Brand not found');
    return brand;
  },

  async deleteBrand(brandId: string) {
    const deleted = await referenceRepo.deleteBrand(brandId);
    if (!deleted) throw new NotFoundError('Brand not found');
  },

  // ---------- Product types ----------
  async getAllProductTypes() {
    return referenceRepo.getAllProductTypes();
  },

  async createProductType(data: ProductType.CreateProductType) {
    return referenceRepo.createProductType(data);
  },

  async updateProductType(productTypeId: string, data: ProductType.PatchProductType) {
    requireAnyField(data);
    const productType = await referenceRepo.updateProductType(productTypeId, data);
    if (!productType) throw new NotFoundError('Product type not found');
    return productType;
  },

  async deleteProductType(productTypeId: string) {
    const deleted = await referenceRepo.deleteProductType(productTypeId);
    if (!deleted) throw new NotFoundError('Product type not found');
  },

  // ---------- Statuses ----------
  async getAllStatuses() {
    return referenceRepo.getAllStatuses();
  },

  async createStatus(data: Status.CreateStatus) {
    return referenceRepo.createStatus(data);
  },

  async updateStatus(statusId: string, data: Status.PatchStatus) {
    requireAnyField(data);
    const status = await referenceRepo.updateStatus(statusId, data);
    if (!status) throw new NotFoundError('Status not found');
    return status;
  },

  async deleteStatus(statusId: string) {
    const deleted = await referenceRepo.deleteStatus(statusId);
    if (!deleted) throw new NotFoundError('Status not found');
  },
};
