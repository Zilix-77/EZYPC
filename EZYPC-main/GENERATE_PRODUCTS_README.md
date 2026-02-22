# Product Data Generator

This script generates realistic product data for the EZYPC affiliate website and exports it as CSV files for Supabase import.

## Usage

```bash
node generate-products.js
```

## Output

The script generates 3 CSV files:

1. **products.csv** - Main product catalog (501 products)
2. **product_specs.csv** - Product specifications
3. **product_prices.csv** - Vendor prices and affiliate links

## Features

✅ **501 Products** - Exactly 501 products generated  
✅ **11 Indian Brands** - ASUS, MSI, Acer, Lenovo, HP, Dell, Gigabyte, Infinix, Samsung, Zebronics, Ant Esports  
✅ **8 Use Cases** - Gaming, Office, Editing, Student, Programming, Mixed Use, Streaming, Content Creation  
✅ **Price Distribution** - Weighted distribution matching Indian market:
   - 30K-45K: 20%
   - 45K-60K: 20%
   - 60K-80K: 25%
   - 80K-1.2L: 20%
   - 1.2L-1.6L: 10%
   - 1.6L-2L: 5%

✅ **Realistic Specs** - CPU/GPU combinations based on price range  
✅ **Multiple Variants** - Different RAM/Storage combinations per model  
✅ **Affiliate Links** - Amazon and Flipkart affiliate URLs  
✅ **Deterministic Images** - Picsum seed-based image URLs  

## CSV Format

### products.csv
- id, title, slug, brand, category, use_case, description, rationale, price_min, price_max, image_url, is_featured, is_active

### product_specs.csv
- id, product_id, spec_name, spec_value

### product_prices.csv
- id, product_id, vendor, price, affiliate_url

## Importing to Supabase

1. Open Supabase Dashboard
2. Go to Table Editor
3. Select the table (products, product_specs, or product_prices)
4. Click "Insert" → "Import data from CSV"
5. Upload the corresponding CSV file
6. Map columns if needed
7. Import

## Notes

- All prices are in **INR** (Indian Rupees)
- UUIDs are generated using `crypto.randomUUID()`
- Affiliate URLs use placeholder tags (update `yourtag-21` with your actual Amazon affiliate tag)
- Image URLs use Picsum Photos with deterministic seeds
