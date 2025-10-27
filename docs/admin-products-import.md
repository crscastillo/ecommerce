# Admin Products CSV Import Guide

This guide explains how to use the CSV import feature in the admin products panel to bulk import products into your store.

## 🚀 Quick Start

1. Navigate to `/admin/products` in your store's admin panel
2. Click the **"Import CSV"** button in the top-right corner
3. Follow the 4-step wizard to upload and import your products

## 📋 CSV File Requirements

### File Format
- **File Type**: `.csv` (Comma Separated Values)
- **Encoding**: UTF-8 recommended
- **Headers**: First row must contain column headers
- **Data**: Subsequent rows contain product data

### Basic CSV Structure
```csv
name,price,description,sku,inventory_quantity,category_slug,image_url,is_active
"Sample Product",29.99,"A great product description","SKU001",100,"electronics","https://example.com/product-image.jpg",true
"Another Product",49.99,"Another description","SKU002",50,"clothing","https://example.com/another-image.jpg",true
```

## 📊 Supported Product Properties

| Column | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| `name` | Text | ✅ | Product name | "Wireless Headphones" |
| `price` | Number | ✅ | Product price | 29.99 |
| `slug` | Text | | URL slug (auto-generated if empty) | "wireless-headphones" |
| `description` | Text | | Full product description | "High-quality wireless..." |
| `short_description` | Text | | Brief product summary | "Premium wireless headphones" |
| `compare_price` | Number | | Original price for discounts | 39.99 |
| `cost_price` | Number | | Cost for profit calculations | 15.00 |
| `sku` | Text | | Stock Keeping Unit | "WH001" |
| `inventory_quantity` | Number | | Stock quantity | 100 |
| `weight` | Number | | Product weight in kg | 0.5 |
| `tags` | Text | | Comma-separated tags | "electronics,wireless,audio" |
| `is_active` | Boolean | | Active status | true, false, 1, 0, yes, no |
| `is_featured` | Boolean | | Featured status | true, false, 1, 0, yes, no |
| `category_slug` | Text | | Category identifier | "electronics" |
| `image_url` | URL | | Product image URL | "https://example.com/image.jpg" |

### Data Type Details

#### Boolean Values
The following values are accepted for boolean fields (`is_active`, `is_featured`):
- **True**: `true`, `1`, `yes`, `active`
- **False**: `false`, `0`, `no`, `inactive`

#### Image URLs
When providing `image_url` values:
- Must be a valid, publicly accessible URL
- Supported formats: JPEG, PNG, WebP, GIF
- Images will be automatically downloaded and uploaded to secure storage
- Maximum file size: 50MB per image
- If download fails, the product will still be created without an image

#### Tags Format
Multiple tags should be separated by commas:
```csv
tags
"electronics,wireless,bluetooth,audio"
```

#### Category Slugs
Must match existing category slugs in your store. Categories need to be created before importing products.

## 🎯 Step-by-Step Import Process

### Step 1: Upload CSV File

1. **Download Template** (recommended): Click "Download Template" to get a properly formatted CSV file
2. **Select File**: Click the upload area or drag and drop your CSV file
3. **File Validation**: The system validates that it's a proper CSV file with headers

### Step 2: Map CSV Columns

1. **Column Detection**: The system automatically reads your CSV headers
2. **Preview Data**: See example data from the first row for each column
3. **Map Properties**: Select which product property each CSV column maps to
4. **Required Fields**: Ensure required fields (marked with *) are mapped
5. **Skip Columns**: Leave unmapped any columns you don't want to import

#### Mapping Example
```
CSV Column: "Product Name" → Product Property: "Product Name"
CSV Column: "Cost" → Product Property: "Price"
CSV Column: "Stock" → Product Property: "Inventory Quantity"
```

### Step 3: Validate Data

1. **Automatic Validation**: The system checks all your data
2. **Error Review**: Any validation errors are displayed with specific details
3. **Error Types**:
   - Missing required fields
   - Invalid data types (e.g., text in number fields)
   - Non-existent category slugs
   - Invalid boolean values

#### Common Validation Errors
- **"Product Name is required"**: Name field is empty
- **"Price must be a valid number"**: Price contains non-numeric characters
- **"Category with slug 'xyz' not found"**: Category doesn't exist in your store

### Step 4: Import Products

1. **Progress Tracking**: Real-time progress bar shows import status
2. **Error Handling**: Individual product failures don't stop the entire import
3. **Completion Report**: Summary showing successful imports vs errors
4. **Auto-Refresh**: Product list automatically updates after import

## 📁 CSV Template

### Download Template
Use the "Download Template" button in the import modal to get a properly formatted CSV file with example data.

### Manual Template Creation
```csv
name,price,description,short_description,sku,inventory_quantity,category_slug,is_active,is_featured,compare_price,cost_price,weight,tags
"Wireless Bluetooth Headphones",79.99,"Premium wireless headphones with noise cancellation","High-quality wireless headphones","WH001",50,"electronics",true,true,99.99,35.00,0.3,"electronics,audio,wireless,bluetooth"
"Cotton T-Shirt",24.99,"Comfortable 100% cotton t-shirt","Soft cotton t-shirt","TS001",100,"clothing",true,false,29.99,12.50,0.2,"clothing,cotton,casual"
"Ceramic Coffee Mug",12.99,"Handcrafted ceramic coffee mug","Beautiful ceramic mug","MUG001",25,"home",true,false,15.99,6.00,0.4,"home,kitchen,ceramic,coffee"
```

## ⚠️ Important Notes

### Before Import
1. **Create Categories**: Ensure all categories referenced in `category_slug` exist
2. **Backup Data**: Consider backing up existing products before large imports
3. **Test Small Batch**: Try importing a few products first to verify your CSV format

### During Import
1. **Don't Close Browser**: Keep the browser tab open during import
2. **Wait for Completion**: Don't navigate away until import is finished
3. **Monitor Progress**: Watch for any error messages during validation

### After Import
1. **Review Products**: Check that products imported correctly
2. **Verify Categories**: Ensure products are assigned to correct categories
3. **Check Images**: Review that product images were downloaded and uploaded successfully from provided URLs
4. **Update Inventory**: Verify inventory quantities are correct

## 🔧 Troubleshooting

### Common Issues

#### "CSV file must have at least a header row and one data row"
- **Problem**: CSV file is empty or only has headers
- **Solution**: Add at least one row of product data

#### "Error parsing CSV file"
- **Problem**: Invalid CSV format or encoding
- **Solution**: 
  - Save file as CSV UTF-8 format
  - Check for unescaped quotes or commas
  - Use the provided template as reference

#### "Required field 'Product Name' is not mapped"
- **Problem**: Required fields aren't mapped to CSV columns
- **Solution**: Map all required fields (name, price) in Step 2

#### "Category with slug 'xyz' not found"
- **Problem**: CSV references non-existent category
- **Solution**: 
  - Create the category first
  - Update CSV with correct category slug
  - Or map the column to skip importing categories

### Performance Tips

#### Large Imports
- **Batch Size**: Import in batches of 100-500 products for optimal performance
- **File Size**: Keep CSV files under 5MB for best results
- **Connection**: Ensure stable internet connection for large imports

#### Memory Considerations
- **Browser Memory**: Close other tabs during large imports
- **Server Limits**: Very large imports may timeout (split into smaller files)

## 🎨 CSV Format Examples

### Minimal Required Fields
```csv
name,price
"Basic Product",19.99
"Another Product",29.99
```

### Complete Product Information
```csv
name,price,description,short_description,sku,inventory_quantity,category_slug,is_active,is_featured,compare_price,cost_price,weight,tags
"Premium Wireless Speaker",149.99,"High-fidelity wireless speaker with 20-hour battery life and waterproof design","Premium waterproof wireless speaker","SPK001",30,"electronics",true,true,199.99,75.00,1.2,"electronics,audio,wireless,waterproof,portable"
```

### Boolean Value Examples
```csv
name,price,is_active,is_featured
"Active Featured Product",29.99,true,yes
"Active Product",19.99,1,no
"Inactive Product",39.99,false,0
```

## 🚀 Advanced Features

### Auto-Generated Slugs
If you don't provide a `slug` column, the system automatically generates URL-friendly slugs from the product name:
- "Wireless Headphones" → "wireless-headphones"
- "100% Cotton T-Shirt" → "100-cotton-t-shirt"

### Inventory Management
- Products are automatically set to track inventory
- Backorders are disabled by default
- Set `inventory_quantity` to 0 for out-of-stock products

### Default Values
The system applies these defaults for missing optional fields:
- `is_active`: true
- `is_featured`: false
- `inventory_quantity`: 0
- `track_inventory`: true
- `allow_backorder`: false

## 📞 Support

If you encounter issues with CSV import:

1. **Check Validation Errors**: The system provides detailed error messages
2. **Use Template**: Download and modify the provided template
3. **Test Small Batches**: Import a few products first to verify format
4. **Contact Support**: Reach out with your CSV file for format assistance

---

**Last Updated**: October 2024  
**Version**: 1.6.0