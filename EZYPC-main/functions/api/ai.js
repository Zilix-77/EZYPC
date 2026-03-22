export async function onRequest(context) {
    const { request, env } = context;
    
    // Only allow POST
    if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    try {
        const body = await request.json();
        const { products, userContext } = body;

        if (!products || !Array.isArray(products) || products.length === 0) {
            return new Response(JSON.stringify({ error: "products array required" }), { status: 400 });
        }

        const HF_TOKEN = env.HF_TOKEN; // Get from Cloudflare environment
        if (!HF_TOKEN) {
            // Fallback if no token is set: use first 3 products
            const fallback = fallbackRecommendations(products.slice(0, 3));
            return new Response(JSON.stringify(fallback), { status: 200 });
        }

        const limited = products.slice(0, 15);
        const productListText = limited
          .map((p) => `- id: ${p.id}, title: ${p.title}, brand: ${p.brand || "N/A"}, price_min: ₹${p.price_min}, specs: ${p.specs || "N/A"}`)
          .join("\n");

        const userMessage = userContext
          ? `User context:\n${userContext}\n\nProducts to choose from:\n${productListText}`
          : `Products to choose from:\n${productListText}`;

        // HuggingFace Chat Completion API via Fetch
        const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "meta-llama/Meta-Llama-3-8B-Instruct:novita", // Keep same as original
                messages: [
                    {
                        role: "system",
                        content: `You are a PC store assistant. Choose and rank the best 3 products from the list ONLY.
Return ONLY valid JSON:
{ "selections": [ { "product_id": "uuid", "reason": "reason" } ] }`
                    },
                    { role: "user", content: userMessage }
                ],
                temperature: 0.2
            })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("HF Error:", err);
            return new Response(JSON.stringify(fallbackRecommendations(limited.slice(0, 3))), { status: 200 });
        }

        const data = await response.json();
        const text = data.choices[0].message?.content || "";
        
        let parsed;
        try {
            const jsonStart = text.indexOf("{");
            const jsonEnd = text.lastIndexOf("}") + 1;
            parsed = JSON.parse(text.slice(jsonStart, jsonEnd));
        } catch (e) {
            return new Response(JSON.stringify(fallbackRecommendations(limited.slice(0, 3))), { status: 200 });
        }

        const rawList = parsed.selections || parsed.recommendations || [];
        const selections = rawList.slice(0, 3).map(item => ({
            product_id: item.product_id,
            reason: item.reason || "Recommended based on your specs."
        }));

        return new Response(JSON.stringify({ selections }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}

function fallbackRecommendations(products) {
    return {
        selections: products.map(p => ({
            product_id: p.id,
            reason: "Best value pick within your criteria."
        }))
    };
}
