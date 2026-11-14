
/**
 * ==========================================
 * SALESPULSE - MAIN APPLICATION
 * ==========================================
 * Connects all four modules:
 * 1. Data Validation
 * 2. Revenue Metrics
 * 3. Product Analysis
 * 4. Regional Analysis
 */

const fs = require("fs");
const path = require("path");

// Import project modules
const { validateRecords } = require("./validation");
const { calculateRevenueMetrics } = require("./revenue");
const { analyzeProducts } = require("./product-analysis");
const { analyzeRegions } = require("./region-analysis");

// ------------------------------------------
// STEP 1: FIND THE DATASET
// ------------------------------------------

const possiblePaths = [
    path.join(__dirname, "..", "data", "SalesPulse Challenge Dataset.csv"),
    path.join(__dirname, "..", "SalesPulse Challenge Dataset.csv")
];

const filePath = possiblePaths.find(file => fs.existsSync(file));

if (!filePath) {
    throw new Error(
        "Dataset not found. Place SalesPulse Challenge Dataset.csv inside the data folder or project root."
    );
}

// ------------------------------------------
// STEP 2: CSV PARSER
// Supports quoted values and commas in fields
// ------------------------------------------

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

    // Add the final field and row
    row.push(field);

    if (row.some(value => value.trim() !== "")) {
        rows.push(row);
    }

    if (insideQuotes) {
        throw new Error("CSV file contains an unclosed quoted field.");
    }

    if (rows.length === 0) {
        return [];
    }

    const headers = rows[0].map(header =>
        header.trim().replace(/^\uFEFF/, "")
    );

    return rows.slice(1).map((values, index) => {
        if (values.length !== headers.length) {
            throw new Error(
                `CSV row ${index + 2} has ${values.length} columns; expected ${headers.length}.`
            );
        }

        const record = {};

        headers.forEach((header, columnIndex) => {
            record[header] = values[columnIndex].trim();
        });

        return record;
    });
}

// ------------------------------------------
// STEP 3: CSV OUTPUT HELPER
// ------------------------------------------

function convertToCSV(records) {
    if (!records.length) {
        return "";
    }

    const headers = Object.keys(records[0]);

    function escapeCSV(value) {
        if (Array.isArray(value)) {
            value = value.join("; ");
        }

        const text = String(value ?? "");

        if (/[",\n\r]/.test(text)) {
            return `"${text.replace(/"/g, '""')}"`;
        }

        return text;
    }

    const lines = [
        headers.map(escapeCSV).join(","),
        ...records.map(record =>
            headers.map(header => escapeCSV(record[header])).join(",")
        )
    ];

    return lines.join("\n");
}

// ------------------------------------------
// STEP 4: READ THE DATASET
// ------------------------------------------

function runSalesPulse() {
    console.log("\n==================================");
    console.log("       SALESPULSE ANALYTICS");
    console.log("==================================\n");

    const csvContent = fs.readFileSync(filePath, "utf8");
    const rawRecords = parseCSV(csvContent);

    console.log("Dataset loaded successfully.");
    console.log("Total raw records:", rawRecords.length);

    // --------------------------------------
    // STEP 5: DATA VALIDATION
    // --------------------------------------

    const validationResults = validateRecords(rawRecords);

    const validRecords = validationResults.validRecords;
    const invalidRecords = validationResults.invalidRecords;
    const validationSummary = validationResults.validationSummary;

    console.log("\n========== DATA VALIDATION ==========");
    console.log("Total records:", validationSummary.totalRecords);
    console.log("Valid records:", validationSummary.validRecords);
    console.log("Invalid records:", validationSummary.invalidRecords);

    console.log("\nValidation errors:");
    console.table(validationSummary.reasonCounts);

    // --------------------------------------
    // STEP 6: REVENUE METRICS
    // --------------------------------------

    const revenueResults =
        calculateRevenueMetrics(validRecords);

    console.log("\n========== REVENUE METRICS ==========");
    console.table([revenueResults]);

    // --------------------------------------
    // STEP 7: PRODUCT ANALYSIS
    // --------------------------------------

    const productResults =
        analyzeProducts(validRecords);

    console.log("\n========== PRODUCT ANALYSIS ==========");

    console.log("\nProduct-wise performance:");
    console.table(productResults.products);

    console.log("\nTop 5 products by revenue:");
    console.table(productResults.topFive);

    console.log("\nProduct with highest quantity sold:");
    console.table(
        productResults.highestQuantity
            ? [productResults.highestQuantity]
            : []
    );

    // --------------------------------------
    // STEP 8: REGIONAL ANALYSIS
    // --------------------------------------

    const regionResults =
        analyzeRegions(validRecords);

    console.log("\n========== REGIONAL ANALYSIS ==========");

    console.log("\nRegion-wise performance:");
    console.table(regionResults.regions);

    console.log("\nHighest revenue region:");
    console.table(
        regionResults.highestRevenueRegion
            ? [regionResults.highestRevenueRegion]
            : []
    );

    // --------------------------------------
    // STEP 9: CREATE REPORT FOLDER
    // --------------------------------------

    const reportFolder = path.join(
        __dirname,
        "..",
        "reports"
    );

    fs.mkdirSync(reportFolder, { recursive: true });

    // Save invalid records
    fs.writeFileSync(
        path.join(reportFolder, "invalid-records.csv"),
        convertToCSV(invalidRecords)
    );

    // Save product analysis
    fs.writeFileSync(
        path.join(reportFolder, "product-wise-revenue.csv"),
        convertToCSV(productResults.products)
    );

    // Save regional analysis
    fs.writeFileSync(
        path.join(reportFolder, "region-wise-analysis.csv"),
        convertToCSV(regionResults.regions)
    );

    // Save top five products
    fs.writeFileSync(
        path.join(reportFolder, "top-five-products.json"),
        JSON.stringify(productResults.topFive, null, 4)
    );

    // Save validation summary
    fs.writeFileSync(
        path.join(reportFolder, "validation-summary.json"),
        JSON.stringify(validationSummary, null, 4)
    );

    // --------------------------------------
    // STEP 10: GENERATE INSIGHTS
    // --------------------------------------

    const insights = [];
    const recommendations = [];

    if (productResults.topFive.length > 0) {
        const topProduct = productResults.topFive[0];

        insights.push(
            `The highest-revenue product is ${topProduct.ProductName}, generating ${topProduct.TotalRevenue.toFixed(2)} in revenue.`
        );

        recommendations.push(
            `Review the performance and availability of ${topProduct.ProductName} to identify opportunities to maintain or increase its sales.`
        );
    }

    if (productResults.highestQuantity) {
        const popularProduct = productResults.highestQuantity;

        insights.push(
            `${popularProduct.ProductName} has the highest total quantity sold, with ${popularProduct.TotalQuantity} units.`
        );
    }

    if (regionResults.highestRevenueRegion) {
        const topRegion = regionResults.highestRevenueRegion;

        insights.push(
            `${topRegion.Region} is the highest-revenue region, generating ${topRegion.TotalRevenue.toFixed(2)}.`
        );

        recommendations.push(
            `Study the sales performance in ${topRegion.Region} and identify successful practices that could be applied to other regions.`
        );
    }

    const lossMakingRegions = regionResults.regions.filter(
        region => region.EstimatedGrossProfit < 0
    );

    if (lossMakingRegions.length > 0) {
        insights.push(
            `${lossMakingRegions.length} region(s) have negative estimated gross profit.`
        );

        recommendations.push(
            "Investigate loss-making regions and review product costs, pricing and sales mix."
        );
    }

    if (invalidRecords.length > 0) {
        recommendations.push(
            "Improve data entry checks to reduce missing fields, invalid values and duplicate Order IDs."
        );
    }

    // Ensure at least three insights where possible
    if (insights.length < 3) {
        insights.push(
            `The dataset contains ${validRecords.length} valid orders and ${invalidRecords.length} invalid records.`
        );
    }

    if (insights.length < 3) {
        insights.push(
            `Total quantity sold across valid orders is ${revenueResults.totalQuantitySold}.`
        );
    }

    // --------------------------------------
    // STEP 11: GENERATE FINAL REPORT
    // --------------------------------------

    const report = `
# SALESPULSE - FINAL SALES ANALYTICS REPORT

## 1. Data Quality Summary

- Total records: ${validationSummary.totalRecords}
- Valid records: ${validationSummary.validRecords}
- Invalid records: ${validationSummary.invalidRecords}

### Validation Error Counts

${Object.entries(validationSummary.reasonCounts)
    .map(([reason, count]) => `- ${reason}: ${count}`)
    .join("\n") || "- No validation errors found."}

## 2. Overall Revenue Metrics

- Total Revenue: ${revenueResults.totalRevenue.toFixed(2)}
- Total Valid Orders: ${revenueResults.totalValidOrders}
- Average Order Value: ${revenueResults.averageOrderValue.toFixed(2)}
- Total Quantity Sold: ${revenueResults.totalQuantitySold}
- Estimated Gross Profit: ${revenueResults.estimatedGrossProfit.toFixed(2)}

## 3. Product Analysis

### Top 5 Products by Revenue

${productResults.topFive.map((product, index) =>
    `${index + 1}. ${product.ProductName} - Revenue: ${product.TotalRevenue.toFixed(2)}, Quantity: ${product.TotalQuantity}`
).join("\n") || "No valid product records."}

### Highest Quantity Product

${productResults.highestQuantity
    ? `${productResults.highestQuantity.ProductName} - ${productResults.highestQuantity.TotalQuantity} units`
    : "No product data available."}

## 4. Regional Analysis

${regionResults.regions.map(region =>
    `- ${region.Region}: Revenue ${region.TotalRevenue.toFixed(2)}, Estimated Gross Profit ${region.EstimatedGrossProfit.toFixed(2)}, Orders ${region.TotalOrders}`
).join("\n") || "No regional data available."}

### Highest Revenue Region

${regionResults.highestRevenueRegion
    ? regionResults.highestRevenueRegion.Region
    : "No regional data available."}

## 5. Key Business Insights

${insights.map((insight, index) =>
    `${index + 1}. ${insight}`
).join("\n")}

## 6. Recommendations

${recommendations.map((recommendation, index) =>
    `${index + 1}. ${recommendation}`
).join("\n")}

---

Report generated by the SalesPulse Analytics Application.
`;

    fs.writeFileSync(
        path.join(reportFolder, "final-report.md"),
        report.trim()
    );

    // --------------------------------------
    // STEP 12: COMPLETION MESSAGE
    // --------------------------------------

    console.log("\n==================================");
    console.log(" SALESPULSE ANALYSIS COMPLETED");
    console.log("==================================");

    console.log("\nReports saved inside the reports folder:");
    console.log("- invalid-records.csv");
    console.log("- product-wise-revenue.csv");
    console.log("- region-wise-analysis.csv");
    console.log("- top-five-products.json");
    console.log("- validation-summary.json");
    console.log("- final-report.md");

    console.log("\nAll modules executed successfully!");
}

// Run application
try {
    runSalesPulse();
} catch (error) {
    console.error("\nSalesPulse execution failed:");
    console.error(error.message);
    process.exitCode = 1;
}
