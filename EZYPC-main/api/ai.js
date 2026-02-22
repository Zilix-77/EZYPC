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

    const chatCompletion = await client.chat.completions.create({
      model: "meta-llama/Meta-Llama-3-8B-Instruct:novita",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    const text = chatCompletion.choices[0].message.content;

    return res.status(200).json({ result: text });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "AI server error" });
  }
}