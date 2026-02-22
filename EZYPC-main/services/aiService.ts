import { UseCase, Answer, Product } from '../types';

const CACHE_KEY = 'popularProducts';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// 🔹 Call backend API
const callAI = async (prompt: string) => {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Server error");
  }

  return response.json();
};

// 🔹 Popular Products
export const getPopularProducts = async (): Promise<{ recommendations: Product[] } | null> => {
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
