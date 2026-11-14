
/**
 * SalesPulse - Regional Analysis Module
 */

function analyzeRegions(validRecords) {
    if (!Array.isArray(validRecords)) {
        throw new Error("Valid records must be an array.");
    }

    const regionMap = new Map();

    validRecords.forEach(record => {
        const regionName = String(record.Region || "").trim();

        const quantity = Number(record.Quantity);
        const unitPrice = Number(record.UnitPrice);
        const unitCost = Number(record.UnitCost);

        if (!regionName) {
            throw new Error("Missing region in validated records.");
        }

        if (
            !Number.isFinite(quantity) ||
            !Number.isFinite(unitPrice) ||
            !Number.isFinite(unitCost)
        ) {
            throw new Error(`Invalid numeric data in ${regionName}.`);
        }

        const revenue = quantity * unitPrice;
        const grossProfit = quantity * (unitPrice - unitCost);

        if (!regionMap.has(regionName)) {
            regionMap.set(regionName, {
                Region: regionName,
                TotalOrders: 0,
                TotalQuantity: 0,
                TotalRevenue: 0,
                EstimatedGrossProfit: 0
            });
        }

        const region = regionMap.get(regionName);

        region.TotalOrders += 1;
        region.TotalQuantity += quantity;
        region.TotalRevenue += revenue;
        region.EstimatedGrossProfit += grossProfit;
    });

    const regions = Array.from(regionMap.values());

    regions.forEach(region => {
        region.TotalRevenue =
            Number(region.TotalRevenue.toFixed(2));

        region.EstimatedGrossProfit =
            Number(region.EstimatedGrossProfit.toFixed(2));
    });

    regions.sort(
        (a, b) => b.TotalRevenue - a.TotalRevenue
    );

    const highestRevenueRegion = regions[0] || null;

    return {
        regions,
        highestRevenueRegion
    };
}

module.exports = {
    analyzeRegions
};
