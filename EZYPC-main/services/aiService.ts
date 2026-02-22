import { UseCase, Answer, Product } from '../types';

const CACHE_KEY = 'popularProducts';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours


// 🔹 Call backend API
const callAI = async (prompt: string) => {
  console.log('[callAI] Called with prompt:', prompt);

  const response = await fetch("/api/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  console.log('[callAI] Response status from /api/ai:', response.status);

  if (!response.ok) {
    let errorBody: unknown = null;
    try {
      errorBody = await response.json();
    } catch {
      // ignore JSON parse errors for logging
    }
    console.error('[callAI] Error response from /api/ai:', errorBody);
    const message =
      errorBody && typeof errorBody === 'object' && 'error' in (errorBody as any)
        ? (errorBody as any).error
        : 'Server error';
    throw new Error(message);
  }

  const data = await response.json();
  console.log('[callAI] Raw data from /api/ai:', data);

  if (!data || !data.recommendations || !Array.isArray(data.recommendations)) {
    console.error('[callAI] Unexpected AI response shape:', data);
    throw new Error('Invalid AI response from server');
  }

  console.log(
    '[callAI] Recommendations count:',
    data.recommendations.length
  );

  const enhanced = (data.recommendations ?? []).map((p: any) => {
    const title = (p.title ?? '').toLowerCase();

    let keyword = 'gaming pc';

    if (title.includes('asus tuf')) {
      keyword = 'asus tuf gaming laptop';
    } else if (title.includes('asus rog')) {
      keyword = 'asus rog gaming laptop';
    } else if (title.includes('dell xps')) {
      keyword = 'dell xps laptop';
    } else if (title.includes('hp omen')) {
      keyword = 'hp omen gaming laptop';
    } else if (title.includes('lenovo legion')) {
      keyword = 'lenovo legion gaming laptop';
    } else if (p.type === 'Laptop') {
      keyword = 'gaming laptop';
    } else if (p.type === 'Prebuilt PC') {
      keyword = 'gaming desktop pc tower';
    } else if (p.type === 'Custom Build') {
      keyword = 'rgb gaming pc build';
    }

    return {
      ...p,
      imageUrl: `https://source.unsplash.com/random/600x400/?${encodeURIComponent(keyword)}`
    };
  });

  return { recommendations: enhanced };
};

// 🔹 Popular Products
export const getPopularProducts = async (): Promise<{ recommendations: Product[] } | null> => {
  console.log('[getPopularProducts] Invoked');

  const cachedData = localStorage.getItem(CACHE_KEY);

  if (cachedData) {
    const { timestamp, data } = JSON.parse(cachedData);
    if (Date.now() - timestamp < CACHE_DURATION_MS) {
      console.log("Serving from cache");
      return data;
    }
  }

  const prompt = `
  Generate 9 popular PC recommendations for an Indian PC store.
  Return structured JSON with recommendations array.
  `;

  try {
    const data = await callAI(prompt);

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), data })
    );

    return data;
  } catch (error) {
    console.error("Error fetching popular products:", error);
    throw error;
  }
};

// 🔹 PC Recommendation
export const getPCRecommendation = async (
  useCase: UseCase,
  answers: Answer[]
): Promise<{ recommendations: Product[] } | null> => {

  const answerString = answers
    .map(a => `- ${a.question}: ${a.answer}`)
    .join('\n');

  const prompt = `
  User use case: ${useCase}
  Answers:
  ${answerString}

  Generate 2-3 structured PC recommendations in JSON format.
  `;

  return callAI(prompt);
};

// 🔹 Similar Products
export const getSimilarProducts = async (
  product: Product,
  excludeTitles: string[]
): Promise<{ recommendations: Product[] } | null> => {

  const prompt = `
  Current product: ${product.title}
  Price: ₹${product.estimatedPriceINR}

  Exclude these titles:
  ${excludeTitles.join(', ')}

  Generate 2 similar alternatives in structured JSON format.
  `;

  return callAI(prompt);
};
