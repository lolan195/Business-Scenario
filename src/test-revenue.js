const { calculateRevenueMetrics } = require('./revenue');

// Sample valid orders
const validRecords = [
    {
        Quantity: 2,
        UnitPrice: 1000,
        UnitCost: 700
    },
    {
        Quantity: 3,
        UnitPrice: 500,
        UnitCost: 300
    }
];

// Calculate metrics
const results = calculateRevenueMetrics(validRecords);

// Display results
console.log("===== REVENUE METRICS TEST =====");

console.log("Total Revenue:", results.totalRevenue);
console.log("Valid Orders:", results.totalValidOrders);
console.log("Average Order Value:", results.averageOrderValue);
console.log("Total Quantity Sold:", results.totalQuantitySold);
console.log("Estimated Gross Profit:", results.estimatedGrossProfit);