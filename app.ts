import { 
    addProduct, 
    sellProducts, 
    searchProducts, 
    sortProducts, 
    generateSalesReport, 
    checkInventoryLevels, 
    groupProductsByCategory, 
    getProducts, 
    ProductValidationError, 
    InsufficientStockError 
} from './productService';

console.log("==================================================");
console.log("🏢 نظام إدارة المنتجات والمبيعات الذكي (AI-02-A04)");
console.log("==================================================");

// 1. إضافة منتجات جديدة
console.log("\n--- [1] إضافة منتج جديد إلى النظام ---");
try {
    const newKeyboard = addProduct({
        name: 'Mechanical RGB Keyboard',
        price: 85,
        costPrice: 45,
        category: 'Accessories',
        stock: 15
    });
    console.log(`✔️ تمت إضافة المنتج بنجاح: [${newKeyboard.id}] ${newKeyboard.name} - السعر: $${newKeyboard.price} - المخزون: ${newKeyboard.stock}`);
} catch (err: any) {
    console.error("❌ فشل إضافة المنتج:", err.message);
}

// 2. البحث والتصفية المتقدمة
console.log("\n--- [2] البحث والتصفية المتقدمة (الفئة: Accessories، السعر حتى $100) ---");
const filteredAccessories = searchProducts({ category: 'Accessories', maxPrice: 100 });
filteredAccessories.forEach(p => console.log(` - ${p.name} | $${p.price} | المخزون: ${p.stock}`));

// 3. تنفيذ عملية بيع وتحديث المخزون
console.log("\n--- [3] تنفيذ عملية بيع لعدة منتجات وإصدار فاتورة ---");
try {
    const invoice = sellProducts([
        { productId: 1, quantity: 2 }, // 2 Gaming Laptop
        { productId: 4, quantity: 2 }  // 2 Wireless Mouse (يتبقى 1 في المخزون)
    ]);
    console.log(`🧾 تم إصدار الفاتورة: ${invoice.receiptId}`);
    console.log(`   إجمالي المبلغ: $${invoice.totalAmount} | الأرباح المحققة: $${invoice.totalProfit}`);
    invoice.items.forEach(item => {
        console.log(`   - ${item.product.name} × ${item.quantity} = $${item.subtotal} (المتبقي في المخزون: ${item.product.stock})`);
    });
} catch (err: any) {
    console.error("❌ فشل البيع:", err.message);
}

// 4. تقرير تنبيهات المخزون المنخفض والحرِج
console.log("\n--- [4] فحص تنبيهات المخزون (Threshold: 5) ---");
const inventoryAlerts = checkInventoryLevels(5);
inventoryAlerts.forEach(alert => {
    console.log(`⚠️ تنبيه [${alert.alertStatus}]: المنتج "${alert.product.name}" متبقي منه (${alert.currentStock}) قطع فقط!`);
});

// 5. التقرير المالي والإحصائي الشامل
console.log("\n--- [5] التقرير المالي الشامل للمبيعات ---");
const report = generateSalesReport();
console.log(`📊 إجمالي الإيرادات: $${report.totalRevenue}`);
console.log(`💰 صافي الأرباح: $${report.totalProfit}`);
console.log(`🔢 عدد العمليات: ${report.totalTransactions}`);
console.log(`📦 توزيع الوحدات المباعة حسب الفئات:`, report.unitsSoldByCategory);

// 6. تجربة معالجة الأخطاء والتحقق من المدخلات (Try / Catch)
console.log("\n==================================================");
console.log("🛡️ اختبار صيد ومعالجة الاستثناءات (Error Handling)");
console.log("==================================================");

// أ) محاولة بيع كمية تفوق المخزون المتاح
try {
    console.log("\n[تجربة خطأ 1]: محاولة بيع 50 كمبيوتر محمول بينما المتوفر 8 فقط...");
    sellProducts([{ productId: 1, quantity: 50 }]);
} catch (error) {
    if (error instanceof InsufficientStockError) {
        console.log("✔️ [نجاح الاعتراض] تم اصطياد خطأ نقص المخزون:", error.message);
    }
}

// ب) محاولة إضافة منتج بسعر بيع أقل من التكلفة
try {
    console.log("\n[تجربة خطأ 2]: إضافة منتج بسعر بيع ($10) أقل من التكلفة ($30)...");
    addProduct({
        name: 'Defective Item',
        price: 10,
        costPrice: 30,
        category: 'Electronics',
        stock: 5
    });
} catch (error) {
    if (error instanceof ProductValidationError) {
        console.log("✔️ [نجاح الاعتراض] تم اصطياد خطأ التحقق المالي:", error.message);
    }
}

// ج) محاولة البحث بقيم سالبة
try {
    console.log("\n[تجربة خطأ 3]: البحث بنطاق أسعار غير صالح (سالب)...");
    searchProducts({ minPrice: -50 });
} catch (error) {
    if (error instanceof ProductValidationError) {
        console.log("✔️ [نجاح الاعتراض] تم اصطياد خطأ صحة المدخلات:", error.message);
    }
}

console.log("\n==================================================");
console.log("✅ اكتمل تشغيل السيناريو الكامل بنجاح وجميع الضوابط تعمل بكفاءة!");
console.log("==================================================");