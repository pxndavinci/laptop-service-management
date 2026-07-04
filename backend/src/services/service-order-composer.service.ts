import db, { DbExecutor } from '../db/index';
import serviceOrderComposerRepo from '../repos/service-order-composer.repo';
import {
  ComposeServiceOrderRequest,
  ComposeServiceOrderResponse,
  ComposerBrand,
  ComposerProduct,
  ComposerProductType,
  ComposerUser,
  ComposerUserProduct,
  ServiceOrderComposerSearchParams,
} from '../models/service-order-composer.model';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../middlewares/error.middleware';

/**
 * The composer creates a service order in one transaction, reusing entities
 * the caller referenced by id (`request.existing`) and finding-or-creating
 * everything else from the free-text form fields.
 */

interface Resolved<T> {
  entity: T;
  created: boolean;
}

const resolveUser = async (
  trx: DbExecutor,
  request: ComposeServiceOrderRequest
): Promise<Resolved<ComposerUser>> => {
  if (request.existing?.userId) {
    const user = await serviceOrderComposerRepo.getUserById(trx, request.existing.userId);
    if (!user) throw new NotFoundError('Referenced user not found');
    return { entity: user, created: false };
  }

  const email = request.customer.email?.trim() || undefined;
  if (email) {
    const match = await serviceOrderComposerRepo.getUserByEmail(trx, email);
    if (match) return { entity: match, created: false };
  }

  const roleExists = await serviceOrderComposerRepo.roleExists(trx, request.customer.roleId);
  if (!roleExists) throw new NotFoundError('Customer role not found');

  const user = await serviceOrderComposerRepo.createUser(trx, { ...request.customer, email });
  return { entity: user, created: true };
};

const resolveContact = async (
  trx: DbExecutor,
  request: ComposeServiceOrderRequest,
  userId: string
): Promise<Resolved<{ contactId: string; contactNumber: string }>> => {
  if (request.existing?.contactId) {
    const contact = await serviceOrderComposerRepo.getContactById(trx, request.existing.contactId);
    if (!contact) throw new NotFoundError('Referenced contact not found');
    if (contact.userId !== userId) {
      throw new BadRequestError('Referenced contact does not belong to the resolved user');
    }
    return { entity: contact, created: false };
  }

  const existing = await serviceOrderComposerRepo.getContactByNumberForUser(
    trx,
    userId,
    request.contact.contactNumber
  );
  if (existing) return { entity: existing, created: false };

  const contact = await serviceOrderComposerRepo.createContact(
    trx,
    userId,
    request.contact.contactNumber
  );
  return { entity: contact, created: true };
};

const resolveBrand = async (
  trx: DbExecutor,
  request: ComposeServiceOrderRequest
): Promise<Resolved<ComposerBrand>> => {
  if (request.existing?.brandId) {
    const brand = await serviceOrderComposerRepo.getBrandById(trx, request.existing.brandId);
    if (!brand) throw new NotFoundError('Referenced brand not found');
    return { entity: brand, created: false };
  }

  const existing = await serviceOrderComposerRepo.getBrandByName(trx, request.product.brandName);
  if (existing) return { entity: existing, created: false };

  const brand = await serviceOrderComposerRepo.createBrand(trx, request.product.brandName);
  return { entity: brand, created: true };
};

const resolveProductType = async (
  trx: DbExecutor,
  request: ComposeServiceOrderRequest
): Promise<Resolved<ComposerProductType>> => {
  if (request.existing?.productTypeId) {
    const productType = await serviceOrderComposerRepo.getProductTypeById(
      trx,
      request.existing.productTypeId
    );
    if (!productType) throw new NotFoundError('Referenced product type not found');
    return { entity: productType, created: false };
  }

  const existing = await serviceOrderComposerRepo.getProductTypeByName(
    trx,
    request.product.productTypeName
  );
  if (existing) return { entity: existing, created: false };

  const productType = await serviceOrderComposerRepo.createProductType(
    trx,
    request.product.productTypeName
  );
  return { entity: productType, created: true };
};

const resolveProduct = async (
  trx: DbExecutor,
  request: ComposeServiceOrderRequest,
  brand: ComposerBrand,
  productType: ComposerProductType
): Promise<Resolved<ComposerProduct>> => {
  if (request.existing?.productId) {
    const product = await serviceOrderComposerRepo.getProductById(trx, request.existing.productId);
    if (!product) throw new NotFoundError('Referenced product not found');
    if (product.brand.brandId !== brand.brandId) {
      throw new BadRequestError('Referenced product does not belong to the resolved brand');
    }
    if (product.productType.productTypeId !== productType.productTypeId) {
      throw new BadRequestError('Referenced product does not belong to the resolved product type');
    }
    return { entity: product, created: false };
  }

  const existing = await serviceOrderComposerRepo.getProductByUnique(
    trx,
    request.product.productName,
    brand.brandId,
    productType.productTypeId
  );
  if (existing) return { entity: existing, created: false };

  const created = await serviceOrderComposerRepo.createProduct(
    trx,
    request.product,
    brand.brandId,
    productType.productTypeId
  );
  return {
    entity: {
      productId: created.productId,
      productName: created.productName,
      description: created.description,
      brand,
      productType,
    },
    created: true,
  };
};

const resolveUserProduct = async (
  trx: DbExecutor,
  request: ComposeServiceOrderRequest,
  userId: string,
  productId: string
): Promise<Resolved<ComposerUserProduct>> => {
  if (request.existing?.userProductId) {
    const userProduct = await serviceOrderComposerRepo.getUserProductById(
      trx,
      request.existing.userProductId
    );
    if (!userProduct) throw new NotFoundError('Referenced user product not found');
    if (userProduct.userId !== userId) {
      throw new BadRequestError('Referenced user product does not belong to the resolved user');
    }
    if (userProduct.productId !== productId) {
      throw new BadRequestError('Referenced user product does not reference the resolved product');
    }
    return { entity: userProduct, created: false };
  }

  const existingSerial = await serviceOrderComposerRepo.getUserProductBySerial(
    trx,
    request.userProduct.serialNumber
  );
  if (existingSerial) {
    if (existingSerial.userId !== userId) {
      throw new ConflictError('Serial number is already associated with another user');
    }
    if (existingSerial.productId !== productId) {
      throw new ConflictError('Serial number is already associated with another product');
    }
    return { entity: existingSerial, created: false };
  }

  const userProduct = await serviceOrderComposerRepo.createUserProduct(
    trx,
    userId,
    productId,
    request.userProduct
  );
  return { entity: userProduct, created: true };
};

/** Translates unique-constraint races into the same 409s the checks above produce. */
const mapDatabaseError = (error: unknown): unknown => {
  const dbError = error as { code?: string; constraint?: string };
  if (dbError.code === '23505') {
    if (dbError.constraint === 'user_data_email_key') {
      return new ConflictError('Customer email already exists');
    }
    if (dbError.constraint === 'user_product_serial_number_key') {
      return new ConflictError('Serial number is already associated with another device');
    }
  }
  return error;
};

export const serviceOrderComposerService = {
  async getSearchResults(params: ServiceOrderComposerSearchParams) {
    const limit = params.limit && params.limit > 0 && params.limit <= 50 ? params.limit : 10;
    const data = await serviceOrderComposerRepo.searchContexts({ ...params, limit });
    return { data, total: data.length };
  },

  async composeServiceOrder(
    request: ComposeServiceOrderRequest
  ): Promise<ComposeServiceOrderResponse> {
    try {
      return await db.transaction().execute(async (trx) => {
        const user = await resolveUser(trx, request);
        const contact = await resolveContact(trx, request, user.entity.userId);
        const brand = await resolveBrand(trx, request);
        const productType = await resolveProductType(trx, request);
        const product = await resolveProduct(trx, request, brand.entity, productType.entity);
        const userProduct = await resolveUserProduct(
          trx,
          request,
          user.entity.userId,
          product.entity.productId
        );

        const entryUser = await serviceOrderComposerRepo.getUserById(
          trx,
          request.serviceOrder.entryByUserId
        );
        if (!entryUser) throw new NotFoundError('Entry user not found');

        const serviceOrder = await serviceOrderComposerRepo.createServiceOrder(
          trx,
          userProduct.entity.userProductId,
          request.serviceOrder
        );

        return {
          serviceOrder,
          createdEntities: {
            userCreated: user.created,
            contactCreated: contact.created,
            brandCreated: brand.created,
            productTypeCreated: productType.created,
            productCreated: product.created,
            userProductCreated: userProduct.created,
          },
        };
      });
    } catch (error) {
      throw mapDatabaseError(error);
    }
  },
};
