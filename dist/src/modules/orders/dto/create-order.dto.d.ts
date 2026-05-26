export declare class CreateOrderItemDto {
    menuItemId: string;
    quantity: number;
    notes?: string;
}
export declare class CreateOrderDto {
    tableId: string;
    items: CreateOrderItemDto[];
    notes?: string;
}
