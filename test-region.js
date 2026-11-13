
const analyzeRegions = require("./region-analysis");

// Sample sales records for testing
const validOrders = [
    {
        Region: "West",
        Quantity: 2,
        UnitPrice: 1000,
        UnitCost: 600
    },
    {
        Region: "North",
        Quantity: 3,
        UnitPrice: 500,
        UnitCost: 300
    },
    {
        Region: "West",
        Quantity: 1,
        UnitPrice: 1000,
        UnitCost: 600
    }
];

// Run regional analysis
analyzeRegions(validOrders);
