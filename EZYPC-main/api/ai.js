import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt required" });
    }

    const client = new OpenAI({
      baseURL: "https://router.huggingface.co/v1",
      apiKey: process.env.HF_TOKEN,
    });

    const completion = await client.chat.completions.create({
      model: "meta-llama/Meta-Llama-3-8B-Instruct:novita",
      messages: [
        {
          role: "system",
          content: `You are a professional PC store assistant.

You MUST return ONLY valid JSON.

No markdown.
No explanation.
No text before or after JSON.

Return EXACTLY this structure:

{
  "recommendations": [
    {
      "isBestMatch": boolean,
      "type": "Custom Build" | "Prebuilt PC" | "Laptop",
      "title": string,
      "rationale": string,
      "estimatedPriceINR": number,
      "components": [
        { "name": string, "spec": string }
      ],
      "purchaseOptions": [
        { "vendor": string, "link": string, "price": number }
      ],
      "reviews": [
        { "source": string, "author": string, "rating": number, "content": string }
      ],
      "imageUrl": string
    }
  ]
}`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7
    });

    const text = completion.choices[0].message.content;

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error("Invalid JSON from model:", text);
      return res.status(500).json({ error: "Invalid JSON from model" });
    }

    return res.status(200).json(parsed);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "AI server error" });
  }
}