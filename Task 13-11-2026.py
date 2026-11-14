import pandas as pd
df = pd.read_csv(r"C:\Users\NEVILLE R\Downloads\SalesPulse Challenge Dataset.csv")
print(df.head())

# Clean column names and remove extra spaces
df.columns = df.columns.str.strip()

# Handle empty strings as missing values
df = df.replace(r'^\s*$', pd.NA, regex=True)

# Convert numeric columns into numeric data types
numeric_cols = ["Quantity", "UnitPrice", "UnitCost"]

for col in numeric_cols:
    df[col] = pd.to_numeric(df[col], errors="coerce")

# Identify validation issues

df["Missing_OrderID"] = df["OrderID"].isna()

df["Invalid_Quantity"] = (
    df["Quantity"].isna() | (df["Quantity"] <= 0)
)

df["Invalid_UnitPrice"] = (
    df["UnitPrice"].isna() | (df["UnitPrice"] <= 0)
)

df["Negative_UnitCost"] = (
    df["UnitCost"].isna() | (df["UnitCost"] < 0)
)

df["Missing_ProductName"] = df["ProductName"].isna()

df["Missing_Region"] = df["Region"].isna()

# Mark every occurrence of duplicate Order IDs
df["Duplicate_OrderID"] = (
    df["OrderID"].notna() &
    df["OrderID"].duplicated(keep=False)
)

# Create a validation summary
validation_summary = pd.DataFrame({
    "Validation Issue": [
        "Missing Order IDs",
        "Zero or Negative Quantities",
        "Zero or Negative Unit Prices",
        "Negative Unit Costs",
        "Missing Product Names",
        "Missing Regions",
        "Duplicate Order IDs"
    ],
    "Invalid Records": [
        df["Missing_OrderID"].sum(),
        df["Invalid_Quantity"].sum(),
        df["Invalid_UnitPrice"].sum(),
        df["Negative_UnitCost"].sum(),
        df["Missing_ProductName"].sum(),
        df["Missing_Region"].sum(),
        df["Duplicate_OrderID"].sum()
    ]
})

print("DATA VALIDATION SUMMARY")
print(validation_summary.to_string(index=False))

# Identify all invalid records
validation_columns = [
    "Missing_OrderID",
    "Invalid_Quantity",
    "Invalid_UnitPrice",
    "Negative_UnitCost",
    "Missing_ProductName",
    "Missing_Region",
    "Duplicate_OrderID"
]

df["Total_Issues"] = df[validation_columns].sum(axis=1)

invalid_records = df[df["Total_Issues"] > 0].copy()

# Display invalid records
print("\nINVALID RECORDS:")
print(invalid_records.to_string(index=False))

# Overall validation statistics
print("\nTOTAL RECORDS:", len(df))
print("TOTAL INVALID RECORDS:", len(invalid_records))
print("TOTAL VALID RECORDS:", len(df) - len(invalid_records))

# Export results without deleting invalid records
validation_summary.to_csv("validation_summary.csv", index=False)
invalid_records.to_csv("invalid_records.csv", index=False)
df.to_csv("validated_orders.csv", index=False)