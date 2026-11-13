
function analyzeRegions(validOrders) {
    const regions = {};

    // Calculate revenue and gross profit for each region
    for (const order of validOrders) {
        const region = order.Region;

        const revenue = order.Quantity * order.UnitPrice;

        const profit = order.Quantity *
            (order.UnitPrice - order.UnitCost);

        // Create region if it does not exist
        if (!regions[region]) {
            regions[region] = {
                orders: 0,
                revenue: 0,
                grossProfit: 0
            };
        }

        // Add regional values
        regions[region].orders++;
        regions[region].revenue += revenue;
        regions[region].grossProfit += profit;
    }

    // Display regional performance
    console.log("\nREGIONAL SALES ANALYSIS");

    console.table(
        Object.entries(regions).map(([region, data]) => ({
            Region: region,
            Orders: data.orders,
            Revenue: data.revenue,
            GrossProfit: data.grossProfit
        }))
    );

    // Find highest revenue region
    const bestRegion = Object.entries(regions)
        .sort((a, b) => b[1].revenue - a[1].revenue)[0];

    if (bestRegion) {
        console.log(
            "Best Performing Region:",
            bestRegion[0]
        );

        console.log(
            "Highest Revenue:",
            bestRegion[1].revenue
        );
    } else {
        console.log("No valid regional data available.");
    }

    return regions;
}

module.exports = analyzeRegions;
