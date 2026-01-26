import { referenceRepo } from "../repo/reference.repo"

export const referenceService = {
    //Roles
    async getAllRole() {
        return await referenceRepo.getAllRole();
    },
    async createRole(data :{role_id: number, role_name: string, is_customer: boolean, is_business: boolean, is_servicer: boolean}) {
        console.log('inside create role service: ' + data.role_name.toString() + data.is_customer.toString());
        return await referenceRepo.createRole(data);
    },

    //Brands
    async getAllBrand(){
        return await referenceRepo.getAllBrand();
    },
    async createBrand(data: {brand_name: string}){
        return await referenceRepo.createBrand(data);
    },

    //ProductType
    async getAllProductType(){
        return await referenceRepo.getAllProductType();
    },
    async createProductType(data: {product_type_name: string}){
        return await referenceRepo.createProductType(data);
    }
}