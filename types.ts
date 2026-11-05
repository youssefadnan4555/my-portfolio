export type Category = 'Electronics' | 'Clothing' | 'Food' | 'Accessories';

export interface Product {
    id: number;
    name: string;
    price: number;
    costPrice: number;
    category: Category;
    stock: number;
}

export interface SaleItem {
    productId: number;
    quantity: number;
}

export interface SaleRecord {
    receiptId: string;
    items: {
        product: Product;
        quantity: number;
        subtotal: number;
    }[];
    totalAmount: number;
    totalProfit: number;
    date: Date;
}

export interface SalesReport {
    totalRevenue: number;
    totalProfit: number;
    totalTransactions: number;
    unitsSoldByCategory: Record<string, number>;
}

export interface InventoryAlert {
    product: Product;
    currentStock: number;
    alertStatus: 'CRITICAL' | 'LOW';
}

export const initialProducts: Product[] = [
    { id: 1, name: 'Gaming Laptop', price: 1200, costPrice: 900, category: 'Electronics', stock: 10 },
    { id: 2, name: 'Cotton T-Shirt', price: 25, costPrice: 12, category: 'Clothing', stock: 50 },
    { id: 3, name: 'Organic Apple Box', price: 15, costPrice: 8, category: 'Food', stock: 100 },
    { id: 4, name: 'Wireless Mouse', price: 45, costPrice: 20, category: 'Accessories', stock: 3 }
];