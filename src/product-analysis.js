const fs = require("fs");
const path = require("path");

// Step 1: Read CSV file
const filePath = path.join(
    __dirname,
    "..",
    "SalesPulse Challenge Dataset.csv"
);

const data = fs.readFileSync(filePath, "utf8");

// Step 2: Convert CSV into objects
function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    const headers = lines[0].split(",");

    return lines.slice(1).map(line => {
        const values = line.split(",");
        const obj = {};

        headers.forEach((header, index) => {
            obj[header.trim()] = values[index]?.trim();
        });

        return obj;
    });
}

const records = parseCSV(data);

// Step 3: Group products
const products = new Map();

// Step 4: Calculate revenue and quantity
records.forEach(item => {
    const name = item.ProductName;

    if (!name) return;

    const quantity = Number(item.Quantity);
    const price = Number(item.UnitPrice);

    const revenue = quantity * price;

    if (!products.has(name)) {
        products.set(name, {
            ProductName: name,
            TotalQuantity: 0,
            TotalRevenue: 0
        });
    }

    const product = products.get(name);

    product.TotalQuantity += quantity;
    product.TotalRevenue += revenue;
});

// Step 5: Convert products into array
const result = Array.from(products.values());

// Step 6: Sort by revenue
result.sort((a, b) => b.TotalRevenue - a.TotalRevenue);

// Step 7: Display product revenue
console.log("PRODUCT-WISE REVENUE");
console.table(result);

// Step 8: Find top five products
const topFive = result.slice(0, 5);

console.log("TOP FIVE PRODUCTS");
console.table(topFive);

// Step 9: Find highest quantity product
const highestQuantity = [...result].sort(
    (a, b) => b.TotalQuantity - a.TotalQuantity
)[0];

console.log("HIGHEST QUANTITY PRODUCT");
console.log(highestQuantity);

// Step 10: Save results in CSV
const output = [
    "ProductName,TotalQuantity,TotalRevenue",
    ...result.map(p =>
        `${p.ProductName},${p.TotalQuantity},${p.TotalRevenue}`
    )
].join("\n");

fs.writeFileSync(
    path.join(__dirname, "..", "product-wise-revenue.csv"),
    output
);

// Step 11: Save top five in JSON
fs.writeFileSync(
    path.join(__dirname, "..", "top-five-products.json"),
    JSON.stringify(topFive, null, 2)
);

console.log("PRODUCT ANALYSIS COMPLETED!");console.log("TOP FIVE PRODUCTS:");
console.table(topFive);

console.log("HIGHEST QUANTITY PRODUCT:");
console.log(highestQuantity);

console.log("PRODUCT ANALYSIS COMPLETED!");