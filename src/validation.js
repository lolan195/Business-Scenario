
/**
 * SalesPulse - Data Validation Module
 * -----------------------------------
 * Validates raw sales records and separates
 * valid and invalid orders.
 */

function validateRecords(records) {
    if (!Array.isArray(records)) {
        throw new Error("Input must be an array of records.");
    }

    const orderIdCounts = new Map();

    // Count Order IDs to identify duplicates
    records.forEach(record => {
        const orderId = String(record.OrderID || "").trim();

        if (orderId) {
            orderIdCounts.set(
                orderId,
                (orderIdCounts.get(orderId) || 0) + 1
            );
        }
    });

    const validRecords = [];
    const invalidRecords = [];
    const reasonCounts = {};

    records.forEach((record, index) => {
        const reasons = [];

        const orderId = String(record.OrderID || "").trim();
        const productName = String(record.ProductName || "").trim();
        const region = String(record.Region || "").trim();

        const quantity = Number(record.Quantity);
        const unitPrice = Number(record.UnitPrice);
        const unitCost = Number(record.UnitCost);

        // Validate Order ID
        if (!orderId) {
            reasons.push("Missing Order ID");
        } else if (orderIdCounts.get(orderId) > 1) {
            reasons.push("Duplicate Order ID");
        }

        // Validate quantity
        if (
            record.Quantity === "" ||
            record.Quantity === null ||
            record.Quantity === undefined ||
            !Number.isFinite(quantity)
        ) {
            reasons.push("Invalid quantity");
        } else if (quantity <= 0) {
            reasons.push("Zero or negative quantity");
        }

        // Validate unit price
        if (
            record.UnitPrice === "" ||
            record.UnitPrice === null ||
            record.UnitPrice === undefined ||
            !Number.isFinite(unitPrice)
        ) {
            reasons.push("Invalid unit price");
        } else if (unitPrice <= 0) {
            reasons.push("Zero or negative unit price");
        }

        // Validate unit cost
        if (
            record.UnitCost === "" ||
            record.UnitCost === null ||
            record.UnitCost === undefined ||
            !Number.isFinite(unitCost)
        ) {
            reasons.push("Invalid unit cost");
        } else if (unitCost < 0) {
            reasons.push("Negative unit cost");
        }

        // Validate product name
        if (!productName) {
            reasons.push("Missing product name");
        }

        // Validate region
        if (!region) {
            reasons.push("Missing region");
        }

        if (reasons.length > 0) {
            invalidRecords.push({
                ...record,
                ValidationErrors: reasons
            });

            reasons.forEach(reason => {
                reasonCounts[reason] =
                    (reasonCounts[reason] || 0) + 1;
            });
        } else {
            validRecords.push({
                ...record,
                OrderID: orderId,
                ProductName: productName,
                Region: region,
                Quantity: quantity,
                UnitPrice: unitPrice,
                UnitCost: unitCost
            });
        }
    });

    const validationSummary = {
        totalRecords: records.length,
        validRecords: validRecords.length,
        invalidRecords: invalidRecords.length,
        reasonCounts
    };

    return {
        validRecords,
        invalidRecords,
        validationSummary
    };
}

module.exports = {
    validateRecords
};