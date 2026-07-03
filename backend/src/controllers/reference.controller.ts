import { Request, Response } from 'express';
import { referenceService } from '../services/reference.service';
import * as RoleModel from '../models/role.model';
import * as BrandModel from '../models/brand.model';
import * as ProductTypeModel from '../models/product-type.model';
import * as StatusModel from '../models/status.model';

const ReferenceController = {
  getRoles: async (req: Request, res: Response) => {
    const result = await referenceService.getAllRole();
    res.status(200).json(result);
  },

  createRole: async (req: Request, res: Response) => {
    const input: RoleModel.CreateRole = {
      roleId: req.body.roleId as number,
      roleName: req.body.roleName as string,
      isCustomer: req.body.isCustomer ?? false,
      isBusiness: req.body.isBusiness ?? false,
      isServicer: req.body.isServicer ?? false,
    };

    const result: RoleModel.Role = await referenceService.createRole(input);
    res.status(201).json(result);
  },

  updateRole: async (req: Request, res: Response) => {
    const roleId = Number(req.params.roleId);
    const input: RoleModel.PatchRole = {
      roleName: req.body.roleName as string | undefined,
      isCustomer: req.body.isCustomer as boolean | undefined,
      isBusiness: req.body.isBusiness as boolean | undefined,
      isServicer: req.body.isServicer as boolean | undefined,
    };

    const result = await referenceService.updateRole(roleId, input);
    res.status(200).json(result);
  },

  deleteRole: async (req: Request, res: Response) => {
    const roleId = Number(req.params.roleId);
    await referenceService.deleteRole(roleId);
    res.status(204).send();
  },

  getBrands: async (req: Request, res: Response) => {
    const result = await referenceService.getAllBrand();
    res.status(200).json(result);
  },

  createBrand: async (req: Request, res: Response) => {
    const input: BrandModel.CreateBrand = {
      brandName: req.body.brandName as string,
    };

    const result: BrandModel.Brand = await referenceService.createBrand(input);
    res.status(201).json(result);
  },

  updateBrand: async (req: Request, res: Response) => {
    const brandId = req.params.brandId as string;
    const input: BrandModel.PatchBrand = {
      brandName: req.body.brandName as string | undefined,
    };

    const result = await referenceService.updateBrand(brandId, input);
    res.status(200).json(result);
  },

  deleteBrand: async (req: Request, res: Response) => {
    const brandId = req.params.brandId as string;
    await referenceService.deleteBrand(brandId);
    res.status(204).send();
  },

  getProductTypes: async (req: Request, res: Response) => {
    const result = await referenceService.getAllProductType();
    res.status(200).json(result);
  },

  createProductType: async (req: Request, res: Response) => {
    const input: ProductTypeModel.CreateProductType = {
      typeName: req.body.typeName as string,
    };

    const result: ProductTypeModel.ProductType = await referenceService.createProductType(input);
    res.status(201).json(result);
  },

  updateProductType: async (req: Request, res: Response) => {
    const productTypeId = req.params.productTypeId as string;
    const input: ProductTypeModel.PatchProductType = {
      typeName: req.body.typeName as string | undefined,
    };

    const result = await referenceService.updateProductType(productTypeId, input);
    res.status(200).json(result);
  },

  deleteProductType: async (req: Request, res: Response) => {
    const productTypeId = req.params.productTypeId as string;
    await referenceService.deleteProductType(productTypeId);
    res.status(204).send();
  },

  getStatuses: async (req: Request, res: Response) => {
    const result = await referenceService.getAllStatus();
    res.status(200).json(result);
  },

  createStatus: async (req: Request, res: Response) => {
    const input: StatusModel.CreateStatus = {
      statusName: req.body.statusName as string,
    };

    const result: StatusModel.Status = await referenceService.createStatus(input);
    res.status(201).json(result);
  },

  updateStatus: async (req: Request, res: Response) => {
    const statusId = req.params.statusId as string;
    const input: StatusModel.PatchStatus = {
      statusName: req.body.statusName as string | undefined,
    };

    const result = await referenceService.updateStatus(statusId, input);
    res.status(200).json(result);
  },

  deleteStatus: async (req: Request, res: Response) => {
    const statusId = req.params.statusId as string;
    await referenceService.deleteStatus(statusId);
    res.status(204).send();
  },
};

export default ReferenceController;
