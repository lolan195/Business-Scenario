
/**
 * SalesPulse - Product Analysis Module
 * ------------------------------------
 * Analyzes product-wise revenue and quantity.
 * Receives validated records from validation.js.
 */

function analyzeProducts(validRecords) {
    // Check input
    if (!Array.isArray(validRecords)) {
        throw new Error("Valid records must be provided as an array.");
    }

    // Handle empty records
    if (validRecords.length === 0) {
        return {
            products: [],
            topFive: [],
            highestQuantity: null
        };
    }

    const productMap = new Map();

    // Calculate product-wise revenue and quantity
    validRecords.forEach((item, index) => {
        const productName = String(item.ProductName || "").trim();
        const quantity = Number(item.Quantity);
        const unitPrice = Number(item.UnitPrice);

        // Validated records should contain a product name
        if (!productName) {
            throw new Error(
                `Missing product name in validated record at index ${index}.`
            );
        }

        if (
            !Number.isFinite(quantity) ||
            !Number.isFinite(unitPrice)
        ) {
            throw new Error(
                `Invalid quantity or unit price for product: ${productName}`
            );
        }

        const revenue = quantity * unitPrice;

        // Create product entry if it does not exist
        if (!productMap.has(productName)) {
            productMap.set(productName, {
                ProductName: productName,
                TotalQuantity: 0,
                TotalRevenue: 0
            });
        }

        // Update product totals
        const product = productMap.get(productName);

        product.TotalQuantity += quantity;
        product.TotalRevenue += revenue;
    });

    // Convert Map into an array
    const products = Array.from(productMap.values());

    // Sort products by revenue (highest first)
    products.sort(
        (a, b) => b.TotalRevenue - a.TotalRevenue
    );

    // Get top 5 products by revenue
    const topFive = products.slice(0, 5);

    // Find product with the highest quantity sold
    const highestQuantity = [...products].sort(
        (a, b) => b.TotalQuantity - a.TotalQuantity
    )[0] || null;

    // Return results
    return {
        products,
        topFive,
        highestQuantity
    };
}

// Export function for use in main.js
module.exports = {
    analyzeProducts
};
