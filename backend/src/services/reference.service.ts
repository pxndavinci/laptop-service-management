import { referenceRepository } from "../repositories/reference.repository"
export const referenceService = {
    async getallRole() {
        return await referenceRepository.getallRole();
    },
    async createRole(data :{role_name: string, is_customer: boolean, is_business: boolean, is_servicer: boolean}) {
        console.log('inside create role service: ' + data.role_name.toString() + data.is_customer.toString());
        return await referenceRepository.createRole(data);
    },
}