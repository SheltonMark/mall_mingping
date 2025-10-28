declare enum CustomerType {
    NEW = "NEW",
    OLD = "OLD"
}
export declare class CreateCustomerDto {
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    salespersonId?: string;
    customerType?: CustomerType;
}
export declare class UpdateCustomerDto {
    name?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    salespersonId?: string;
    customerType?: CustomerType;
}
export {};
