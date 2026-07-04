import db from '../db/index';
import * as Role from '../models/role.model';
import * as Brand from '../models/brand.model';
import * as ProductType from '../models/product-type.model';
import * as Status from '../models/status.model';

export const referenceRepo = {
  // ---------- Roles ----------
  async getAllRoles(): Promise<Role.Role[]> {
    return db.selectFrom('role').selectAll().orderBy('roleId').execute();
  },

  async createRole(data: Role.CreateRole): Promise<Role.Role> {
    return db
      .insertInto('role')
      .values({
        roleId: data.roleId,
        roleName: data.roleName,
        isServicer: data.isServicer,
        isCustomer: data.isCustomer,
        isBusiness: data.isBusiness,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  async updateRole(roleId: number, data: Role.PatchRole): Promise<Role.Role | undefined> {
    return db
      .updateTable('role')
      .set({
        roleName: data.roleName,
        isServicer: data.isServicer,
        isCustomer: data.isCustomer,
        isBusiness: data.isBusiness,
      })
      .where('roleId', '=', roleId)
      .returningAll()
      .executeTakeFirst();
  },

  async deleteRole(roleId: number): Promise<boolean> {
    const result = await db.deleteFrom('role').where('roleId', '=', roleId).executeTakeFirst();
    return result.numDeletedRows > 0n;
  },

  // ---------- Brands ----------
  async getAllBrands(): Promise<Brand.Brand[]> {
    return db.selectFrom('brand').selectAll().orderBy('brandName').execute();
  },

  async createBrand(data: Brand.CreateBrand): Promise<Brand.Brand> {
    return db
      .insertInto('brand')
      .values({ brandName: data.brandName })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  async updateBrand(brandId: string, data: Brand.PatchBrand): Promise<Brand.Brand | undefined> {
    return db
      .updateTable('brand')
      .set({ brandName: data.brandName })
      .where('brandId', '=', brandId)
      .returningAll()
      .executeTakeFirst();
  },

  async deleteBrand(brandId: string): Promise<boolean> {
    const result = await db.deleteFrom('brand').where('brandId', '=', brandId).executeTakeFirst();
    return result.numDeletedRows > 0n;
  },

  // ---------- Product types ----------
  async getAllProductTypes(): Promise<ProductType.ProductType[]> {
    return db.selectFrom('product_type').selectAll().orderBy('productTypeName').execute();
  },

  async createProductType(data: ProductType.CreateProductType): Promise<ProductType.ProductType> {
    return db
      .insertInto('product_type')
      .values({ productTypeName: data.typeName })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  async updateProductType(
    productTypeId: string,
    data: ProductType.PatchProductType
  ): Promise<ProductType.ProductType | undefined> {
    return db
      .updateTable('product_type')
      .set({ productTypeName: data.typeName })
      .where('productTypeId', '=', productTypeId)
      .returningAll()
      .executeTakeFirst();
  },

  async deleteProductType(productTypeId: string): Promise<boolean> {
    const result = await db
      .deleteFrom('product_type')
      .where('productTypeId', '=', productTypeId)
      .executeTakeFirst();
    return result.numDeletedRows > 0n;
  },

  // ---------- Statuses ----------
  async getAllStatuses(): Promise<Status.Status[]> {
    return db.selectFrom('status').selectAll().orderBy('statusName').execute();
  },

  async createStatus(data: Status.CreateStatus): Promise<Status.Status> {
    return db
      .insertInto('status')
      .values({ statusName: data.statusName })
      .returningAll()
      .executeTakeFirstOrThrow();
  },

  async updateStatus(statusId: string, data: Status.PatchStatus): Promise<Status.Status | undefined> {
    return db
      .updateTable('status')
      .set({ statusName: data.statusName })
      .where('statusId', '=', statusId)
      .returningAll()
      .executeTakeFirst();
  },

  async deleteStatus(statusId: string): Promise<boolean> {
    const result = await db
      .deleteFrom('status')
      .where('statusId', '=', statusId)
      .executeTakeFirst();
    return result.numDeletedRows > 0n;
  },
};
