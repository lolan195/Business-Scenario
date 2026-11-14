// ==========================================
// SALES ANALYTICS - REVENUE METRICS MODULE
// Developed by: Loyal Joseph
// ==========================================

function calculateRevenueMetrics(validRecords) {

    // Check whether valid records are available
    if (!Array.isArray(validRecords) || validRecords.length === 0) {
        return {
            totalRevenue: 0,
            totalValidOrders: 0,
            averageOrderValue: 0,
            totalQuantitySold: 0,
            estimatedGrossProfit: 0
        };
    }

    let totalRevenue = 0;
    let totalQuantitySold = 0;
    let estimatedGrossProfit = 0;

    // Process each valid order
    validRecords.forEach(record => {

        const quantity = Number(record.Quantity);
        const unitPrice = Number(record.UnitPrice);
        const unitCost = Number(record.UnitCost);

        // Calculate revenue
        totalRevenue += quantity * unitPrice;

        // Calculate total quantity
        totalQuantitySold += quantity;

        // Calculate estimated gross profit
        estimatedGrossProfit += quantity * (unitPrice - unitCost);

    });

    // Count valid orders
    const totalValidOrders = validRecords.length;

    // Calculate Average Order Value
    const averageOrderValue = totalRevenue / totalValidOrders;

    // Return all metrics
    return {
        totalRevenue: Number(totalRevenue.toFixed(2)),

        totalValidOrders: totalValidOrders,

        averageOrderValue: Number(averageOrderValue.toFixed(2)),

        totalQuantitySold: totalQuantitySold,

        estimatedGrossProfit: Number(estimatedGrossProfit.toFixed(2))
    };
}

// Export function for integration with main.js
module.exports = {
    calculateRevenueMetrics
};