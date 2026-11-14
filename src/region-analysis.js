
/**
 * SalesPulse - Regional Analysis Module
 * --------------------------------------
 * Calculates revenue and gross profit
 * for each sales region.
 */

function analyzeRegions(validRecords) {
    if (!Array.isArray(validRecords)) {
        throw new Error("Valid records must be provided as an array.");
    }

    if (validRecords.length === 0) {
        return {
            regions: [],
            highestRevenueRegion: null
        };
    }

    const regionMap = new Map();

    // Calculate region-wise metrics
    validRecords.forEach(record => {
        const regionName = String(record.Region || "").trim();

        const quantity = Number(record.Quantity);
        const unitPrice = Number(record.UnitPrice);
        const unitCost = Number(record.UnitCost);

        if (!regionName) {
            throw new Error("A validated record has a missing region.");
        }

        if (
            !Number.isFinite(quantity) ||
            !Number.isFinite(unitPrice) ||
            !Number.isFinite(unitCost)
        ) {
            throw new Error(`Invalid numeric data in region: ${regionName}`);
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

    // Convert Map into an array
    const regions = Array.from(regionMap.values());

    // Round financial values
    regions.forEach(region => {
        region.TotalRevenue =
            Number(region.TotalRevenue.toFixed(2));

        region.EstimatedGrossProfit =
            Number(region.EstimatedGrossProfit.toFixed(2));
    });

    // Sort by revenue (highest first)
    regions.sort(
        (a, b) => b.TotalRevenue - a.TotalRevenue
    );

    // Identify highest-revenue region
    const highestRevenueRegion = regions[0] || null;

    return {
        regions,
        highestRevenueRegion
    };
}

module.exports = {
    analyzeRegions
};
