// Order related types based on ORDER_API_FIELDS.md

export type CustomerType = 'NEW' | 'OLD';
export type OrderType = 'FORMAL' | 'INTENTION';
export type OrderStatus = 'pending' | 'confirmed' | 'production' | 'shipped' | 'delivered' | 'cancelled';

// Order Item interface - 28 fields
export interface OrderItem {
  // System fields (A-Q columns)
  itemNumber?: number;
  productSkuId: string;
  productCode?: string;  // Auto-filled from SKU
  customerProductCode?: string;
  productImage?: string;
  productName?: string;  // Auto-filled from SKU
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
  expectedDeliveryDate?: string;  // ISO date string

  // Sales fields (R-AB columns)
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

  // Auto-calculated
  subtotal?: number;
}

// Custom parameter
export interface CustomParam {
  paramKey: string;
  paramValue: string;
}

// Create Order DTO
export interface CreateOrderDto {
  orderNumber: string;
  customerId: string;
  salespersonId: string;
  customerType: CustomerType;
  orderType: OrderType;
  orderDate: string;  // ISO date string
  companyName?: string;
  status?: OrderStatus;
  items: OrderItem[];
  customParams?: CustomParam[];
}

// Order response from API
export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  salespersonId: string;
  customerType: CustomerType;
  orderType: OrderType;
  orderDate: string;
  companyName?: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    type: string;
  };
  salesperson?: {
    id: string;
    name: string;
  };
  items?: (OrderItem & {
    id: string;
    orderId: string;
    productSku?: {
      id: string;
      productCode: string;
      group?: {
        groupNameZh: string;
        groupNameEn: string;
      };
    };
  })[];
  customParams?: (CustomParam & {
    id: string;
    orderId: string;
  })[];
}

// Product SKU for selection
export interface ProductSku {
  id: string;
  productCode: string;
  groupId: string;
  group: {
    id: string;
    groupNameZh: string;
    groupNameEn: string;
  };
}

// Customer for selection
export interface Customer {
  id: string;
  name: string;
  type: string;
}

// Salesperson for selection
export interface Salesperson {
  id: string;
  name: string;
  code: string;
}
