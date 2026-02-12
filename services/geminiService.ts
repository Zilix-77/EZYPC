import { GoogleGenAI, Type } from '@google/genai';
import { UseCase, Answer, Product } from '../types';

let aiInstance: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
    if (!aiInstance) {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            // This will be caught by the calling functions and displayed as a friendly error
            throw new Error("API_KEY environment variable not set. Please set it to use the Gemini API.");
        }
        aiInstance = new GoogleGenAI({ apiKey });
    }
    return aiInstance;
};

const productSchema = {
  type: Type.OBJECT,
  properties: {
    isBestMatch: {
      type: Type.BOOLEAN,
      description: 'Mark true for the single best recommendation that fits the user needs perfectly. If no user context, mark the best overall value as true.',
    },
    type: {
      type: Type.STRING,
      enum: ['Custom Build', 'Prebuilt PC', 'Laptop'],
      description: 'The type of computer being recommended.',
    },
    title: {
      type: Type.STRING,
      description: 'A specific and clear title for the product, using the primary component names (e.g., "Ryzen 5 5600 + RTX 3060 Build" or "Dell XPS 15 Laptop"). Avoid generic or marketing-style names like "The Ultimate Beast".',
    },
    rationale: {
      type: Type.STRING,
      description: 'A brief, reassuring, and calm explanation of why this recommendation is a good fit, written in a trustworthy tone.',
    },
    estimatedPriceINR: {
      type: Type.INTEGER,
      description: 'The estimated lowest price of the build or product in Indian Rupees (₹), derived from the purchase options.',
    },
    components: {
      type: Type.ARRAY,
      description: 'A list of the key components of the PC or laptop.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: 'The name of the component category (e.g., "Processor", "Graphics Card", "RAM", "Storage").',
          },
          spec: {
            type: Type.STRING,
            description: 'The specific model or specification of the component (e.g., "AMD Ryzen 5 5600", "NVIDIA GeForce RTX 3060", "16GB DDR4 3200MHz").',
          },
        },
        required: ['name', 'spec'],
      },
    },
    purchaseOptions: {
        type: Type.ARRAY,
        description: "A list of 2-3 purchase options from different e-commerce vendors.",
        items: {
            type: Type.OBJECT,
            properties: {
                vendor: { type: Type.STRING, description: "The name of the vendor (e.g., 'Amazon IN', 'Flipkart', 'MDComputers')." },
                link: { type: Type.STRING, description: "A realistic but placeholder affiliate link for the vendor." },
                price: { type: Type.INTEGER, description: "The price of the product from this vendor in INR." },
            },
            required: ['vendor', 'link', 'price'],
        }
    },
    reviews: {
        type: Type.ARRAY,
        description: "A list of 2-3 sample reviews for the product.",
        items: {
            type: Type.OBJECT,
            properties: {
                source: { type: Type.STRING, description: "The source of the review (e.g., 'TechSpot', 'Gadgets360', 'User Review')." },
                author: { type: Type.STRING, description: "The name of the reviewer." },
                rating: { type: Type.NUMBER, description: "A rating from 1 to 5, can include decimals like 4.5." },
                content: { type: Type.STRING, description: "A brief, realistic review text." },
            },
            required: ['source', 'author', 'rating', 'content'],
        }
    },
    imageUrl: {
        type: Type.STRING,
        description: "A relevant, high-quality image URL from Unsplash Source. The query MUST be specific and based on the main components in the title to get a visually relevant image (e.g., 'https://source.unsplash.com/600x400/?pc-build-rtx3060'). Use URL-friendly search terms."
    }
  },
  required: ['isBestMatch', 'type', 'title', 'rationale', 'estimatedPriceINR', 'components', 'purchaseOptions', 'reviews', 'imageUrl'],
};

const fullResponseSchema = {
    type: Type.OBJECT,
    properties: {
        recommendations: {
            type: Type.ARRAY,
            description: "A list of 2-3 PC recommendations. If based on user input, the first one should be the best match.",
            items: productSchema,
        }
    },
    required: ["recommendations"]
};

const CACHE_KEY = 'popularProducts';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export const getPopularProducts = async (): Promise<{ recommendations: Product[] } | null> => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
        const { timestamp, data } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION_MS) {
            console.log("Serving popular products from cache.");
            return data;
        }
    }

    const prompt = `
    You are EZYPC, a calm, expert assistant for a PC store in Kerala, India.
    Your tone must be trustworthy, reassuring, and professional.

    Please generate a list of 9 popular and well-regarded computer configurations to display on the main store page.
    Include a mix of Custom Builds, Prebuilt PCs, and Laptops across different price points and use cases.
    
    For each product:
    - Titles MUST be specific and based on key components.
    - Prices must be in Indian Rupees (INR).
    - Generate 2-3 purchase options from vendors like 'Amazon IN', 'Flipkart', 'MDComputers'. Vary the prices slightly for realism.
    - 'estimatedPriceINR' MUST be the lowest price from the generated purchase options.
    - Generate 2-3 realistic sample reviews with ratings from varied sources.
    - Mark the best overall value-for-money option with 'isBestMatch: true'.
    - Generate a specific, relevant, high-quality image URL from Unsplash Source.

    Generate the response according to the provided JSON schema.
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: fullResponseSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from API");
    
    const parsedJson = JSON.parse(text.trim());
    if(parsedJson && Array.isArray(parsedJson.recommendations)) {
        const cachePayload = {
            timestamp: Date.now(),
            data: parsedJson
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));
        console.log("Fetched popular products and cached them.");
        return parsedJson;
    }
    return null;
  } catch (error) {
    console.error("Error fetching popular products:", error);
    throw error;
  }
}


const buildRecommendationPrompt = (useCase: UseCase, answers: Answer[]): string => {
  const answerString = answers.map(a => `- ${a.question}: ${a.answer}`).join('\n');

  return `
    You are EZYPC, a calm, expert assistant helping a user in Kerala, India, choose a new computer. Your tone must be trustworthy, reassuring, and professional.

    The user's primary use case is: ${useCase}
    Their answers:
    ${answerString}

    Based on this, provide 2-3 suitable recommendations. 
    
    IMPORTANT:
    1. The first recommendation MUST be the best match. Mark 'isBestMatch' as true. All others must be false.
    2. Titles MUST be specific and based on key components.
    3. Generate 2-3 purchase options from vendors like 'Amazon IN', 'Flipkart', 'MDComputers'. Vary prices slightly.
    4. 'estimatedPriceINR' MUST be the lowest price from the purchase options.
    5. Generate 2-3 realistic sample reviews with ratings.
    6. The rationale should be concise and address the user's answers.
    7. Generate a specific, relevant, high-quality image URL from Unsplash Source.

    Generate the response according to the provided JSON schema.
  `;
};

export const getPCRecommendation = async (
  useCase: UseCase,
  answers: Answer[]
): Promise<{ recommendations: Product[] } | null> => {
  const prompt = buildRecommendationPrompt(useCase, answers);
  
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: fullResponseSchema,
        temperature: 0.5,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from API");
    
    const parsedJson = JSON.parse(text.trim());
    if(parsedJson && Array.isArray(parsedJson.recommendations)) {
        return parsedJson;
    }
    return null;
  } catch (error) {
    console.error("Error fetching or parsing recommendations:", error);
    throw error;
  }
};

export const getSimilarProducts = async (product: Product, excludeTitles: string[]): Promise<{ recommendations: Product[] } | null> => {
    const prompt = `
        You are EZYPC, a calm, expert assistant for a PC store in Kerala, India.

        A user is currently viewing the following product:
        - Title: ${product.title}
        - Type: ${product.type}
        - Price: ₹${product.estimatedPriceINR}

        Please generate a list of 2 similar but distinct alternative products. 
        - The recommendations should be in a similar price bracket and for a similar purpose.

        IMPORTANT: DO NOT include the original product or any of the following titles in the results: ${excludeTitles.join(', ')}.

        For each recommended product, follow these rules:
        - Titles MUST be specific and based on key components.
        - Generate 2-3 purchase options from vendors like 'Amazon IN', 'Flipkart', 'MDComputers'. Vary prices slightly.
        - 'estimatedPriceINR' MUST be the lowest price from the purchase options.
        - Generate 2-3 realistic sample reviews with ratings.
        - The rationale should explain why it's a good alternative.
        - Mark 'isBestMatch' as false for all similar products.
        - Generate a specific, relevant, high-quality image URL from Unsplash Source.

        Generate the response according to the provided JSON schema.
    `;
    
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: fullResponseSchema,
                temperature: 0.8,
            },
        });
        const text = response.text;
        if (!text) throw new Error("Empty response from API");
        
        const parsedJson = JSON.parse(text.trim());
        if(parsedJson && Array.isArray(parsedJson.recommendations)) {
            return parsedJson;
        }
        return null;
    } catch (error) {
        console.error("Error fetching similar products:", error);
        throw error;
    }
};