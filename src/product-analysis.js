
/**
 * SalesPulse - Product Analysis Module
 */

function analyzeProducts(validRecords) {
    if (!Array.isArray(validRecords)) {
        throw new Error("Valid records must be an array.");
    }

    const productMap = new Map();

    validRecords.forEach(record => {
        const name = String(record.ProductName || "").trim();
        const quantity = Number(record.Quantity);
        const price = Number(record.UnitPrice);

        if (!name) {
            throw new Error("Missing product name in validated records.");
        }

        if (!Number.isFinite(quantity) || !Number.isFinite(price)) {
            throw new Error(`Invalid numeric data for ${name}.`);
        }

        const revenue = quantity * price;

        if (!productMap.has(name)) {
            productMap.set(name, {
                ProductName: name,
                TotalQuantity: 0,
                TotalRevenue: 0
            });
        }

        const product = productMap.get(name);

        product.TotalQuantity += quantity;
        product.TotalRevenue += revenue;
    });

    const products = Array.from(productMap.values());

    products.forEach(product => {
        product.TotalRevenue =
            Number(product.TotalRevenue.toFixed(2));
    });

    // Sort by revenue
    products.sort(
        (a, b) => b.TotalRevenue - a.TotalRevenue
    );

    // Top 5 products by revenue
    const topFive = products.slice(0, 5);

    // Find the maximum quantity sold
    const maxQuantity = products.length > 0
        ? Math.max(...products.map(p => p.TotalQuantity))
        : 0;

    // Include ALL products tied for highest quantity
    const highestQuantityProducts = products.filter(
        product => product.TotalQuantity === maxQuantity
    );

    return {
        products,
        topFive,
        highestQuantityProducts,
        highestQuantity: highestQuantityProducts[0] || null
    };
}

module.exports = {
    analyzeProducts
};
