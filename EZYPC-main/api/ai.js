import OpenAI from "openai";

const MAX_PRODUCTS = 15;

function fallbackRecommendations(products) {
  const sorted = [...products]
    .sort((a, b) => (a.price_min ?? 0) - (b.price_min ?? 0))
    .slice(0, 3);
  return {
    selections: sorted.map((p) => ({
      product_id: p.id,
      reason: "Best value pick within your criteria.",
    })),
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { products, userContext } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "products array required" });
    }

    const limited = products.slice(0, MAX_PRODUCTS);

    const client = new OpenAI({
      baseURL: "https://router.huggingface.co/v1",
      apiKey: process.env.HF_TOKEN,
    });

    const productListText = limited
      .map(
        (p) =>
          `- id: ${p.id}, title: ${p.title}, brand: ${p.brand || "N/A"}, price_min: ₹${p.price_min}, specs: ${p.specs || "N/A"}`
      )
      .join("\n");

    const userMessage = userContext
      ? `User context:\n${userContext}\n\nProducts to choose from (you MUST pick exactly 3 from this list):\n${productListText}`
      : `Products to choose from (you MUST pick exactly 3 from this list):\n${productListText}`;

    const completion = await client.chat.completions.create({
      model: "meta-llama/Meta-Llama-3-8B-Instruct:novita",
      messages: [
        {
          role: "system",
          content: `You are a PC store assistant. Your task is to RANK and CHOOSE the best 3 products from the provided list only.

RULES:
1. You MUST choose exactly 3 products. No more, no less.
2. You MUST use only product IDs from the provided list. Do NOT invent or modify IDs.
3. You MUST return ONLY valid JSON. No markdown, no code fences, no explanation before or after.
4. Rank by: suitability for the user's use case, then value (specs vs price), then brand reliability.

Required JSON format (use this exact structure):
{
  "recommendations": [
    { "product_id": "<uuid from list>", "reason": "<one short sentence>" },
    { "product_id": "<uuid from list>", "reason": "<one short sentence>" },
    { "product_id": "<uuid from list>", "reason": "<one short sentence>" }
  ]
}

Each product_id must appear exactly once and must be one of the ids from the list. Return nothing else.`,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.2,
    });

    const text = completion.choices[0].message?.content ?? "";

    let parsed;
    try {
      const trimmed = text.trim();
      const jsonStart = trimmed.indexOf("{");
      const jsonEnd = trimmed.lastIndexOf("}") + 1;
      if (jsonStart === -1 || jsonEnd <= jsonStart) {
        throw new Error("No JSON object found");
      }
      const jsonStr = trimmed.slice(jsonStart, jsonEnd);
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Invalid JSON from model:", text);
      const fallback = fallbackRecommendations(limited);
      return res.status(200).json(fallback);
    }

    const rawList =
      parsed.recommendations && Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : parsed.selections && Array.isArray(parsed.selections)
          ? parsed.selections
          : null;

    if (!rawList || rawList.length === 0) {
      const fallback = fallbackRecommendations(limited);
      return res.status(200).json(fallback);
    }

    const validIds = new Set(limited.map((p) => p.id));
    const selections = rawList
      .filter((item) => item && validIds.has(item.product_id))
      .map((item) => ({
        product_id: item.product_id,
        reason: typeof item.reason === "string" ? item.reason : "Recommended for you.",
      }))
      .slice(0, 3);

    if (selections.length < 3) {
      const fallback = fallbackRecommendations(limited);
      return res.status(200).json(fallback);
    }

    return res.status(200).json({ selections });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "AI server error" });
  }
}
