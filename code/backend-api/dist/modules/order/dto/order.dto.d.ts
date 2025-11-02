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
    itemNumber?: number;
    customerProductCode?: string;
    productImage?: string;
    productSpec?: string;
    additionalAttributes?: string;
    quantity: number;
    packagingConversion?: number;
    packagingUnit?: string;
    weightUnit?: string;
    netWeight?: number;
    grossWeight?: number;
    packagingType?: string;
    packagingSize?: string;
    supplierNote?: string;
    expectedDeliveryDate?: string;
    price: number;
    untaxedLocalCurrency?: number;
    packingQuantity?: number;
    cartonQuantity?: number;
    packagingMethod?: string;
    paperCardCode?: string;
    washLabelCode?: string;
    outerCartonCode?: string;
    cartonSpecification?: string;
    volume?: number;
    summary?: string;
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
    companyName?: string;
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
    companyName?: string;
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
