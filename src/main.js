
/**
 * ==========================================
 * SALESPULSE - MAIN APPLICATION
 * ==========================================
 * Team Project: Sales Analytics
 *
 * Modules:
 * 1. Data Validation
 * 2. Revenue Metrics
 * 3. Product Analysis
 * 4. Regional Analysis
 * ==========================================
 */

const fs = require("fs");
const path = require("path");

// Import modules
const { validateRecords } = require("./validation");
const { calculateRevenueMetrics } = require("./revenue");
const { analyzeProducts } = require("./product-analysis");
const { analyzeRegions } = require("./region-analysis");

// ==========================================
// STEP 1: DATASET LOCATION
// ==========================================

const filePath = path.join(
    __dirname,
    "..",
    "data",
    "sales.csv"
);

if (!fs.existsSync(filePath)) {
    throw new Error("Dataset not found: data/sales.csv");
}

// ==========================================
// STEP 2: CSV PARSER
// ==========================================

function parseCSV(content) {
    const rows = [];
    let row = [];
    let field = "";
    let insideQuotes = false;

    for (let i = 0; i < content.length; i++) {
        const char = content[i];

        if (char === '"') {
            if (insideQuotes && content[i + 1] === '"') {
                field += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === "," && !insideQuotes) {
            row.push(field);
            field = "";
        } else if (
            (char === "\n" || char === "\r") &&
            !insideQuotes
        ) {
            if (char === "\r" && content[i + 1] === "\n") {
                i++;
            }

            row.push(field);

            if (row.some(value => value.trim() !== "")) {
                rows.push(row);
            }

            row = [];
            field = "";
        } else {
            field += char;
        }
    }

    row.push(field);

    if (row.some(value => value.trim() !== "")) {
        rows.push(row);
    }

    if (insideQuotes) {
        throw new Error("CSV contains an unclosed quoted field.");
    }

    if (rows.length === 0) {
        return [];
    }

    const headers = rows[0].map(header =>
        header.trim().replace(/^\uFEFF/, "")
    );

    if (headers.some(header => !header)) {
        throw new Error("CSV contains an empty column heading.");
    }

    if (new Set(headers).size !== headers.length) {
        throw new Error("CSV contains duplicate column headings.");
    }

    return rows.slice(1).map((values, index) => {
        if (values.length !== headers.length) {
            throw new Error(
                `CSV row ${index + 2} has an incorrect number of columns.`
            );
        }

        const record = {};

        headers.forEach((header, columnIndex) => {
            record[header] = values[columnIndex].trim();
        });

        return record;
    });
}

// ==========================================
// STEP 3: CSV EXPORT FUNCTION
// ==========================================

function convertToCSV(records) {
    if (records.length === 0) {
        return "";
    }

    const headers = Object.keys(records[0]);

    function escapeCSV(value) {
        const text = Array.isArray(value)
            ? value.join("; ")
            : String(value ?? "");

        if (/[",\n\r]/.test(text)) {
            return `"${text.replace(/"/g, '""')}"`;
        }

        return text;
    }

    const lines = [];

    lines.push(headers.map(escapeCSV).join(","));

    records.forEach(record => {
        lines.push(
            headers.map(header =>
                escapeCSV(record[header])
            ).join(",")
        );
    });

    return lines.join("\n");
}

// ==========================================
// STEP 4: MAIN APPLICATION
// ==========================================

function runSalesPulse() {

    console.log("\n======================================");
    console.log("       SALESPULSE ANALYTICS");
    console.log("======================================");

    // Read dataset
    const csvContent = fs.readFileSync(filePath, "utf8");
    const rawRecords = parseCSV(csvContent);

    console.log("\nDataset loaded successfully.");
    console.log("Total raw records:", rawRecords.length);

    // ======================================
    // STEP 5: DATA VALIDATION
    // ======================================

    console.log("\n========== DATA VALIDATION ==========");

    const validationResults = validateRecords(rawRecords);

    const validRecords = validationResults.validRecords;
    const invalidRecords = validationResults.invalidRecords;
    const summary = validationResults.validationSummary;

    console.log("Total records:", summary.totalRecords);
    console.log("Valid records:", summary.validRecords);
    console.log("Invalid records:", summary.invalidRecords);

    console.log("\nValidation error counts:");

    console.table(
        Object.entries(summary.reasonCounts).map(
            ([reason, count]) => ({
                Reason: reason,
                Count: count
            })
        )
    );

    // ======================================
    // STEP 6: REVENUE METRICS
    // ======================================

    console.log("\n========== REVENUE METRICS ==========");

    const revenueResults =
        calculateRevenueMetrics(validRecords);

    console.table([revenueResults]);

    // ======================================
    // STEP 7: PRODUCT ANALYSIS
    // ======================================

    console.log("\n========== PRODUCT ANALYSIS ==========");

    const productResults =
        analyzeProducts(validRecords);

    console.log("\nProduct-wise revenue and quantity:");
    console.table(productResults.products);

    console.log("\nTop 5 products by revenue:");
    console.table(productResults.topFive);

    console.log("\nProducts with highest quantity sold:");

    console.table(productResults.highestQuantityProducts);

    // ======================================
    // STEP 8: REGIONAL ANALYSIS
    // ======================================

    console.log("\n========== REGIONAL ANALYSIS ==========");

    const regionResults =
        analyzeRegions(validRecords);

    console.log("\nRegion-wise performance:");
    console.table(regionResults.regions);

    console.log("\nHighest revenue region:");

    console.table(
        regionResults.highestRevenueRegion
            ? [regionResults.highestRevenueRegion]
            : []
    );

    // ======================================
    // STEP 9: CREATE REPORT FOLDER
    // ======================================

    const reportFolder = path.join(
        __dirname,
        "..",
        "reports"
    );

    fs.mkdirSync(reportFolder, { recursive: true });

    // ======================================
    // STEP 10: SAVE OUTPUT FILES
    // ======================================

    fs.writeFileSync(
        path.join(reportFolder, "invalid-records.csv"),
        convertToCSV(invalidRecords)
    );

    fs.writeFileSync(
        path.join(reportFolder, "product-wise-revenue.csv"),
        convertToCSV(productResults.products)
    );

    fs.writeFileSync(
        path.join(reportFolder, "region-wise-analysis.csv"),
        convertToCSV(regionResults.regions)
    );

    fs.writeFileSync(
        path.join(reportFolder, "top-five-products.json"),
        JSON.stringify(productResults.topFive, null, 4)
    );

    fs.writeFileSync(
        path.join(reportFolder, "validation-summary.json"),
        JSON.stringify(summary, null, 4)
    );

    // ======================================
    // STEP 11: BUSINESS INSIGHTS
    // ======================================

    const insights = [];
    const recommendations = [];

    // Highest revenue product
    if (productResults.topFive.length > 0) {
        const topProduct = productResults.topFive[0];

        insights.push(
            `${topProduct.ProductName} generates the highest product revenue of ${topProduct.TotalRevenue.toFixed(2)}.`
        );

        recommendations.push(
            `Monitor the stock and sales performance of ${topProduct.ProductName}.`
        );
    }

    // Highest quantity products (including ties)
    if (productResults.highestQuantityProducts.length > 0) {
        const popularProducts =
            productResults.highestQuantityProducts
                .map(product => product.ProductName)
                .join(" and ");

        const maxQuantity =
            productResults.highestQuantityProducts[0].TotalQuantity;

        insights.push(
            `${popularProducts} have the highest quantity sold, with ${maxQuantity} units each.`
        );
    }

    // Highest revenue region
    if (regionResults.highestRevenueRegion) {
        const topRegion = regionResults.highestRevenueRegion;

        insights.push(
            `${topRegion.Region} is the highest revenue region with ${topRegion.TotalRevenue.toFixed(2)} revenue.`
        );

        recommendations.push(
            `Study the successful sales practices in ${topRegion.Region} and apply suitable strategies to other regions.`
        );
    }

    // Loss-making regions
    const lossRegions = regionResults.regions.filter(
        region => region.EstimatedGrossProfit < 0
    );

    if (lossRegions.length > 0) {
        insights.push(
            `${lossRegions.length} region(s) have negative estimated gross profit.`
        );

        recommendations.push(
            "Review pricing, costs and product mix in loss-making regions."
        );
    }

    // Data quality recommendation
    if (invalidRecords.length > 0) {
        recommendations.push(
            "Improve data entry checks to reduce missing values, invalid records and duplicate Order IDs."
        );
    }

    // Ensure at least three insights
    if (insights.length < 3) {
        insights.push(
            `The dataset contains ${validRecords.length} valid orders out of ${rawRecords.length} total records.`
        );
    }

    if (insights.length < 3) {
        insights.push(
            `The total quantity sold is ${revenueResults.totalQuantitySold} units.`
        );
    }

    // Ensure at least two recommendations
    if (recommendations.length < 2) {
        recommendations.push(
            "Continue monitoring revenue, gross profit and regional sales performance regularly."
        );
    }

    // ======================================
    // STEP 12: FINAL REPORT
    // ======================================

    const finalReport = `
# SALESPULSE - FINAL SALES ANALYTICS REPORT

## 1. DATA QUALITY SUMMARY

- Total Records: ${summary.totalRecords}
- Valid Records: ${summary.validRecords}
- Invalid Records: ${summary.invalidRecords}

### Validation Error Counts

${Object.entries(summary.reasonCounts)
    .map(([reason, count]) => `- ${reason}: ${count}`)
    .join("\n") || "- No validation errors found."}

## 2. REVENUE METRICS

- Total Revenue: ${revenueResults.totalRevenue.toFixed(2)}
- Total Valid Orders: ${revenueResults.totalValidOrders}
- Average Order Value: ${revenueResults.averageOrderValue.toFixed(2)}
- Total Quantity Sold: ${revenueResults.totalQuantitySold}
- Estimated Gross Profit: ${revenueResults.estimatedGrossProfit.toFixed(2)}

## 3. PRODUCT ANALYSIS

### Top 5 Products by Revenue

${productResults.topFive.map((product, index) =>
    `${index + 1}. ${product.ProductName} - Revenue: ${product.TotalRevenue.toFixed(2)}, Quantity: ${product.TotalQuantity}`
).join("\n") || "No product data available."}

### Highest Quantity Products

${productResults.highestQuantityProducts.length > 0
    ? productResults.highestQuantityProducts.map(product =>
        `${product.ProductName} - ${product.TotalQuantity} units`
    ).join("\n")
    : "No product data available."}

## 4. REGIONAL ANALYSIS

${regionResults.regions.map(region =>
    `- ${region.Region}: Revenue ${region.TotalRevenue.toFixed(2)}, Estimated Gross Profit ${region.EstimatedGrossProfit.toFixed(2)}, Orders ${region.TotalOrders}`
).join("\n") || "No regional data available."}

### Highest Revenue Region

${regionResults.highestRevenueRegion
    ? regionResults.highestRevenueRegion.Region
    : "No regional data available."}

## 5. BUSINESS INSIGHTS

${insights.map((item, index) =>
    `${index + 1}. ${item}`
).join("\n")}

## 6. RECOMMENDATIONS

${recommendations.map((item, index) =>
    `${index + 1}. ${item}`
).join("\n")}

---

Report generated by SalesPulse Analytics.
`;

    fs.writeFileSync(
        path.join(reportFolder, "final-report.md"),
        finalReport.trim()
    );

    // ======================================
    // STEP 13: COMPLETION
    // ======================================

    console.log("\n======================================");
    console.log("   SALESPULSE ANALYSIS COMPLETED");
    console.log("======================================");

    console.log("\nGenerated reports:");

    console.log("1. invalid-records.csv");
    console.log("2. product-wise-revenue.csv");
    console.log("3. region-wise-analysis.csv");
    console.log("4. top-five-products.json");
    console.log("5. validation-summary.json");
    console.log("6. final-report.md");

    console.log("\nAll four modules executed successfully!");
}

// ==========================================
// RUN APPLICATION
// ==========================================

try {
    runSalesPulse();
} catch (error) {
    console.error("\nSALESPULSE ERROR:");
    console.error(error.message);
    process.exitCode = 1;
}
