-- ============================================
-- EZYPC Database Schema
-- PostgreSQL Compatible
-- ============================================

-- ============================================
-- MAIN TABLE: products
-- ============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    brand TEXT,
    category TEXT NOT NULL CHECK (category IN ('Laptop', 'Prebuilt PC', 'Custom Build')),
    use_case TEXT, -- 'Gaming', 'Office', 'Editing', 'Student', 'General', etc.
    description TEXT,
    rationale TEXT, -- Why this product is recommended (for AI context)
    price_min INTEGER NOT NULL, -- Lowest available price in INR
    price_max INTEGER, -- Highest available price (optional, for price ranges)
    image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_best_match BOOLEAN DEFAULT false, -- For AI recommendations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_use_case ON products(use_case);
CREATE INDEX idx_products_price_min ON products(price_min);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_price_range ON products(price_min, price_max);

-- ============================================
-- TABLE: product_specs
-- ============================================
CREATE TABLE product_specs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    spec_name TEXT NOT NULL, -- 'Processor', 'Graphics Card', 'RAM', 'Storage', etc.
    spec_value TEXT NOT NULL, -- 'Ryzen 7 7735HS', 'RTX 4060', '16GB DDR5', etc.
    display_order INTEGER DEFAULT 0, -- For ordering specs in UI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, spec_name) -- One spec name per product
);

CREATE INDEX idx_product_specs_product_id ON product_specs(product_id);
CREATE INDEX idx_product_specs_name ON product_specs(spec_name);

-- ============================================
-- TABLE: product_prices
-- ============================================
CREATE TABLE product_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    vendor TEXT NOT NULL CHECK (vendor IN ('Amazon', 'Flipkart', 'Other')),
    price INTEGER NOT NULL, -- Price in INR
    affiliate_url TEXT NOT NULL,
    is_available BOOLEAN DEFAULT true,
    last_checked TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, vendor) -- One price per vendor per product
);

CREATE INDEX idx_product_prices_product_id ON product_prices(product_id);
CREATE INDEX idx_product_prices_vendor ON product_prices(vendor);
CREATE INDEX idx_product_prices_price ON product_prices(price);
CREATE INDEX idx_product_prices_available ON product_prices(is_available);

-- ============================================
-- TABLE: tags
-- ============================================
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL, -- 'Budget', 'Gaming', 'Portable', 'High Performance', etc.
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_tags_slug ON tags(slug);

-- ============================================
-- TABLE: product_tags (Many-to-Many)
-- ============================================
CREATE TABLE product_tags (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, tag_id)
);

CREATE INDEX idx_product_tags_product_id ON product_tags(product_id);
CREATE INDEX idx_product_tags_tag_id ON product_tags(tag_id);

-- ============================================
-- TABLE: product_reviews (Optional)
-- ============================================
CREATE TABLE product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    source TEXT NOT NULL, -- 'Amazon', 'Flipkart', 'User', etc.
    author TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_rating ON product_reviews(rating);

-- ============================================
-- TABLE: similar_products (For AI recommendations)
-- ============================================
CREATE TABLE similar_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    similar_to_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    similarity_score DECIMAL(3,2) DEFAULT 0.5, -- 0.0 to 1.0
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, similar_to_product_id),
    CHECK (product_id != similar_to_product_id) -- Can't be similar to itself
);

CREATE INDEX idx_similar_products_product_id ON similar_products(product_id);
CREATE INDEX idx_similar_products_similar_to ON similar_products(similar_to_product_id);
CREATE INDEX idx_similar_products_score ON similar_products(similarity_score DESC);

-- ============================================
-- TRIGGERS: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEW: product_with_min_price (Helper view)
-- ============================================
CREATE OR REPLACE VIEW product_with_min_price AS
SELECT 
    p.*,
    COALESCE(MIN(pp.price), p.price_min) as current_min_price,
    COUNT(DISTINCT pp.vendor) as vendor_count
FROM products p
LEFT JOIN product_prices pp ON p.id = pp.product_id AND pp.is_available = true
WHERE p.is_active = true
GROUP BY p.id;

-- ============================================
-- SAMPLE QUERIES FOR AI INTEGRATION
-- ============================================

-- Query 1: Get products by budget range and category
-- SELECT * FROM products 
-- WHERE category = 'Laptop' 
--   AND price_min BETWEEN 50000 AND 100000
--   AND is_active = true
-- ORDER BY price_min ASC
-- LIMIT 3;

-- Query 2: Get products by use case
-- SELECT * FROM products 
-- WHERE use_case = 'Gaming'
--   AND is_active = true
-- ORDER BY is_featured DESC, price_min ASC
-- LIMIT 5;

-- Query 3: Get similar products
-- SELECT p.* FROM products p
-- JOIN similar_products sp ON p.id = sp.product_id
-- WHERE sp.similar_to_product_id = 'some-product-id'
--   AND p.is_active = true
-- ORDER BY sp.similarity_score DESC
-- LIMIT 3;

-- Query 4: Get products with prices from all vendors
-- SELECT 
--     p.*,
--     pp.vendor,
--     pp.price,
--     pp.affiliate_url
-- FROM products p
-- JOIN product_prices pp ON p.id = pp.product_id
-- WHERE p.id = 'some-product-id'
--   AND pp.is_available = true
-- ORDER BY pp.price ASC;

-- Query 5: Get products by tags
-- SELECT DISTINCT p.* FROM products p
-- JOIN product_tags pt ON p.id = pt.product_id
-- JOIN tags t ON pt.tag_id = t.id
-- WHERE t.name IN ('Gaming', 'Budget')
--   AND p.is_active = true
-- ORDER BY p.price_min ASC;
