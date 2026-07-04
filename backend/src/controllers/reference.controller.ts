import { Request, Response } from 'express';
import { referenceService } from '../services/reference.service';
import * as Role from '../models/role.model';
import * as Brand from '../models/brand.model';
import * as ProductType from '../models/product-type.model';
import * as Status from '../models/status.model';

const ReferenceController = {
  // ---------- Roles ----------
  getRoles: async (_req: Request, res: Response) => {
    const result = await referenceService.getAllRoles();
    res.status(200).json(result);
  },

  createRole: async (req: Request, res: Response) => {
    const input: Role.CreateRole = {
      roleId: req.body.roleId,
      roleName: req.body.roleName,
      isCustomer: req.body.isCustomer ?? false,
      isBusiness: req.body.isBusiness ?? false,
      isServicer: req.body.isServicer ?? false,
    };
    const result = await referenceService.createRole(input);
    res.status(201).json(result);
  },

  updateRole: async (req: Request, res: Response) => {
    const input: Role.PatchRole = {
      roleName: req.body.roleName,
      isCustomer: req.body.isCustomer,
      isBusiness: req.body.isBusiness,
      isServicer: req.body.isServicer,
    };
    const result = await referenceService.updateRole(Number(req.params.roleId), input);
    res.status(200).json(result);
  },

  deleteRole: async (req: Request, res: Response) => {
    await referenceService.deleteRole(Number(req.params.roleId));
    res.status(204).send();
  },

  // ---------- Brands ----------
  getBrands: async (_req: Request, res: Response) => {
    const result = await referenceService.getAllBrands();
    res.status(200).json(result);
  },

  createBrand: async (req: Request, res: Response) => {
    const input: Brand.CreateBrand = { brandName: req.body.brandName };
    const result = await referenceService.createBrand(input);
    res.status(201).json(result);
  },

  updateBrand: async (req: Request, res: Response) => {
    const input: Brand.PatchBrand = { brandName: req.body.brandName };
    const result = await referenceService.updateBrand(req.params.brandId, input);
    res.status(200).json(result);
  },

  deleteBrand: async (req: Request, res: Response) => {
    await referenceService.deleteBrand(req.params.brandId);
    res.status(204).send();
  },

  // ---------- Product types ----------
  getProductTypes: async (_req: Request, res: Response) => {
    const result = await referenceService.getAllProductTypes();
    res.status(200).json(result);
  },

  createProductType: async (req: Request, res: Response) => {
    const input: ProductType.CreateProductType = { typeName: req.body.typeName };
    const result = await referenceService.createProductType(input);
    res.status(201).json(result);
  },

  updateProductType: async (req: Request, res: Response) => {
    const input: ProductType.PatchProductType = { typeName: req.body.typeName };
    const result = await referenceService.updateProductType(req.params.productTypeId, input);
    res.status(200).json(result);
  },

  deleteProductType: async (req: Request, res: Response) => {
    await referenceService.deleteProductType(req.params.productTypeId);
    res.status(204).send();
  },

  // ---------- Statuses ----------
  getStatuses: async (_req: Request, res: Response) => {
    const result = await referenceService.getAllStatuses();
    res.status(200).json(result);
  },

  createStatus: async (req: Request, res: Response) => {
    const input: Status.CreateStatus = { statusName: req.body.statusName };
    const result = await referenceService.createStatus(input);
    res.status(201).json(result);
  },

  updateStatus: async (req: Request, res: Response) => {
    const input: Status.PatchStatus = { statusName: req.body.statusName };
    const result = await referenceService.updateStatus(req.params.statusId, input);
    res.status(200).json(result);
  },

  deleteStatus: async (req: Request, res: Response) => {
    await referenceService.deleteStatus(req.params.statusId);
    res.status(204).send();
  },
};

export default ReferenceController;
