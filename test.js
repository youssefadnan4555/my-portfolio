"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const productService_1 = require("./productService");
// دالة فحص وتأكيد النتائج
function assert(testNumber, condition, testName) {
    if (!condition) {
        throw new Error(`❌ فشل الاختبار ${testNumber}: ${testName}`);
    }
    console.log(`✔️ [اختبار ${testNumber} ناجح]: ${testName}`);
}
console.log("==================================================");
console.log("🧪 بدء تشغيل حزمة الاختبارات الشاملة (AI-02-A04)");
console.log("==================================================\n");
let passedCount = 0;
(0, productService_1.resetStore)();
// 1. اختبار إضافة منتج بنجاح
try {
    const prod = (0, productService_1.addProduct)({
        name: 'Smart Watch',
        price: 250,
        costPrice: 150,
        category: 'Electronics',
        stock: 20
    });
    assert(1, prod.id > 0 && prod.name === 'Smart Watch', "إضافة منتج جديد وتوليد ID تلقائياً");
    passedCount++;
}
catch (e) {
    console.error(e.message);
}
// 2. اختبار منع إضافة منتج بدون اسم أو باسم فارغ
try {
    let errCaught = false;
    try {
        (0, productService_1.addProduct)({ name: '   ', price: 100, costPrice: 50, category: 'Clothing', stock: 10 });
    }
    catch (e) {
        if (e instanceof productService_1.ProductValidationError)
            errCaught = true;
    }
    assert(2, errCaught, "منع إضافة منتج باسم فارغ أو مسافات");
    passedCount++;
}
catch (e) {
    console.error(e.message);
}
// 3. اختبار منع سعر البيع الأقل من التكلفة
try {
    let errCaught = false;
    try {
        (0, productService_1.addProduct)({ name: 'Loss Product', price: 40, costPrice: 60, category: 'Food', stock: 5 });
    }
    catch (e) {
        if (e instanceof productService_1.ProductValidationError)
            errCaught = true;
    }
    assert(3, errCaught, "التحقق المالي: منع سعر البيع الأقل من سعر التكلفة");
    passedCount++;
}
catch (e) {
    console.error(e.message);
}
// 4. اختبار منع تكرار الـ ID المحدد يدوياً
try {
    let errCaught = false;
    try {
        (0, productService_1.addProduct)({ id: 1, name: 'Duplicate ID', price: 100, costPrice: 50, category: 'Electronics', stock: 5 });
    }
    catch (e) {
        if (e instanceof productService_1.ProductValidationError)
            errCaught = true;
    }
    assert(4, errCaught, "منع تكرار معرف المنتج (ID Uniqueness)");
    passedCount++;
}
catch (e) {
    console.error(e.message);
}
// 5. اختبار البحث المتقدم والتصفية متعددة المعايير
try {
    const results = (0, productService_1.searchProducts)({ category: 'Electronics', minPrice: 100, maxPrice: 1500 });
    assert(5, results.length > 0 && results.every(p => p.category === 'Electronics' && p.price >= 100 && p.price <= 1500), "البحث المتقدم والتصفية حسب الفئة ونطاق السعر معاً");
    passedCount++;
}
catch (e) {
    console.error(e.message);
}
// 6. اختبار منع نطاق أسعار غير صالح (minPrice > maxPrice)
try {
    let errCaught = false;
    try {
        (0, productService_1.searchProducts)({ minPrice: 500, maxPrice: 100 });
    }
    catch (e) {
        if (e instanceof productService_1.ProductValidationError)
            errCaught = true;
    }
    assert(6, errCaught, "التحقق من صحة نطاق الأسعار ومنع تجاوز الحد الأدنى للحد الأعلى");
    passedCount++;
}
catch (e) {
    console.error(e.message);
}
// 7. اختبار نجاح عملية البيع وخصم المخزون
try {
    const initialLaptopStock = (0, productService_1.getProducts)().find(p => p.id === 1).stock;
    const sale = (0, productService_1.sellProducts)([{ productId: 1, quantity: 2 }]);
    const updatedLaptopStock = (0, productService_1.getProducts)().find(p => p.id === 1).stock;
    assert(7, sale.totalAmount === 2400 && updatedLaptopStock === initialLaptopStock - 2, "إتمام عملية البيع بدقة وتخفيض كمية المخزون وحساب الإجمالي");
    passedCount++;
}
catch (e) {
    console.error(e.message);
}
// 8. اختبار منع بيع كميات تتجاوز المخزون المتوفر
try {
    let errCaught = false;
    try {
        (0, productService_1.sellProducts)([{ productId: 4, quantity: 100 }]); // المخزون 3 فقط
    }
    catch (e) {
        if (e instanceof productService_1.InsufficientStockError)
            errCaught = true;
    }
    assert(8, errCaught, "منع بيع كمية تتجاوز المتوفر في المخزون (InsufficientStockError)");
    passedCount++;
}
catch (e) {
    console.error(e.message);
}
// 9. اختبار منع إتمام البيع بسلة مشتريات فارغة
try {
    let errCaught = false;
    try {
        (0, productService_1.sellProducts)([]);
    }
    catch (e) {
        if (e instanceof productService_1.ProductValidationError)
            errCaught = true;
    }
    assert(9, errCaught, "منع تمرير سلة بيع فارغة");
    passedCount++;
}
catch (e) {
    console.error(e.message);
}
// 10. اختبار دقة تقرير المبيعات والأرباح
try {
    const report = (0, productService_1.generateSalesReport)();
    // عملية البيع في اختبار 7: 2 Gaming Laptops (سعر 1200، تكلفة 900 -> ربح 300 لكل جهاز = 600)
    assert(10, report.totalRevenue === 2400 && report.totalProfit === 600 && report.totalTransactions === 1, "دقة الحسابات المالية في تقارير المبيعات والأرباح التراكمية");
    passedCount++;
}
catch (e) {
    console.error(e.message);
}
// 11. اختبار تنبيهات المخزون المنخفض والحرِج
try {
    // المنتج 4 (Wireless Mouse) مخزونه 3 قطع (Threshold: 5)
    const alerts = (0, productService_1.checkInventoryLevels)(5);
    const hasMouseAlert = alerts.some(a => a.product.id === 4 && a.alertStatus === 'LOW');
    assert(11, hasMouseAlert, "اكتشاف وإطلاق تنبيهات المخزون المنخفض (Inventory Alerts)");
    passedCount++;
}
catch (e) {
    console.error(e.message);
}
// 12. اختبار الترتيب حسب المخزون أو السعر
try {
    const sorted = (0, productService_1.sortProducts)((0, productService_1.getProducts)(), 'stock', 'desc');
    assert(12, sorted[0].stock >= sorted[1].stock, "ترتيب المنتجات تنازلياً حسب كميات المخزون المتوفر");
    passedCount++;
}
catch (e) {
    console.error(e.message);
}
// 13. اختبار تجميع المنتجات حسب الفئات
try {
    const grouped = (0, productService_1.groupProductsByCategory)((0, productService_1.getProducts)());
    assert(13, Object.keys(grouped).includes('Accessories') && Object.keys(grouped).includes('Electronics'), "تجميع المنتجات في فئات مع الحفاظ على بنية البيانات");
    passedCount++;
}
catch (e) {
    console.error(e.message);
}
// 14. اختبار سلامة البيانات وعدم تأثر المصفوفات الأصلية بالعمليات الخارجية
try {
    const prods = (0, productService_1.getProducts)();
    prods.pop(); // محاولة التعديل على المصفوفة المسترجعة
    assert(14, (0, productService_1.getProducts)().length !== prods.length, "حماية كبسلة البيانات (Immutability & Encapsulation)");
    passedCount++;
}
catch (e) {
    console.error(e.message);
}
console.log(`\n==================================================`);
console.log(`📊 النتيجة النهائية: نجح ${passedCount} من أصل 14 اختباراً آلياً.`);
console.log(`==================================================`);
