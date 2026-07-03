import { Kysely, Transaction } from 'kysely';
import { kysely } from '../db/kysely';
import serviceOrderComposerRepo from '../repos/service-order-composer.repo';
import {
  ComposeServiceOrderRequest,
  CreatedEntitiesSummary,
  ServiceOrderComposerSearchParams,
} from '../models/service-order-composer.model';
import { AppError } from '../middlewares/error.middleware';

type Database = typeof kysely extends Kysely<infer DB> ? DB : never;

type DbExecutor = Kysely<Database> | Transaction<Database>;

type PostgresError = Error & {
  code?: string;
  constraint?: string;
};

const allowedIssueDescriptions = new Set([
  'HARDWARE',
  'SOFTWARE',
  'NETWORK',
  'OTHER',
]);

const badRequest = (message: string) =>
  new AppError(message, 400);

const notFound = (message: string) =>
  new AppError(message, 404);

const conflict = (message: string) =>
  new AppError(message, 409);

const isBlank = (value: unknown) =>
  typeof value !== 'string' || value.trim() === '';

const requireText = (
  value: unknown,
  fieldName: string
) => {
  if (isBlank(value)) {
    throw badRequest(`${fieldName} is required`);
  }
};

const requireNumber = (
  value: unknown,
  fieldName: string
) => {
  if (
    typeof value !== 'number' ||
    Number.isNaN(value)
  ) {
    throw badRequest(`${fieldName} must be a number`);
  }
};

const validateComposeRequest = (
  request: ComposeServiceOrderRequest
) => {
  if (!request) {
    throw badRequest('Request body is required');
  }

  const existing = request.existing ?? {
    userId: null,
    contactId: null,
    brandId: null,
    productTypeId: null,
    productId: null,
    userProductId: null,
  };

  if (!existing.userId) {
    if (!request.customer) {
      throw badRequest('Customer details are required');
    }

    requireText(
      request.customer.userName,
      'Customer name'
    );
    requireNumber(
      request.customer.roleId,
      'Customer role'
    );
  }

  if (!existing.contactId) {
    requireText(
      request.contact?.contactNumber,
      'Contact number'
    );
  }

  if (!request.product) {
    throw badRequest('Product details are required');
  }

  if (!existing.brandId) {
    requireText(
      request.product.brandName,
      'Brand name'
    );
  }

  if (!existing.productTypeId) {
    requireText(
      request.product.productTypeName,
      'Product type'
    );
  }

  if (!existing.productId) {
    requireText(
      request.product.productName,
      'Product name'
    );
  }

  if (!existing.userProductId) {
    requireText(
      request.userProduct?.serialNumber,
      'Serial number'
    );
  }

  if (!request.serviceOrder) {
    throw badRequest('Service order details are required');
  }

  requireText(
    request.serviceOrder.entryByUserId,
    'Entry user'
  );
  requireNumber(
    request.serviceOrder.priorityLevel,
    'Priority level'
  );

  if (
    !Number.isInteger(request.serviceOrder.priorityLevel) ||
    request.serviceOrder.priorityLevel < 1 ||
    request.serviceOrder.priorityLevel > 5
  ) {
    throw badRequest(
      'Priority level must be between 1 and 5'
    );
  }

  if (
    !allowedIssueDescriptions.has(
      request.serviceOrder.issueDescription
    )
  ) {
    throw badRequest('Issue description is invalid');
  }

  if (
    request.serviceOrder.estimatedPrice !== undefined &&
    request.serviceOrder.estimatedPrice !== null &&
    (
      typeof request.serviceOrder.estimatedPrice !==
        'number' ||
      Number.isNaN(
        request.serviceOrder.estimatedPrice
      ) ||
      request.serviceOrder.estimatedPrice < 0
    )
  ) {
    throw badRequest(
      'Estimated price must be zero or greater'
    );
  }

  if (
    request.serviceOrder.estimatedCompletionDate &&
    Number.isNaN(
      Date.parse(
        request.serviceOrder.estimatedCompletionDate
      )
    )
  ) {
    throw badRequest(
      'Estimated completion date is invalid'
    );
  }
};

const mapDatabaseError = (error: unknown) => {
  if (error instanceof AppError) {
    return error;
  }

  const dbError = error as PostgresError;

  if (dbError.code === '23505') {
    if (dbError.constraint === 'user_data_email_key') {
      return conflict(
        'Customer email already exists'
      );
    }

    if (
      dbError.constraint ===
      'user_product_serial_number_key'
    ) {
      return conflict(
        'Serial number is already associated with another device'
      );
    }

    return conflict(
      'Submitted data conflicts with existing records'
    );
  }

  if (
    dbError.code === '23503' ||
    dbError.code === '23514' ||
    dbError.code === '22P02'
  ) {
    return badRequest('Submitted data is invalid');
  }

  return error instanceof Error
    ? error
    : new Error('Unknown error');
};

export const serviceOrderComposerService = {
  async getSearchResults(
    params: ServiceOrderComposerSearchParams
  ) {
    const normalizedParams = {
      ...params,
      limit:
        params.limit &&
        params.limit > 0 &&
        params.limit <= 50
          ? params.limit
          : 10,
    };

    const rows =
      await serviceOrderComposerRepo.searchComposer(
        normalizedParams
      );

    const grouped = new Map<string, any>();

    for (const row of rows) {
      const contextKey = `${row.user_id}:${row.user_product_id ?? 'no-product'}`;

      if (!grouped.has(contextKey)) {
        grouped.set(contextKey, {
          user: {
            userId: row.user_id,
            userName: row.user_name,
            email: row.email,
            address: row.address,
            roleId: row.role_id,
          },

          contacts: [],

          product: row.product_id
            ? {
                productId: row.product_id,
                productName: row.product_name,
                description: row.description,

                brand: {
                  brandId: row.brand_id,
                  brandName: row.brand_name,
                },

                productType: {
                  productTypeId:
                    row.product_type_id,
                  productTypeName:
                    row.product_type_name,
                },
              }
            : undefined,

          userProduct: row.user_product_id
            ? {
                userProductId:
                  row.user_product_id,
                serialNumber:
                  row.serial_number,
                loginPassword:
                  row.login_password,
                additionalInfo:
                  row.additional_info,
              }
            : undefined,
        });
      }

      const current = grouped.get(contextKey);

      if (
        row.contact_id &&
        !current.contacts.some(
          (contact: { contactId: string }) =>
            contact.contactId === row.contact_id
        )
      ) {
        current.contacts.push({
          contactId: row.contact_id,
          contactNumber: row.contact_number,
        });
      }
    }

    const data = Array.from(grouped.values());

    return {
      data,
      total: data.length,
    };
  },

  async composeServiceOrder(
    request: ComposeServiceOrderRequest
  ) {
    validateComposeRequest(request);

    try {
      return await kysely
        .transaction()
        .execute(async (trx: DbExecutor) => {
        let user;
        let userCreated = false;

        if (request.existing?.userId) {
          user =
            await serviceOrderComposerRepo.getUserById(
              trx,
              request.existing.userId
            );

          if (!user) {
            throw notFound(
              'Referenced user not found'
            );
          }
        } else {
          const customer = request.customer;

          if (!customer) {
            throw badRequest(
              'Customer details are required'
            );
          }

          const email =
            customer.email?.trim() || undefined;
          const customerInput = {
            ...customer,
            email,
          };

          if (email) {
            user =
              await serviceOrderComposerRepo.getUserByEmail(
                trx,
                email
              );
          }

          if (!user) {
            const roleExists =
              await serviceOrderComposerRepo.roleExists(
                trx,
                customer.roleId
              );

            if (!roleExists) {
              throw notFound(
                'Customer role not found'
              );
            }

            user =
              await serviceOrderComposerRepo.createUser(
                trx,
                customerInput
              );

            userCreated = true;
          }
        }

        let contact;
        let contactCreated = false;

        if (request.existing?.contactId) {
          contact =
            await serviceOrderComposerRepo.getContactById(
              trx,
              request.existing.contactId
            );

          if (!contact) {
            throw notFound(
              'Referenced contact not found'
            );
          }

          if (contact.userId !== user.userId) {
            throw badRequest(
              'Referenced contact does not belong to the resolved user'
            );
          }
        } else {
          contact =
            await serviceOrderComposerRepo.getContactByNumberForUser(
              trx,
              user.userId,
              request.contact.contactNumber
            );

          if (!contact) {
            contact =
              await serviceOrderComposerRepo.createContact(
                trx,
                user.userId,
                request.contact
              );

            contactCreated = true;
          }
        }

        let brand;
        let brandCreated = false;

        if (request.existing?.brandId) {
          brand =
            await serviceOrderComposerRepo.getBrandById(
              trx,
              request.existing.brandId
            );

          if (!brand) {
            throw notFound(
              'Referenced brand not found'
            );
          }
        } else {
          brand =
            await serviceOrderComposerRepo.getBrandByName(
              trx,
              request.product.brandName
            );

          if (!brand) {
            brand =
              await serviceOrderComposerRepo.createBrand(
                trx,
                request.product.brandName
              );

            brandCreated = true;
          }
        }

        let productType;
        let productTypeCreated = false;

        if (request.existing?.productTypeId) {
          productType =
            await serviceOrderComposerRepo.getProductTypeById(
              trx,
              request.existing.productTypeId
            );

          if (!productType) {
            throw notFound(
              'Referenced product type not found'
            );
          }
        } else {
          productType =
            await serviceOrderComposerRepo.getProductTypeByName(
              trx,
              request.product.productTypeName
            );

          if (!productType) {
            productType =
              await serviceOrderComposerRepo.createProductType(
                trx,
                request.product.productTypeName
              );

            productTypeCreated = true;
          }
        }

        let product;
        let productCreated = false;

        if (request.existing?.productId) {
          product =
            await serviceOrderComposerRepo.getProductById(
              trx,
              request.existing.productId
            );

          if (!product) {
            throw notFound(
              'Referenced product not found'
            );
          }

          if (
            product.brand.brandId !== brand.brandId
          ) {
            throw badRequest(
              'Referenced product does not belong to the resolved brand'
            );
          }

          if (
            product.productType.productTypeId !==
            productType.productTypeId
          ) {
            throw badRequest(
              'Referenced product does not belong to the resolved product type'
            );
          }
        } else {
          product =
            await serviceOrderComposerRepo.getProductByUnique(
              trx,
              request.product.productName,
              brand.brandId,
              productType.productTypeId
            );

          if (!product) {
            product =
              await serviceOrderComposerRepo.createProduct(
                trx,
                request.product,
                brand.brandId,
                productType.productTypeId
              );

            productCreated = true;
          }
        }

        let userProduct;
        let userProductCreated = false;

        if (request.existing?.userProductId) {
          userProduct =
            await serviceOrderComposerRepo.getUserProductById(
              trx,
              request.existing.userProductId
            );

          if (!userProduct) {
            throw notFound(
              'Referenced user product not found'
            );
          }

          if (
            userProduct.userId !== user.userId
          ) {
            throw badRequest(
              'Referenced user product does not belong to the resolved user'
            );
          }

          if (
            userProduct.productId !== product.productId
          ) {
            throw badRequest(
              'Referenced user product does not reference the resolved product'
            );
          }
        } else {
          const existingSerial =
            await serviceOrderComposerRepo.getUserProductBySerial(
              trx,
              request.userProduct.serialNumber
            );

          if (existingSerial) {
            if (
              existingSerial.userId !== user.userId
            ) {
              throw conflict(
                'Serial number is already associated with another user'
              );
            }

            if (
              existingSerial.productId !==
              product.productId
            ) {
              throw conflict(
                'Serial number is already associated with another product'
              );
            }

            userProduct = existingSerial;
          } else {
            userProduct =
              await serviceOrderComposerRepo.createUserProduct(
                trx,
                user.userId,
                product.productId,
                request.userProduct
              );

            userProductCreated = true;
          }
        }

        const entryUser =
          await serviceOrderComposerRepo.getUserById(
            trx,
            request.serviceOrder.entryByUserId
          );

        if (!entryUser) {
          throw notFound('Entry user not found');
        }

        const serviceOrder =
          await serviceOrderComposerRepo.createServiceOrder(
            trx,
            userProduct.userProductId,
            request.serviceOrder
          );

        const createdEntities: CreatedEntitiesSummary = {
          userCreated,
          contactCreated,
          brandCreated,
          productTypeCreated,
          productCreated,
          userProductCreated,
        };

        return {
          serviceOrder,
          createdEntities,
        };
      });
    } catch (error) {
      throw mapDatabaseError(error);
    }
  },
};
