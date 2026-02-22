# EZYPC Database Schema Design

## Overview

This database schema is designed to support a PC & Laptop affiliate recommendation website where AI selects real products from the database instead of generating fake ones.

---

## Database Structure

### Core Tables

1. **products** - Main product catalog
2. **product_specs** - Product specifications (one-to-many)
3. **product_prices** - Vendor prices and affiliate links (one-to-many)
4. **tags** - Product tags for filtering
5. **product_tags** - Many-to-many relationship between products and tags
6. **product_reviews** - Product reviews (optional)
7. **similar_products** - Pre-computed similarity relationships

---

## Table Relationships

```
products (1) ──< (many) product_specs
products (1) ──< (many) product_prices
products (1) ──< (many) product_reviews
products (many) ──< product_tags >── (many) tags
products (1) ──< (many) similar_products ──> (1) products
```

---

## Detailed Table Definitions

### 1. `products` Table

**Purpose**: Main product catalog storing all PC/laptop products.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `title` | TEXT | NOT NULL | Product name (e.g., "ASUS TUF Gaming A15") |
| `slug` | TEXT | UNIQUE, NOT NULL | URL-friendly identifier |
| `brand` | TEXT | | Manufacturer (e.g., "ASUS", "Dell") |
| `category` | TEXT | NOT NULL, CHECK | "Laptop", "Prebuilt PC", or "Custom Build" |
| `use_case` | TEXT | | "Gaming", "Office", "Editing", "Student", "General" |
| `description` | TEXT | | Full product description |
| `rationale` | TEXT | | Why this product is recommended (for AI context) |
| `price_min` | INTEGER | NOT NULL | Lowest available price in INR |
| `price_max` | INTEGER | | Highest available price (optional) |
| `image_url` | TEXT | | Product image URL |
| `is_featured` | BOOLEAN | DEFAULT false | Featured product flag |
| `is_active` | BOOLEAN | DEFAULT true | Active/inactive status |
| `is_best_match` | BOOLEAN | DEFAULT false | Best match flag for AI recommendations |
| `created_at` | TIMESTAMP | DEFAULT NOW | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW | Last update timestamp |

**Key Indexes**:
- `category` - For filtering by product type
- `use_case` - For use-case-based recommendations
- `price_min` - For budget-based queries
- `is_featured` - For featured products
- `is_active` - For active products only

---

### 2. `product_specs` Table

**Purpose**: Store multiple specifications per product (CPU, GPU, RAM, Storage, etc.).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `product_id` | UUID | FOREIGN KEY → products.id | Product reference |
| `spec_name` | TEXT | NOT NULL | Spec category (e.g., "Processor", "Graphics Card") |
| `spec_value` | TEXT | NOT NULL | Spec value (e.g., "Ryzen 7 7735HS", "RTX 4060") |
| `display_order` | INTEGER | DEFAULT 0 | Order for UI display |
| `created_at` | TIMESTAMP | DEFAULT NOW | Creation timestamp |

**Unique Constraint**: `(product_id, spec_name)` - One spec name per product

**Example Data**:
```
product_id | spec_name      | spec_value
-----------|----------------|------------------
abc-123    | Processor      | Ryzen 7 7735HS
abc-123    | Graphics Card  | RTX 4060
abc-123    | RAM            | 16GB DDR5
abc-123    | Storage        | 512GB SSD
```

---

### 3. `product_prices` Table

**Purpose**: Store prices from different vendors (Amazon, Flipkart) with affiliate links.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `product_id` | UUID | FOREIGN KEY → products.id | Product reference |
| `vendor` | TEXT | NOT NULL, CHECK | "Amazon", "Flipkart", or "Other" |
| `price` | INTEGER | NOT NULL | Price in INR |
| `affiliate_url` | TEXT | NOT NULL | Affiliate link URL |
| `is_available` | BOOLEAN | DEFAULT true | Availability status |
| `last_checked` | TIMESTAMP | DEFAULT NOW | Last price check timestamp |
| `created_at` | TIMESTAMP | DEFAULT NOW | Creation timestamp |

**Unique Constraint**: `(product_id, vendor)` - One price per vendor per product

**Example Data**:
```
product_id | vendor   | price   | affiliate_url              | is_available
-----------|----------|---------|----------------------------|-------------
abc-123    | Amazon   | 89999   | https://amzn.to/...       | true
abc-123    | Flipkart | 87999   | https://fkrt.it/...       | true
```

---

### 4. `tags` Table

**Purpose**: Store product tags for filtering and AI logic.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `name` | TEXT | UNIQUE, NOT NULL | Tag name (e.g., "Budget", "Gaming", "Portable") |
| `slug` | TEXT | UNIQUE, NOT NULL | URL-friendly tag identifier |
| `created_at` | TIMESTAMP | DEFAULT NOW | Creation timestamp |

**Example Tags**:
- "Budget"
- "Gaming"
- "High Performance"
- "Portable"
- "Student-Friendly"
- "RGB"

---

### 5. `product_tags` Table

**Purpose**: Many-to-many relationship between products and tags.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `product_id` | UUID | FOREIGN KEY → products.id | Product reference |
| `tag_id` | UUID | FOREIGN KEY → tags.id | Tag reference |

**Primary Key**: `(product_id, tag_id)`

---

### 6. `product_reviews` Table (Optional)

**Purpose**: Store product reviews from various sources.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `product_id` | UUID | FOREIGN KEY → products.id | Product reference |
| `source` | TEXT | NOT NULL | Review source ("Amazon", "Flipkart", "User") |
| `author` | TEXT | | Review author name |
| `rating` | INTEGER | NOT NULL, CHECK (1-5) | Rating (1 to 5 stars) |
| `content` | TEXT | | Review text |
| `created_at` | TIMESTAMP | DEFAULT NOW | Creation timestamp |

---

### 7. `similar_products` Table

**Purpose**: Pre-computed similarity relationships for "similar products" feature.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `product_id` | UUID | FOREIGN KEY → products.id | Product reference |
| `similar_to_product_id` | UUID | FOREIGN KEY → products.id | Similar product reference |
| `similarity_score` | DECIMAL(3,2) | DEFAULT 0.5 | Similarity score (0.0 to 1.0) |
| `created_at` | TIMESTAMP | DEFAULT NOW | Creation timestamp |

**Unique Constraint**: `(product_id, similar_to_product_id)`
**Check Constraint**: `product_id != similar_to_product_id`

---

## Helper View

### `product_with_min_price`

A view that combines products with their current minimum price from all vendors.

```sql
SELECT 
    p.*,
    COALESCE(MIN(pp.price), p.price_min) as current_min_price,
    COUNT(DISTINCT pp.vendor) as vendor_count
FROM products p
LEFT JOIN product_prices pp ON p.id = pp.product_id AND pp.is_available = true
WHERE p.is_active = true
GROUP BY p.id;
```

---

## How AI Will Query This Database

### 1. **Budget-Based Recommendations**

**Use Case**: User selects budget range (e.g., ₹60,000 - ₹1,00,000)

```sql
SELECT p.*, 
       ps.spec_name, 
       ps.spec_value
FROM products p
LEFT JOIN product_specs ps ON p.id = ps.product_id
WHERE p.category = 'Laptop'
  AND p.price_min BETWEEN 60000 AND 100000
  AND p.is_active = true
ORDER BY p.price_min ASC
LIMIT 3;
```

**AI Logic**: AI receives products within budget, formats them into JSON response.

---

### 2. **Use-Case-Based Recommendations**

**Use Case**: User selects "Gaming" use case

```sql
SELECT p.*,
       ps.spec_name,
       ps.spec_value
FROM products p
LEFT JOIN product_specs ps ON p.id = ps.product_id
WHERE p.use_case = 'Gaming'
  AND p.is_active = true
ORDER BY p.is_featured DESC, p.price_min ASC
LIMIT 5;
```

**AI Logic**: AI filters results, ensures GPU specs match gaming requirements, returns top matches.

---

### 3. **Similar Products**

**Use Case**: User views a product, wants similar alternatives

```sql
SELECT p.*
FROM products p
JOIN similar_products sp ON p.id = sp.product_id
WHERE sp.similar_to_product_id = 'target-product-id'
  AND p.is_active = true
ORDER BY sp.similarity_score DESC
LIMIT 3;
```

**AI Logic**: AI can also compute similarity on-the-fly based on specs, price range, category.

---

### 4. **Price Comparison**

**Use Case**: Show prices from all vendors

```sql
SELECT 
    p.title,
    pp.vendor,
    pp.price,
    pp.affiliate_url
FROM products p
JOIN product_prices pp ON p.id = pp.product_id
WHERE p.id = 'product-id'
  AND pp.is_available = true
ORDER BY pp.price ASC;
```

**AI Logic**: AI formats price comparison data for UI display.

---

### 5. **Tag-Based Filtering**

**Use Case**: Filter by tags (e.g., "Budget" + "Gaming")

```sql
SELECT DISTINCT p.*
FROM products p
JOIN product_tags pt ON p.id = pt.product_id
JOIN tags t ON pt.tag_id = t.id
WHERE t.name IN ('Budget', 'Gaming')
  AND p.is_active = true
ORDER BY p.price_min ASC;
```

**AI Logic**: AI uses tags to narrow down recommendations.

---

### 6. **Popular Products (Featured)**

**Use Case**: Show featured/popular products on homepage

```sql
SELECT p.*,
       COUNT(DISTINCT pr.id) as review_count,
       AVG(pr.rating) as avg_rating
FROM products p
LEFT JOIN product_reviews pr ON p.id = pr.product_id
WHERE p.is_featured = true
  AND p.is_active = true
GROUP BY p.id
ORDER BY avg_rating DESC, review_count DESC
LIMIT 9;
```

**AI Logic**: AI formats featured products with reviews for homepage display.

---

## AI Integration Flow

### Current Flow (Before Database):
1. User answers questions → AI generates fake products → Display

### New Flow (With Database):
1. User answers questions → AI queries database → AI selects matching products → AI formats response → Display

### Example AI Prompt:
```
User Requirements:
- Use Case: Gaming
- Budget: ₹60,000 - ₹1,00,000
- Preferences: High FPS, RTX GPU

Query Database:
SELECT products matching criteria
Format as JSON with:
- Product details
- Specs
- Prices from all vendors
- Affiliate links
```

---

## Key Benefits

✅ **Real Products**: No more fake AI-generated products  
✅ **Price Accuracy**: Real-time prices from vendors  
✅ **Affiliate Tracking**: Proper affiliate link management  
✅ **Scalability**: Can handle thousands of products  
✅ **Filtering**: Fast queries by category, price, tags  
✅ **Similar Products**: Pre-computed or on-the-fly similarity  
✅ **Reviews**: Real reviews from vendors  
✅ **AI Integration**: AI selects from real data, formats response  

---

## Next Steps (Future Implementation)

1. **Set up Supabase/PostgreSQL** database
2. **Create migration scripts** to populate initial data
3. **Update AI service** to query database instead of generating
4. **Build admin panel** for product management
5. **Set up price monitoring** cron jobs
6. **Implement similarity calculation** algorithm

---

## Notes

- All prices stored in **INR** (Indian Rupees)
- UUIDs used for all primary keys (better for distributed systems)
- Timestamps use `TIMESTAMP WITH TIME ZONE` for timezone awareness
- Foreign keys use `ON DELETE CASCADE` for data integrity
- Indexes optimized for common query patterns
- `slug` fields for SEO-friendly URLs
