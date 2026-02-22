import { UseCase, Answer, Product } from '../types';
import { supabase } from './supabaseClient';
import type { ComponentSpec, PurchaseOption } from '../types';

const CACHE_KEY = 'popularProducts';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

function mapRowToProduct(
  row: {
    id: string;
    title: string;
    brand?: string;
    category: string;
    use_case?: string;
    description?: string;
    rationale?: string;
    price_min: number;
    price_max?: number;
    image_url?: string;
    is_best_match?: boolean;
  },
  specs: { spec_name: string; spec_value: string }[],
  prices: { vendor: string; price: number; affiliate_url: string }[]
): Product {
  const components: ComponentSpec[] = specs.map(s => ({
    name: s.spec_name,
    spec: s.spec_value,
  }));

  const purchaseOptions: PurchaseOption[] = prices.map(p => ({
    vendor: p.vendor,
    link: p.affiliate_url,
    price: p.price,
  }));

  const lowestPrice = prices.length > 0
    ? Math.min(...prices.map(p => p.price), row.price_min)
    : row.price_min;

  return {
    isBestMatch: row.is_best_match ?? false,
    type: row.category as 'Laptop' | 'Prebuilt PC' | 'Custom Build',
    title: row.title,
    rationale: row.rationale || row.description || '',
    estimatedPriceINR: lowestPrice,
    components,
    purchaseOptions,
    reviews: [],
    imageUrl: row.image_url || `https://picsum.photos/seed/${row.id}/600/400`,
  };
}

async function fetchProductWithSpecsAndPrices(productIds: string[]) {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, title, brand, category, use_case, description, rationale, price_min, price_max, image_url, is_best_match')
    .in('id', productIds)
    .eq('is_active', true);

  if (productsError) throw productsError;
  if (!products || products.length === 0) return [];

  const ids = products.map(p => p.id);

  const [specsRes, pricesRes] = await Promise.all([
    supabase.from('product_specs').select('product_id, spec_name, spec_value').in('product_id', ids),
    supabase.from('product_prices').select('product_id, vendor, price, affiliate_url').in('product_id', ids),
  ]);

  if (specsRes.error) throw specsRes.error;
  if (pricesRes.error) throw pricesRes.error;

  const specsByProduct = new Map<string, { spec_name: string; spec_value: string }[]>();
  (specsRes.data || []).forEach(s => {
    const list = specsByProduct.get(s.product_id) || [];
    list.push({ spec_name: s.spec_name, spec_value: s.spec_value });
    specsByProduct.set(s.product_id, list);
  });

  const pricesByProduct = new Map<string, { vendor: string; price: number; affiliate_url: string }[]>();
  (pricesRes.data || []).forEach(p => {
    const list = pricesByProduct.get(p.product_id) || [];
    list.push({ vendor: p.vendor, price: p.price, affiliate_url: p.affiliate_url });
    pricesByProduct.set(p.product_id, list);
  });

  return products.map(p =>
    mapRowToProduct(p, specsByProduct.get(p.id) || [], pricesByProduct.get(p.id) || [])
  );
}

export const getPopularProducts = async (): Promise<{ recommendations: Product[] } | null> => {
  const cachedData = localStorage.getItem(CACHE_KEY);

  if (cachedData) {
    try {
      const { timestamp, data } = JSON.parse(cachedData);
      if (Date.now() - timestamp < CACHE_DURATION_MS) {
        console.log('[getPopularProducts] Serving from cache');
        return data;
      }
    } catch {
      /* ignore */
    }
  }

  if (!supabase) {
    console.error('[getPopularProducts] Supabase not initialized');
    throw new Error('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data: rows, error } = await supabase
    .from('products')
    .select('id')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('price_min', { ascending: true })
    .limit(20);

  if (error) {
    console.error('[getPopularProducts] Supabase error:', error);
    throw error;
  }

  if (!rows || rows.length === 0) {
    console.log('[getPopularProducts] No products found');
    return { recommendations: [] };
  }

  const products = await fetchProductWithSpecsAndPrices(rows.map(r => r.id));

  const result = { recommendations: products };

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: result }));
  } catch {
    /* ignore */
  }

  console.log('[getPopularProducts] Supabase connection success. Fetched', products.length, 'products.');
  return result;
};

export const getPCRecommendation = async (
  useCase: UseCase,
  answers: Answer[]
): Promise<{ recommendations: Product[] } | null> => {
  if (!supabase) {
    console.error('[getPCRecommendation] Supabase not initialized');
    throw new Error('Supabase not configured.');
  }

  const useCaseMap: Record<UseCase, string[]> = {
    [UseCase.GAMING]: ['Gaming'],
    [UseCase.STUDENT]: ['Student'],
    [UseCase.GENERAL]: ['General Use', 'Office', 'Mixed Use', 'General'],
  };

  const useCaseValues = useCaseMap[useCase];

  let query = supabase
    .from('products')
    .select('id')
    .eq('is_active', true)
    .in('use_case', useCaseValues);

  const budgetAnswer = answers.find(a =>
    a.question?.toLowerCase().includes('budget') || a.answer?.includes('₹')
  );

  if (budgetAnswer?.answer) {
    const nums = (budgetAnswer.answer.match(/[\d,]+/g) || [])
      .map(s => parseInt(s.replace(/,/g, ''), 10))
      .filter(n => n > 0 && n < 10000000);

    if (nums.length >= 1) {
      const minBudget = nums[0] < 1000 ? nums[0] * 1000 : nums[0];
      const maxBudget = nums.length >= 2
        ? (nums[1] < 1000 ? nums[1] * 1000 : nums[1])
        : minBudget * 1.5;
      query = query.gte('price_min', Math.floor(minBudget * 0.8)).lte('price_min', Math.ceil(maxBudget * 1.2));
    }
  }

  const { data: rows, error } = await query.order('price_min', { ascending: true }).limit(3);

  if (error) {
    console.error('[getPCRecommendation] Supabase error:', error);
    throw error;
  }

  if (!rows || rows.length === 0) {
    const { data: fallback } = await supabase
      .from('products')
      .select('id')
      .eq('is_active', true)
      .order('price_min', { ascending: true })
      .limit(3);

    if (!fallback?.length) return { recommendations: [] };
    const products = await fetchProductWithSpecsAndPrices(fallback.map(r => r.id));
    return { recommendations: products };
  }

  const products = await fetchProductWithSpecsAndPrices(rows.map(r => r.id));
  return { recommendations: products };
};

export const getSimilarProducts = async (
  product: Product,
  excludeTitles: string[]
): Promise<{ recommendations: Product[] } | null> => {
  if (!supabase) {
    console.error('[getSimilarProducts] Supabase not initialized');
    throw new Error('Supabase not configured.');
  }

  const priceMin = product.estimatedPriceINR * 0.7;
  const priceMax = product.estimatedPriceINR * 1.3;
  const excludeSet = new Set(excludeTitles.map(t => t.toLowerCase()));

  const { data: rows, error } = await supabase
    .from('products')
    .select('id, title')
    .eq('is_active', true)
    .eq('category', product.type)
    .gte('price_min', Math.floor(priceMin))
    .lte('price_min', Math.ceil(priceMax))
    .order('price_min', { ascending: true })
    .limit(10);

  if (error) {
    console.error('[getSimilarProducts] Supabase error:', error);
    throw error;
  }

  const filtered = (rows || []).filter(r => !excludeSet.has((r.title || '').toLowerCase()));
  const ids = filtered.slice(0, 3).map(r => r.id);

  if (ids.length === 0) return { recommendations: [] };

  const products = await fetchProductWithSpecsAndPrices(ids);
  return { recommendations: products };
};
