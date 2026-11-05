"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsufficientStockError = exports.ProductValidationError = void 0;
exports.resetStore = resetStore;
exports.getProducts = getProducts;
exports.getSalesLog = getSalesLog;
exports.addProduct = addProduct;
exports.searchProducts = searchProducts;
exports.sellProducts = sellProducts;
exports.generateSalesReport = generateSalesReport;
exports.checkInventoryLevels = checkInventoryLevels;
exports.sortProducts = sortProducts;
exports.groupProductsByCategory = groupProductsByCategory;
const types_1 = require("./types");
// استثناءات مخصصة
class ProductValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ProductValidationError';
    }
}
exports.ProductValidationError = ProductValidationError;
class InsufficientStockError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InsufficientStockError';
    }
}
exports.InsufficientStockError = InsufficientStockError;
// حالة النظام (مصفوفة المنتجات وسجل المبيعات)
let products = [...types_1.initialProducts];
let salesLog = [];
/**
 * إعادة تعيين حالة النظام (مفيدة للاختبارات)
 */
function resetStore() {
    products = types_1.initialProducts.map(p => ({ ...p }));
    salesLog = [];
}
/**
 * الحصول على نسخة من قائمة المنتجات الحالية
 */
function getProducts() {
    return products.map(p => ({ ...p }));
}
/**
 * الحصول على سجل المبيعات
 */
function getSalesLog() {
    return [...salesLog];
}
/**
 * 1. إضافة منتج جديد مع التحقق الكامل من صحة المدخلات
 */
function addProduct(newProduct) {
    if (!newProduct.name || !newProduct.name.trim()) {
        throw new ProductValidationError('اسم المنتج لا يمكن أن يكون فارغاً!');
    }
    if (typeof newProduct.price !== 'number' || newProduct.price <= 0) {
        throw new ProductValidationError('سعر البيع يجب أن يكون رقماً أكبر من صفر!');
    }
    if (typeof newProduct.costPrice !== 'number' || newProduct.costPrice < 0) {
        throw new ProductValidationError('سعر التكلفة يجب ألا يكون سالباً!');
    }
    if (newProduct.price < newProduct.costPrice) {
        throw new ProductValidationError('سعر البيع لا يمكن أن يكون أقل من سعر التكلفة!');
    }
    if (typeof newProduct.stock !== 'number' || newProduct.stock < 0 || !Number.isInteger(newProduct.stock)) {
        throw new ProductValidationError('كمية المخزون يجب أن تكون عدداً صحيحاً غير سالب!');
    }
    const validCategories = ['Electronics', 'Clothing', 'Food', 'Accessories'];
    if (!validCategories.includes(newProduct.category)) {
        throw new ProductValidationError(`الفئة '${newProduct.category}' غير مدعومة!`);
    }
    // توليد أو فحص المعرف ID
    let finalId = newProduct.id;
    if (finalId !== undefined) {
        if (finalId <= 0 || !Number.isInteger(finalId)) {
            throw new ProductValidationError('معرّف المنتج (ID) يجب أن يكون رقماً صحيحاً موجباً!');
        }
        if (products.some(p => p.id === finalId)) {
            throw new ProductValidationError(`يوجد منتج مسجل مسبقاً بنفس المعرف ID: ${finalId}`);
        }
    }
    else {
        const maxId = products.reduce((max, p) => p.id > max ? p.id : max, 0);
        finalId = maxId + 1;
    }
    const createdProduct = {
        id: finalId,
        name: newProduct.name.trim(),
        price: newProduct.price,
        costPrice: newProduct.costPrice,
        category: newProduct.category,
        stock: newProduct.stock
    };
    products.push(createdProduct);
    return { ...createdProduct };
}
function searchProducts(filterOrQuery) {
    // إمكانية استخدام debugger لفحص مسار البحث
    debugger;
    if (typeof filterOrQuery === 'string') {
        if (!filterOrQuery.trim()) {
            throw new ProductValidationError('كلمة البحث لا يمكن أن تكون فارغة!');
        }
        const lower = filterOrQuery.toLowerCase().trim();
        return products
            .filter(p => p.name.toLowerCase().includes(lower) || p.category.toLowerCase().includes(lower))
            .map(p => ({ ...p }));
    }
    if (typeof filterOrQuery === 'number') {
        if (filterOrQuery <= 0) {
            throw new ProductValidationError('معرّف المنتج (ID) يجب أن يكون رقماً موجباً أكبر من صفر!');
        }
        return products.filter(p => p.id === filterOrQuery).map(p => ({ ...p }));
    }
    if (typeof filterOrQuery === 'object' && filterOrQuery !== null) {
        const { query, category, minPrice, maxPrice } = filterOrQuery;
        if (minPrice !== undefined && minPrice < 0) {
            throw new ProductValidationError('الحد الأدنى للسعر لا يمكن أن يكون سالباً!');
        }
        if (maxPrice !== undefined && maxPrice < 0) {
            throw new ProductValidationError('الحد الأعلى للسعر لا يمكن أن يكون سالباً!');
        }
        if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
            throw new ProductValidationError('الحد الأدنى للسعر لا يمكن أن يتجاوز الحد الأعلى!');
        }
        return products.filter(p => {
            if (query && !p.name.toLowerCase().includes(query.toLowerCase().trim())) {
                return false;
            }
            if (category && p.category !== category) {
                return false;
            }
            if (minPrice !== undefined && p.price < minPrice) {
                return false;
            }
            if (maxPrice !== undefined && p.price > maxPrice) {
                return false;
            }
            return true;
        }).map(p => ({ ...p }));
    }
    throw new ProductValidationError('نوع معيار البحث غير مدعوم!');
}
/**
 * 3. تنفيذ عملية بيع المنتجات (مع فحص وتحديث المخزون وتسجيل الحركة)
 */
function sellProducts(itemsToSell) {
    if (!itemsToSell || itemsToSell.length === 0) {
        throw new ProductValidationError('سلة المبيعات فارغة، لا يمكن إتمام عملية البيع!');
    }
    // التحقق من صحة جميع العناصر والكميات وتوفر المخزون الكافي أولاً
    for (const item of itemsToSell) {
        if (typeof item.quantity !== 'number' || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
            throw new ProductValidationError(`كمية البيع للمنتج رقم ${item.productId} يجب أن تكون رقماً صحيحاً أكبر من صفر!`);
        }
        const product = products.find(p => p.id === item.productId);
        if (!product) {
            throw new ProductValidationError(`المنتج بالمعرف ${item.productId} غير موجود في النظام!`);
        }
        if (product.stock < item.quantity) {
            throw new InsufficientStockError(`الكمية المطلوبة (${item.quantity}) للمنتج "${product.name}" غير متوفرة! المتبقي في المخزون: ${product.stock}`);
        }
    }
    // تنفيذ الخصم من المخزون وحساب الفاتورة
    let totalAmount = 0;
    let totalProfit = 0;
    const recordedItems = [];
    for (const item of itemsToSell) {
        const product = products.find(p => p.id === item.productId);
        product.stock -= item.quantity;
        const subtotal = product.price * item.quantity;
        const profit = (product.price - product.costPrice) * item.quantity;
        totalAmount += subtotal;
        totalProfit += profit;
        recordedItems.push({
            product: { ...product },
            quantity: item.quantity,
            subtotal
        });
    }
    const saleRecord = {
        receiptId: `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        items: recordedItems,
        totalAmount,
        totalProfit,
        date: new Date()
    };
    salesLog.push(saleRecord);
    return saleRecord;
}
/**
 * 4. توليد تقرير مالي وشامل للمبيعات
 */
function generateSalesReport() {
    let totalRevenue = 0;
    let totalProfit = 0;
    const unitsSoldByCategory = {};
    for (const record of salesLog) {
        totalRevenue += record.totalAmount;
        totalProfit += record.totalProfit;
        for (const item of record.items) {
            const cat = item.product.category;
            unitsSoldByCategory[cat] = (unitsSoldByCategory[cat] || 0) + item.quantity;
        }
    }
    return {
        totalRevenue,
        totalProfit,
        totalTransactions: salesLog.length,
        unitsSoldByCategory
    };
}
/**
 * 5. توليد تقارير وتنبيهات مستويات المخزون (Inventory Alerts)
 */
function checkInventoryLevels(threshold = 5) {
    if (threshold < 0) {
        throw new ProductValidationError('حد التنبيه يجب ألا يكون سالباً!');
    }
    const alerts = [];
    for (const product of products) {
        if (product.stock <= 1) {
            alerts.push({
                product: { ...product },
                currentStock: product.stock,
                alertStatus: 'CRITICAL'
            });
        }
        else if (product.stock <= threshold) {
            alerts.push({
                product: { ...product },
                currentStock: product.stock,
                alertStatus: 'LOW'
            });
        }
    }
    return alerts;
}
/**
 * 6. ترتيب المنتجات
 */
function sortProducts(items, sortBy, order = 'asc') {
    if (!items || items.length === 0) {
        throw new ProductValidationError('قائمة المنتجات فارغة ولا يمكن ترتيبها!');
    }
    return [...items].sort((a, b) => {
        let comp = 0;
        if (sortBy === 'price')
            comp = a.price - b.price;
        else if (sortBy === 'stock')
            comp = a.stock - b.stock;
        else if (sortBy === 'name')
            comp = a.name.localeCompare(b.name);
        return order === 'asc' ? comp : -comp;
    });
}
/**
 * 7. تجميع المنتجات حسب الفئات
 */
function groupProductsByCategory(items) {
    if (!items) {
        throw new ProductValidationError('قائمة المنتجات غير متوفرة للتجميع!');
    }
    return items.reduce((acc, product) => {
        if (!acc[product.category]) {
            acc[product.category] = [];
        }
        acc[product.category].push({ ...product });
        return acc;
    }, {});
}
