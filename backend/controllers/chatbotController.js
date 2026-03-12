const axios = require('axios');
const Session = require('../models/Session');
const Product = require('../models/Product');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Build the GPT-4 system prompt injecting user context and product catalog.
 */
async function buildSystemPrompt(userId, sessionId = null) {
    const user = await User.findById(userId).select('name preferences purchaseHistory');
    const products = await Product.find({ isActive: true }).select('name category price description vrZone subcategory tags rating').sort({ rating: -1 }).limit(200);

    let recentEmotionContext = "User's current emotional state is neutral.";
    if (sessionId) {
        const session = await Session.findById(sessionId).select('emotionLog');
        if (session?.emotionLog?.length > 0) {
            const lastEmotions = session.emotionLog.slice(-3).map(e => e.emotion);
            recentEmotionContext = `The user has recently felt: ${lastEmotions.join(', ')}. Adapt your tone accordingly (e.g., be more empathetic if they are frustrated, or enthusiastic if they are happy).`;
        }
    }

    // Group products by category > subcategory
    const grouped = {};
    products.forEach((p) => {
        const cat = p.category || 'other';
        const sub = p.subcategory || 'general';
        if (!grouped[cat]) grouped[cat] = {};
        if (!grouped[cat][sub]) grouped[cat][sub] = [];
        grouped[cat][sub].push(p);
    });
    const productList = Object.entries(grouped).map(([cat, subs]) => {
        const subSections = Object.entries(subs).map(([sub, items]) => {
            const itemLines = items.map(p => `  - ${p.name}: ₹${p.price} [Zone: ${p.vrZone || 'general'}] [Rating: ${p.rating || 'N/A'}]`).join('\n');
            return `  [${sub}]\n${itemLines}`;
        }).join('\n');
        return `── ${cat.toUpperCase()} ──\n${subSections}`;
    }).join('\n\n');
    const purchaseHistory = user?.purchaseHistory?.length
        ? user.purchaseHistory.map((p) => p.productId?.toString()).join(', ')
        : 'No previous purchases';

    return `You are ShopBot, an expert AI shopping assistant inside an immersive VR retail store. Your job is to genuinely help users find the perfect products based on their needs, budget, and preferences.

IMPORTANT BEHAVIOR RULES:
- ALWAYS give specific, helpful product recommendations from the catalog below
- When a user asks about a product category, recommend 2-3 specific products with prices and why they're good choices
- When asked to compare products, give honest pros/cons for each
- When asked "what should I buy?", ask about their budget, use case, and preferences first
- Be conversational, warm, and knowledgeable — like a friendly expert store associate
- If the user seems undecided, suggest starting with a popular/highly-rated item
- NEVER give vague generic responses — always reference real products from the catalog
- Keep responses concise (2-4 sentences max) unless comparing or explaining in detail
- All prices are in Indian Rupees (₹/INR). Budget ranges: Under ₹1,000 = budget, ₹1,000-5,000 = mid-range, ₹5,000-20,000 = premium, ₹20,000+ = luxury.
- When user asks about a broad category, mention available subcategories.
- For comparisons, use a brief table format.

CURRENCY: Always use the Rupee symbol (₹) for prices.

PERSONALIZATION & EMOTION:
- User Name: ${user?.name || 'there'}
- ${recentEmotionContext}
- User Preferences: ${user?.preferences?.categories?.join(', ') || 'Not specified'}, Style: ${user?.preferences?.style || 'Not specified'}
- Budget Range: ₹${user?.preferences?.budgetRange?.min || 0} - ₹${user?.preferences?.budgetRange?.max || 100000}
- Purchase History: ${purchaseHistory}

AVAILABLE PRODUCTS:
${productList}

NAVIGATION COMMANDS (use these inline in your response):
- [NAVIGATE:ZONE_NAME] to guide user to a zone (fashion, electronics, furniture, beauty, pets)
- [NAVIGATE:PRODUCT_NAME] to point to a specific product
- [PRODUCT:PRODUCT_ID] when recommending a product
- [VERIFY:PRODUCT_NAME] when verifying authenticity

Be friendly, specific, and always reference actual products. Help the user make confident purchase decisions.`;
}

/**
 * Smart fallback: keyword-based responses using actual product data.
 */
async function getSmartFallback(message) {
    try {
        const products = await Product.find({ isActive: true }).select('name category price description rating tags').limit(50);
        const msg = message.toLowerCase();

        // Intent detection
        if (/recommend|suggest|what should|best|popular|top/i.test(msg)) {
            const sorted = products.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);
            if (sorted.length > 0) {
                const recs = sorted.map(p => `**${p.name}** — ₹${p.price} (★${p.rating || 'N/A'})`).join('\n');
                return `Here are our top-rated products:\n${recs}\n\nWould you like details on any of these?`;
            }
        }

        // Category search
        const categories = ['fashion', 'electronics', 'furniture', 'beauty', 'accessories', 'baby_kids', 'pets', 'niche', 'home'];
        const matchedCat = categories.find(cat => msg.includes(cat));
        if (matchedCat) {
            const catProducts = products.filter(p => p.category === matchedCat).slice(0, 3);
            if (catProducts.length > 0) {
                const list = catProducts.map(p => `• **${p.name}** — ₹${p.price}`).join('\n');
                return `Here's what we have in ${matchedCat}:\n${list}\n\nWant me to show you more details?`;
            }
        }

        // Product search by keywords
        const keywords = msg.split(/\s+/).filter(w => w.length > 3);
        for (const kw of keywords) {
            const match = products.find(p =>
                p.name.toLowerCase().includes(kw) ||
                p.tags?.some(t => t.toLowerCase().includes(kw)) ||
                p.description?.toLowerCase().includes(kw)
            );
            if (match) {
                return `I found **${match.name}** (₹${match.price}) — ${match.description?.slice(0, 120)}... Would you like to see it in 360° view or compare with similar products?`;
            }
        }

        // Price-related
        if (/cheap|affordable|budget|under \d+/i.test(msg)) {
            const priceMatch = msg.match(/under (\d+)\s*(k)?/i);
            let maxPrice = 5000;
            if (priceMatch) {
                maxPrice = parseInt(priceMatch[1]);
                if (priceMatch[2]) maxPrice *= 1000;
            }
            const affordable = products.filter(p => p.price <= maxPrice).sort((a, b) => b.rating - a.rating).slice(0, 3);
            if (affordable.length > 0) {
                const list = affordable.map(p => `• **${p.name}** — ₹${p.price}`).join('\n');
                return `Here are some great options under ₹${maxPrice}:\n${list}`;
            }
        }

        // General greeting
        if (/^(hi|hello|hey|sup|yo)/i.test(msg)) {
            return "Hey there! 👋 Welcome to VR Store! I can help you find products, compare items, or guide you around the store. What are you looking for today?";
        }

        // Help
        if (/help|what can you/i.test(msg)) {
            return "I can help you with:\n• 🔍 Finding products by category or name\n• 📊 Comparing products side-by-side\n• 💰 Finding deals within your budget\n• 🏪 Navigating the VR store zones\n• ✅ Verifying product authenticity\n\nJust ask me anything!";
        }

        return "I'd love to help! Could you tell me what type of product you're looking for, or your budget range? I can recommend items from our fashion, electronics, or furniture collections.";
    } catch (err) {
        logger.error('Smart fallback error:', err.message);
        return "I'm here to help! Try asking about specific products like headphones, laptops, or furniture, and I'll find the best options for you.";
    }
}

/**
 * POST /api/chatbot/message
 * Send a message to ShopBot and get a GPT-4 response.
 */
async function sendMessage(req, res, next) {
    try {
        const { message, sessionId, history = [] } = req.body;
        if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

        const isKeyConfigured = process.env.OPENAI_API_KEY &&
                               process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' &&
                               process.env.OPENAI_API_KEY.trim() !== '';

        if (isKeyConfigured) {
            try {
                const systemPrompt = await buildSystemPrompt(req.user.id, sessionId);

                const messages = [{ role: 'system', content: systemPrompt }];
                // Properly reconstruct history from query/response pairs
                history.slice(-10).forEach((h) => {
                    if (h.query) messages.push({ role: 'user', content: h.query });
                    if (h.response) messages.push({ role: 'assistant', content: h.response });
                });
                messages.push({ role: 'user', content: message });

                const response = await axios.post(
                    'https://api.openai.com/v1/chat/completions',
                    {
                        model: process.env.OPENAI_MODEL || 'gpt-4o',
                        messages,
                        temperature: 0.7,
                        max_tokens: 500
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 30000
                    }
                );

                const reply = response.data.choices[0].message.content;

                // Detect intent
                let intent = 'general';
                if (/navigate|show me|go to|take me/i.test(message)) intent = 'navigate';
                else if (/compare/i.test(message)) intent = 'compare';
                else if (/add to cart|buy|purchase/i.test(message)) intent = 'buy';
                else if (/search|find|looking for/i.test(message)) intent = 'search';
                else if (/verify|genuine|real|fake|authentic/i.test(message)) intent = 'verify';

                if (sessionId) {
                    await Session.findByIdAndUpdate(sessionId, {
                        $push: { chatbotInteractions: { query: message, response: reply, intent } },
                    });
                }

                const navigateMatch = reply.match(/\[NAVIGATE:([^\]]+)\]/);
                const verifyMatch = reply.match(/\[VERIFY:([^\]]+)\]/);
                const productIds = [...reply.matchAll(/\[PRODUCT:([^\]]+)\]/g)].map((m) => m[1]);

                return res.json({
                    success: true,
                    response: reply.replace(/\[NAVIGATE:[^\]]+\]/g, '').replace(/\[VERIFY:[^\]]+\]/g, '').replace(/\[PRODUCT:[^\]]+\]/g, '').trim(),
                    intent,
                    navigateTo: navigateMatch ? navigateMatch[1] : null,
                    verifyProduct: verifyMatch ? verifyMatch[1] : null,
                    productIds,
                    mode: 'ai',
                });

            } catch (apiErr) {
                logger.error('OpenAI API Error, using smart fallback:', apiErr.message);

                const smartReply = await getSmartFallback(message);
                const errorNote = apiErr.response?.status === 429 ? ' (AI quota temporarily exceeded — using smart assistant)' : '';

                if (sessionId) {
                    await Session.findByIdAndUpdate(sessionId, {
                        $push: { chatbotInteractions: { query: message, response: smartReply, intent: 'general' } },
                    });
                }
                return res.json({
                    success: true,
                    response: smartReply + errorNote,
                    mode: 'smart_fallback',
                });
            }
        } else {
            // No API key — use smart fallback instead of random mock
            const smartReply = await getSmartFallback(message);
            if (sessionId) {
                await Session.findByIdAndUpdate(sessionId, {
                    $push: { chatbotInteractions: { query: message, response: smartReply, intent: 'general' } },
                });
            }
            return res.json({ success: true, response: smartReply, mode: 'smart_fallback' });
        }
    } catch (err) {
        logger.error('Chatbot error:', err.message);
        next(err);
    }
}

/**
 * GET /api/chatbot/history/:sessionId
 */
async function getHistory(req, res, next) {
    try {
        const session = await Session.findById(req.params.sessionId).select('chatbotInteractions userId');
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
        if (session.userId.toString() !== req.user.id && req.user.role === 'participant') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        return res.json({ success: true, history: session.chatbotInteractions });
    } catch (err) { next(err); }
}

/**
 * DELETE /api/chatbot/history/:sessionId
 */
async function clearHistory(req, res, next) {
    try {
        await Session.findByIdAndUpdate(req.params.sessionId, { $set: { chatbotInteractions: [] } });
        return res.json({ success: true, message: 'History cleared' });
    } catch (err) { next(err); }
}

module.exports = { sendMessage, getHistory, clearHistory };
