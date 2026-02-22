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
    id: row.id,
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

export const getProductsPage = async (
  offset: number,
  limit: number
): Promise<{ recommendations: Product[]; hasMore: boolean }> => {
  if (!supabase) {
    console.error('[getProductsPage] Supabase not initialized');
    throw new Error('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data: rows, error } = await supabase
    .from('products')
    .select('id')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('price_min', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[getProductsPage] Supabase error:', error);
    throw error;
  }

  if (!rows || rows.length === 0) {
    console.log('[getProductsPage] Batch:', offset, limit, '| Fetched: 0 | Total loaded: 0');
    return { recommendations: [], hasMore: false };
  }

  const products = await fetchProductWithSpecsAndPrices(rows.map((r) => r.id));
  const hasMore = rows.length >= limit;

  console.log('[getProductsPage] Batch:', offset, limit, '| Fetched:', products.length, '| hasMore:', hasMore);
  return { recommendations: products, hasMore };
};

function gpuTierRank(specsText: string): number {
  const s = (specsText || '').toLowerCase();
  if (s.includes('rtx 40') || s.includes('rtx 4070') || s.includes('rtx 4060') || s.includes('rtx 4050')) return 40;
  if (s.includes('rtx 30') || s.includes('rtx 3060') || s.includes('rtx 3070') || s.includes('rtx 3050')) return 30;
  if (s.includes('rtx 20') || s.includes('gtx 16')) return 20;
  if (s.includes('gtx 1650') || s.includes('gtx 1660')) return 16;
  if (s.includes('mx550') || s.includes('mx5')) return 10;
  return 0;
}

function parseBudgetFromAnswers(answers: Answer[]): { minBudget?: number; maxBudget?: number } | null {
  const budgetAnswer = answers.find(
    (a) => a.question?.toLowerCase().includes('budget') || a.answer?.includes('₹')
  );
  if (!budgetAnswer?.answer) return null;

  const nums = (budgetAnswer.answer.match(/[\d,]+/g) || [])
    .map((s) => parseInt(s.replace(/,/g, ''), 10))
    .filter((n) => n > 0 && n < 10000000);

  if (nums.length < 1) return null;

  const minBudget = nums[0] < 1000 ? nums[0] * 1000 : nums[0];
  const maxBudget =
    nums.length >= 2 ? (nums[1] < 1000 ? nums[1] * 1000 : nums[1]) : minBudget * 1.5;

  return { minBudget, maxBudget };
}

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
  const budget = parseBudgetFromAnswers(answers);

  let query = supabase
    .from('products')
    .select('id, title, brand, price_min')
    .eq('is_active', true)
    .in('use_case', useCaseValues);

  if (budget?.minBudget != null) {
    query = query.gte('price_min', Math.floor(budget.minBudget * 0.8));
  }
  if (budget?.maxBudget != null) {
    query = query.lte('price_min', Math.ceil(budget.maxBudget * 1.2));
  }

  const { data: candidateRows, error } = await query
    .order('price_min', { ascending: true })
    .range(0, 199);

  if (error) {
    console.error('[getPCRecommendation] Supabase error:', error);
    throw error;
  }

  if (!candidateRows || candidateRows.length === 0) {
    const { data: fallback } = await supabase
      .from('products')
      .select('id')
      .eq('is_active', true)
      .order('price_min', { ascending: true })
      .range(0, 2);

    if (!fallback?.length) return { recommendations: [] };
    const products = await fetchProductWithSpecsAndPrices(fallback.map((r) => r.id));
    return { recommendations: products };
  }

  const candidateIds = candidateRows.map((r) => r.id);

  const { data: specsRows } = await supabase
    .from('product_specs')
    .select('product_id, spec_name, spec_value')
    .in('product_id', candidateIds);

  const specsByProduct = new Map<string, string>();
  (specsRows || []).forEach((s) => {
    const existing = specsByProduct.get(s.product_id) || '';
    const part = `${s.spec_name}: ${s.spec_value}`;
    specsByProduct.set(s.product_id, existing ? `${existing}; ${part}` : part);
  });

  const withTier = candidateRows.map((r) => ({
    ...r,
    specsText: specsByProduct.get(r.id) ?? '',
    gpuTier: gpuTierRank(specsByProduct.get(r.id) ?? ''),
  }));

  withTier.sort((a, b) => {
    if (b.gpuTier !== a.gpuTier) return b.gpuTier - a.gpuTier;
    return a.price_min - b.price_min;
  });

  const top10 = withTier.slice(0, 10);
  const candidateIdsTop = top10.map((r) => r.id);

  console.log('[getPCRecommendation] AI candidate pool size:', top10.length, '(from', candidateRows.length, 'within budget)');

  const productsForAi = top10.map((p) => ({
    id: p.id,
    title: p.title,
    brand: p.brand ?? '',
    price_min: p.price_min,
    specs: p.specsText,
  }));

  const userContext = `Use case: ${useCase}. User answers: ${answers.map((a) => `${a.question}: ${a.answer}`).join('; ')}`;

  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products: productsForAi, userContext }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || 'AI recommendation failed');
  }

  const data = (await response.json()) as { selections?: { product_id: string; reason: string }[] };

  const selections = data?.selections ?? [];
  const validIds = selections
    .map((s) => s?.product_id)
    .filter((id): id is string => typeof id === 'string' && candidateIdsTop.includes(id))
    .slice(0, 3);

  const uniqueIds = Array.from(new Set(validIds));
  if (uniqueIds.length === 0) {
    const products = await fetchProductWithSpecsAndPrices(candidateIdsTop.slice(0, 3));
    return { recommendations: products };
  }

  const reasonByProductId = new Map<string, string>();
  selections.forEach((s) => {
    if (s?.product_id && s?.reason) reasonByProductId.set(s.product_id, s.reason);
  });

  const fullProducts = await fetchProductWithSpecsAndPrices(uniqueIds);

  const idToTitle = new Map(top10.map((r) => [r.id, r.title]));

  const recommendations: Product[] = uniqueIds
    .map((id) => {
      const title = idToTitle.get(id);
      const product = fullProducts.find((p) => p.title === title);
      if (!product) return null;
      const reason = reasonByProductId.get(id);
      return reason ? { ...product, rationale: reason } : product;
    })
    .filter((p): p is Product => p != null);

  if (recommendations.length === 0) {
    return { recommendations: fullProducts.slice(0, 3) };
  }

  return { recommendations };
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
