declare enum OrderType {
    FORMAL = "FORMAL",
    INTENTION = "INTENTION"
}
declare enum CustomerType {
    NEW = "NEW",
    OLD = "OLD"
}
declare class OrderItemDto {
    productSkuId: string;
    quantity: number;
    price: number;
}
declare class CustomParamDto {
    paramKey: string;
    paramValue?: string;
}
export declare class CreateOrderDto {
    orderNumber: string;
    customerId: string;
    salespersonId: string;
    customerType: CustomerType;
    orderType: OrderType;
    orderDate: string;
    status?: string;
    items: OrderItemDto[];
    customParams?: CustomParamDto[];
}
export declare class UpdateOrderDto {
    orderNumber?: string;
    customerId?: string;
    salespersonId?: string;
    customerType?: CustomerType;
    orderType?: OrderType;
    orderDate?: string;
    status?: string;
    items?: OrderItemDto[];
    customParams?: CustomParamDto[];
}
export declare class CreateOrderParamConfigDto {
    fieldName: string;
    fieldNameZh: string;
    fieldType: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'TEXTAREA';
    isRequired?: boolean;
    defaultValue?: string;
    options?: any;
    displayOrder?: number;
}
export declare class UpdateOrderParamConfigDto {
    fieldNameZh?: string;
    fieldType?: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'TEXTAREA';
    isRequired?: boolean;
    defaultValue?: string;
    options?: any;
    displayOrder?: number;
    isActive?: boolean;
}
export {};
