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

  // Build use-case-specific requirements
  let useCaseRequirements = '';
  let productTypeHint = '';

  if (useCase === UseCase.GAMING) {
    useCaseRequirements = `
CRITICAL: These recommendations MUST be optimized for GAMING.
- Prioritize powerful GPUs (RTX 3060 or better, or AMD RX 6600 or better)
- Include gaming-focused components (high refresh rate monitors, gaming keyboards/mice if applicable)
- Ensure the PC can run modern games smoothly
- Match the budget with appropriate gaming performance tier
- Do NOT recommend basic office PCs or laptops without dedicated GPUs`;
    productTypeHint = 'Prefer "Prebuilt PC" or "Custom Build" types. Only recommend "Laptop" if specifically requested and it has a dedicated gaming GPU.';
  } else if (useCase === UseCase.STUDENT) {
    useCaseRequirements = `
CRITICAL: These recommendations MUST be optimized for STUDENT USE.
- Prioritize portability and battery life (laptops preferred)
- Include components suitable for studying, coding, and academic work
- Ensure good display quality for reading and research
- Match the budget with student-friendly pricing
- Do NOT recommend high-end gaming PCs unless specifically needed for engineering/CS`;
    productTypeHint = 'Prefer "Laptop" type. Only recommend desktop PCs if portability is not important.';
  } else if (useCase === UseCase.GENERAL) {
    useCaseRequirements = `
CRITICAL: These recommendations MUST be optimized for GENERAL USE.
- Prioritize versatility and value for money
- Include components suitable for web browsing, office work, media consumption
- Ensure good balance between performance and price
- Match the budget with everyday computing needs
- Do NOT recommend specialized gaming or workstation PCs unless specifically requested`;
    productTypeHint = 'Can be "Laptop", "Prebuilt PC", or "Custom Build" depending on form factor preference.';
  }

  const prompt = `
You are recommending PCs for a user with the following requirements:

USE CASE: ${useCase}
${useCaseRequirements}

USER PREFERENCES:
${answerString}

${productTypeHint}

IMPORTANT RULES:
1. Generate EXACTLY 2-3 recommendations (not more, not less)
2. ALL recommendations MUST match the use case (${useCase})
3. ALL recommendations MUST respect the budget and preferences provided
4. Do NOT include generic or unrelated products
5. Each recommendation should be tailored to the specific use case and answers
6. Ensure components (CPU, GPU, RAM) are appropriate for the use case
7. If use case is GAMING, ensure GPU is gaming-grade (RTX/GTX series or AMD RX series)
8. If use case is STUDENT, prefer laptops unless desktop is explicitly preferred
9. If use case is GENERAL, focus on versatility and value

Generate structured JSON with recommendations array matching the exact schema.
  `;

  const result = await callAI(prompt);
  
  // Safeguard: Limit to 3 recommendations max and ensure they exist
  if (result && result.recommendations) {
    return {
      recommendations: result.recommendations.slice(0, 3)
    };
  }
  
  return result;
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
