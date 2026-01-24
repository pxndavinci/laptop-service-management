import { referenceRepo } from "../repo/reference.repo"
export const referenceService = {
    async getallRole() {
        return (await referenceRepo.getallRole()).rows;
    },
    async createRole(data :{role_id: number, role_name: string, is_customer: boolean, is_business: boolean, is_servicer: boolean}) {
        console.log('inside create role service: ' + data.role_name.toString() + data.is_customer.toString());
        return (await referenceRepo.createRole(data)).rows[0];
    },
}