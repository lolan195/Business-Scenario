
const assert = require("assert");

const { validateRecords } = require("../src/validation");
const { calculateRevenueMetrics } = require("../src/revenue");

// Create sample sales record
function createRecord(overrides = {}) {
    return {
        OrderID: "ORD001",
        ProductName: "Laptop",
        Region: "North",
        Quantity: "2",
        UnitPrice: "1000",
        UnitCost: "700",
        ...overrides
    };
}

// Test execution function
function runTest(name, testFunction) {
    try {
        testFunction();
        console.log(`PASS: ${name}`);
    } catch (error) {
        console.log(`FAIL: ${name}`);
        console.log(error.message);
        process.exitCode = 1;
    }
}

// TEST 1: Normal valid order
runTest("Normal order", () => {
    const result = validateRecords([
        createRecord()
    ]);

    assert.strictEqual(result.validRecords.length, 1);
    assert.strictEqual(result.invalidRecords.length, 0);
});

// TEST 2: Zero quantity
runTest("Zero quantity", () => {
    const result = validateRecords([
        createRecord({ Quantity: "0" })
    ]);

    assert.strictEqual(result.invalidRecords.length, 1);
});

// TEST 3: Negative unit price
runTest("Negative unit price", () => {
    const result = validateRecords([
        createRecord({ UnitPrice: "-100" })
    ]);

    assert.strictEqual(result.invalidRecords.length, 1);
});

// TEST 4: Missing product name
runTest("Missing product name", () => {
    const result = validateRecords([
        createRecord({ ProductName: "" })
    ]);

    assert.strictEqual(result.invalidRecords.length, 1);
});

// TEST 5: Duplicate Order ID
runTest("Duplicate Order ID", () => {
    const result = validateRecords([
        createRecord(),
        createRecord({ ProductName: "Mouse" })
    ]);

    assert.strictEqual(result.invalidRecords.length, 2);
});

// TEST 6: Unit cost greater than selling price
runTest("Cost greater than selling price", () => {
    const result = validateRecords([
        createRecord({
            UnitPrice: "500",
            UnitCost: "800"
        })
    ]);

    assert.strictEqual(result.validRecords.length, 1);

    const metrics = calculateRevenueMetrics(
        result.validRecords
    );

    assert.strictEqual(
        metrics.estimatedGrossProfit,
        -600
    );
});

// TEST 7: No valid orders
runTest("No valid orders", () => {
    const result = calculateRevenueMetrics([]);

    assert.strictEqual(result.totalRevenue, 0);
    assert.strictEqual(result.totalValidOrders, 0);
    assert.strictEqual(result.averageOrderValue, 0);
    assert.strictEqual(result.totalQuantitySold, 0);
    assert.strictEqual(result.estimatedGrossProfit, 0);
});

console.log("\nTest execution completed.");
