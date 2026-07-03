import db from '../db/index';
import serviceOrderComposerRepo from '../repos/service-order-composer.repo';
import {
  ComposeServiceOrderRequest,
  CreatedEntitiesSummary,
  ServiceOrderComposerSearchParams,
} from '../models/service-order-composer.model';

export const serviceOrderComposerService = {
  async getSearchResults(params: ServiceOrderComposerSearchParams) {
    params.limit = params.limit && params.limit > 0 && params.limit <= 50 ? params.limit : 10;
    const rows = await serviceOrderComposerRepo.searchComposer(params);

    const grouped = new Map<string, any>();
    for (const row of rows) {
      const userId = row.user_id;
      if (!grouped.has(userId)) {
        grouped.set(userId, {
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
                  productTypeId: row.product_type_id,
                  productTypeName: row.product_type_name,
                },
              }
            : undefined,
          userProduct: row.user_product_id
            ? {
                userProductId: row.user_product_id,
                serialNumber: row.serial_number,
                loginPassword: row.login_password,
                additionalInfo: row.additional_info,
              }
            : undefined,
        });
      }

      const current = grouped.get(userId);
      if (row.contact_id && !current.contacts.some((contact: any) => contact.contactId === row.contact_id)) {
        current.contacts.push({
          contactId: row.contact_id,
          contactNumber: row.contact_number,
        });
      }
    }

    const data = Array.from(grouped.values());
    return { data, total: data.length };
  },

  async composeServiceOrder(request: ComposeServiceOrderRequest) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      let user = null;
      let userCreated = false;
      if (request.existing.userId) {
        user = await serviceOrderComposerRepo.getUserById(request.existing.userId, client);
        if (!user) {
          throw new Error('Referenced user not found');
        }
      }

      if (!user && request.customer.email) {
        user = await serviceOrderComposerRepo.getUserByEmail(request.customer.email, client);
      }

      if (!user) {
        user = await serviceOrderComposerRepo.createUser(request.customer, client);
        userCreated = true;
      }

      let contact = null;
      let contactCreated = false;
      if (request.existing.contactId) {
        contact = await serviceOrderComposerRepo.getContactById(request.existing.contactId, client);
        if (!contact) {
          throw new Error('Referenced contact not found');
        }
      }

      if (!contact) {
        contact = await serviceOrderComposerRepo.getContactByNumberForUser(user.userId, request.contact.contactNumber, client);
      }

      if (!contact) {
        contact = await serviceOrderComposerRepo.createContact(user.userId, request.contact, client);
        contactCreated = true;
      }

      let brand = null;
      let brandCreated = false;
      if (request.existing.brandId) {
        brand = await serviceOrderComposerRepo.getBrandById(request.existing.brandId, client);
        if (!brand) {
          throw new Error('Referenced brand not found');
        }
      }

      if (!brand) {
        brand = await serviceOrderComposerRepo.getBrandByName(request.product.brandName, client);
      }

      if (!brand) {
        brand = await serviceOrderComposerRepo.createBrand(request.product.brandName, client);
        brandCreated = true;
      }

      let productType = null;
      let productTypeCreated = false;
      if (request.existing.productTypeId) {
        productType = await serviceOrderComposerRepo.getProductTypeById(request.existing.productTypeId, client);
        if (!productType) {
          throw new Error('Referenced product type not found');
        }
      }

      if (!productType) {
        productType = await serviceOrderComposerRepo.getProductTypeByName(request.product.productTypeName, client);
      }

      if (!productType) {
        productType = await serviceOrderComposerRepo.createProductType(request.product.productTypeName, client);
        productTypeCreated = true;
      }

      let product = null;
      let productCreated = false;
      if (request.existing.productId) {
        product = await serviceOrderComposerRepo.getProductById(request.existing.productId, client);
        if (!product) {
          throw new Error('Referenced product not found');
        }
      }

      if (!product) {
        product = await serviceOrderComposerRepo.getProductByUnique(request.product.productName, brand.brandId, productType.productTypeId, client);
      }

      if (!product) {
        product = await serviceOrderComposerRepo.createProduct(request.product, brand.brandId, productType.productTypeId, client);
        productCreated = true;
      }

      let userProduct = null;
      let userProductCreated = false;
      if (request.existing.userProductId) {
        userProduct = await serviceOrderComposerRepo.getUserProductById(request.existing.userProductId, client);
        if (!userProduct) {
          throw new Error('Referenced user product not found');
        }
      }

      if (!userProduct) {
        const existingSerial = await serviceOrderComposerRepo.getUserProductBySerial(request.userProduct.serialNumber, client);
        if (existingSerial) {
          if (existingSerial.userId !== user.userId) {
            throw new Error('Serial number already associated with another user');
          }
          userProduct = {
            userProductId: existingSerial.userProductId,
            serialNumber: existingSerial.serialNumber,
            loginPassword: existingSerial.loginPassword,
            additionalInfo: existingSerial.additionalInfo,
          };
        }
      }

      if (!userProduct) {
        userProduct = await serviceOrderComposerRepo.createUserProduct(user.userId, product.productId, request.userProduct, client);
        userProductCreated = true;
      }

      const serviceOrder = await serviceOrderComposerRepo.createServiceOrder(userProduct.userProductId, request.serviceOrder, client);

      const createdEntities: CreatedEntitiesSummary = {
        userCreated,
        contactCreated,
        brandCreated,
        productTypeCreated,
        productCreated,
        userProductCreated,
      };

      await client.query('COMMIT');
      return { serviceOrder, createdEntities };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
};

export default serviceOrderComposerService;
