export type Category = {
    id: number;
    name: string;
    items_count?: number;
};

export type Item = {
    id: number;
    category_id: number;
    sku: string;
    name: string;
    unit: string;
    stock: number;
    reorder_level: number;
    created_at?: string;
    updated_at?: string;
    category?: Category | null;
};

export type StockMovement = {
    id: number;
    item_id: number;
    user_id: number | null;
    type: 'in' | 'out';
    quantity: number;
    stock_after: number;
    note: string | null;
    created_at: string;
    user: { id: number; name: string } | null;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

export type InventoryFilters = {
    search?: string;
    category?: string;
};

/**
 * A stock movement as listed on the dashboard, with its item attached.
 */
export type RecentStockMovement = StockMovement & {
    item: { id: number; name: string; unit: string };
};
