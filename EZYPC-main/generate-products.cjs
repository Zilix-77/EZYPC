const fs = require('fs');
const crypto = require('crypto');

const BRANDS = [
  'ASUS', 'MSI', 'Acer', 'Lenovo', 'HP', 'Dell',
  'Gigabyte', 'Infinix', 'Samsung', 'Zebronics', 'Ant Esports'
];

const USE_CASES = [
  'Gaming', 'Office', 'Editing', 'Student',
  'Programming', 'Mixed Use', 'Streaming', 'Content Creation'
];

const PRICE_RANGES = [
  { min: 30000, max: 45000, weight: 0.20 },
  { min: 45000, max: 60000, weight: 0.20 },
  { min: 60000, max: 80000, weight: 0.25 },
  { min: 80000, max: 120000, weight: 0.20 },
  { min: 120000, max: 160000, weight: 0.10 },
  { min: 160000, max: 200000, weight: 0.05 },
];

const CPU_LOW = [
  'Intel Core i3-1215U',
  'Intel Core i5-1235U',
  'AMD Ryzen 3 5300U',
  'AMD Ryzen 5 5500U',
  'Intel Core i3-1115G4',
];

const CPU_MID = [
  'Intel Core i5-12450H',
  'Intel Core i5-12500H',
  'AMD Ryzen 5 5600H',
  'AMD Ryzen 7 5800H',
  'AMD Ryzen 5 6600H',
];

const CPU_HIGH = [
  'Intel Core i7-12700H',
  'Intel Core i7-13700H',
  'AMD Ryzen 7 7735HS',
  'AMD Ryzen 9 6900HX',
  'Intel Core i9-12900H',
];

const GPU_LOW = [
  'Intel UHD Graphics',
  'Intel Iris Xe Graphics',
  'AMD Radeon Graphics',
];

const GPU_MID = [
  'NVIDIA GeForce GTX 1650',
  'NVIDIA GeForce RTX 3050',
  'NVIDIA GeForce RTX 3050 Ti',
];

const GPU_HIGH = [
  'NVIDIA GeForce RTX 4050',
  'NVIDIA GeForce RTX 4060',
  'NVIDIA GeForce RTX 4070',
];

const MODEL_NAMES = {
  'ASUS': ['TUF Gaming A15', 'ROG Strix', 'VivoBook', 'ZenBook'],
  'MSI': ['GF63 Thin', 'Katana', 'Sword', 'Pulse'],
  'Acer': ['Nitro 5', 'Aspire 5', 'Predator', 'Swift'],
  'Lenovo': ['Legion', 'IdeaPad', 'ThinkPad', 'LOQ'],
  'HP': ['Pavilion', 'Victus', 'Omen', 'Envy'],
  'Dell': ['G15', 'Inspiron', 'XPS', 'Vostro'],
  'Gigabyte': ['Aorus', 'G5', 'G7', 'A5'],
  'Infinix': ['INBOOK', 'ZERO', 'X1'],
  'Samsung': ['Galaxy Book', 'Odyssey', 'Notebook'],
  'Zebronics': ['Zeb-Transformer', 'Zeb-Ace', 'Zeb-Pro'],
  'Ant Esports': ['ANT PC', 'ANT Gaming', 'ANT Pro'],
};

function uuid() {
  return crypto.randomUUID();
}

function uniqueSlug(title) {
  const clean = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const suffix = crypto.randomUUID().slice(0, 6);
  return `${clean || 'product'}-${suffix}`;
}

function pickPriceRange() {
  const r = Math.random();
  let acc = 0;
  for (const range of PRICE_RANGES) {
    acc += range.weight;
    if (r <= acc) {
      const price = range.min + Math.floor(Math.random() * (range.max - range.min));
      return { price, range };
    }
  }
  const range = PRICE_RANGES[2];
  return {
    price: range.min + Math.floor(Math.random() * (range.max - range.min)),
    range
  };
}

function getUseCase(priceRange) {
  if (priceRange.min >= 120000) {
    return ['Gaming', 'Content Creation', 'Streaming', 'Editing'][Math.floor(Math.random() * 4)];
  }
  if (priceRange.min >= 60000) {
    return ['Gaming', 'Office', 'Student', 'Programming', 'Mixed Use'][Math.floor(Math.random() * 5)];
  }
  return ['Office', 'Student', 'Mixed Use'][Math.floor(Math.random() * 3)];
}

function escapeCSV(val) {
  if (val === null || val === undefined) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function cleanOldFiles() {
  const files = ['products.csv', 'product_specs.csv', 'product_prices.csv'];
  for (const f of files) {
    if (fs.existsSync(f)) {
      fs.unlinkSync(f);
    }
  }
}

function generateImageUrl(brand, category) {
  const seed = `${brand}-${category}`.toLowerCase().replace(/\s+/g, '-');
  return `https://picsum.photos/seed/${seed}/600/400`;
}

function affiliateUrl(vendor, title) {
  const enc = encodeURIComponent(title);
  if (vendor === 'Amazon') {
    return `https://www.amazon.in/s?k=${enc}&tag=yourtag-21`;
  }
  return `https://www.flipkart.com/search?q=${enc}`;
}

function generateDescription(title, brand, category, useCase, cpu, gpu, ram, storage) {
  return `The ${title} is a ${category} from ${brand} for ${useCase}. Features ${cpu}, ${gpu}, ${ram} RAM, ${storage} storage.`;
}

function main() {
  cleanOldFiles();

  const products = [];
  const specs = [];
  const prices = [];
  const slugSet = new Set();

  while (products.length < 501) {
    const brand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
    const models = MODEL_NAMES[brand] || ['Standard'];
    const model = models[Math.floor(Math.random() * models.length)];

    const { price: priceMin, range } = pickPriceRange();
    const priceMax = priceMin + Math.floor(Math.random() * 3000);

    const isLaptop = Math.random() < 0.7;
    const category = isLaptop ? 'Laptop' : 'Prebuilt PC';
    const useCase = getUseCase(range);

    let cpuPool, gpuPool, ram, storage;

    if (range.min < 60000) {
      cpuPool = CPU_LOW;
      gpuPool = GPU_LOW;
      ram = '8GB';
      storage = '512GB SSD';
    } else if (range.min < 120000) {
      cpuPool = CPU_MID;
      gpuPool = GPU_MID;
      ram = '16GB';
      storage = '1TB SSD';
    } else {
      cpuPool = CPU_HIGH;
      gpuPool = GPU_HIGH;
      ram = Math.random() < 0.6 ? '16GB' : '32GB';
      storage = '1TB SSD';
    }

    const cpu = cpuPool[Math.floor(Math.random() * cpuPool.length)];
    const gpu = gpuPool[Math.floor(Math.random() * gpuPool.length)];

    const title = `${brand} ${model} ${ram} ${storage}`;
    let slug = uniqueSlug(title);
    while (slugSet.has(slug)) {
      slug = uniqueSlug(title);
    }
    slugSet.add(slug);

    const productId = uuid();
    const description = generateDescription(title, brand, category, useCase, cpu, gpu, ram, storage);
    const imageUrl = generateImageUrl(brand, category);
    const isFeatured = Math.random() < 0.15;
    const isActive = true;

    products.push({
      id: productId,
      title,
      slug,
      brand,
      category,
      use_case: useCase,
      description,
      price_min: priceMin,
      price_max: priceMax,
      image_url: imageUrl,
      is_featured: isFeatured,
      is_active: isActive,
    });

    specs.push(
      { id: uuid(), product_id: productId, spec_name: 'Processor', spec_value: cpu },
      { id: uuid(), product_id: productId, spec_name: 'Graphics Card', spec_value: gpu },
      { id: uuid(), product_id: productId, spec_name: 'RAM', spec_value: ram },
      { id: uuid(), product_id: productId, spec_name: 'Storage', spec_value: storage },
      { id: uuid(), product_id: productId, spec_name: 'Operating System', spec_value: 'Windows 11 Home' }
    );

    if (isLaptop) {
      const displays = ['14" FHD IPS', '15.6" FHD IPS', '15.6" FHD 144Hz'];
      specs.push({
        id: uuid(),
        product_id: productId,
        spec_name: 'Display',
        spec_value: displays[Math.floor(Math.random() * displays.length)],
      });
    }

    const amazonPrice = priceMin + Math.floor(Math.random() * 1500);
    const flipkartPrice = priceMin + Math.floor(Math.random() * 1500);

    prices.push({
      id: uuid(),
      product_id: productId,
      vendor: 'Amazon',
      price: amazonPrice,
      affiliate_url: affiliateUrl('Amazon', title),
    });
    prices.push({
      id: uuid(),
      product_id: productId,
      vendor: 'Flipkart',
      price: flipkartPrice,
      affiliate_url: affiliateUrl('Flipkart', title),
    });
  }

  const productHeaders = ['id', 'title', 'slug', 'brand', 'category', 'use_case', 'description', 'price_min', 'price_max', 'image_url', 'is_featured', 'is_active'];
  const specHeaders = ['id', 'product_id', 'spec_name', 'spec_value'];
  const priceHeaders = ['id', 'product_id', 'vendor', 'price', 'affiliate_url'];

  const toCSV = (rows, headers) => {
    const lines = [headers.join(',')];
    for (const row of rows) {
      lines.push(headers.map(h => escapeCSV(row[h])).join(','));
    }
    return lines.join('\n');
  };

  fs.writeFileSync('products.csv', toCSV(products, productHeaders), 'utf8');
  fs.writeFileSync('product_specs.csv', toCSV(specs, specHeaders), 'utf8');
  fs.writeFileSync('product_prices.csv', toCSV(prices, priceHeaders), 'utf8');

  console.log('Generated 501 products successfully.');
}

main();
