const axios = require('axios');
const Session = require('../models/Session');
const Product = require('../models/Product');
const User = require('../models/User');
const logger = require('../utils/logger');

// Mock response when OpenAI key is not set
const MOCK_RESPONSES = [
    "I'd be happy to help you find something! What type of product are you looking for today?",
    "Great choice! Based on your preferences, I recommend checking out our featured items in the Electronics zone.",
    "Let me search through our catalog for the best match for you!",
    "I found some great options that match your style. Would you like me to highlight them in the VR store?",
];

/**
 * Build the GPT-4 system prompt injecting user context and product catalog.
 */
async function buildSystemPrompt(userId) {
    const user = await User.findById(userId).select('name preferences purchaseHistory');
    const products = await Product.find({ isActive: true }).select('name category price description').limit(100);

    const productList = products.map((p) => `- ${p.name} (${p.category}): $${p.price}`).join('\n');
    const purchaseHistory = user?.purchaseHistory?.length
        ? user.purchaseHistory.map((p) => p.productId?.toString()).join(', ')
        : 'No previous purchases';

    return `You are ShopBot, an AI shopping assistant inside a VR retail store. You help users find products, compare options, answer questions, and guide them through the store. Be friendly, concise, and personalized. Always refer to the user by their name: ${user?.name || 'there'}.

User Preferences:
- Favorite Categories: ${user?.preferences?.categories?.join(', ') || 'Not specified'}
- Budget Range: $${user?.preferences?.budgetRange?.min || 0} - $${user?.preferences?.budgetRange?.max || 10000}
- Style: ${user?.preferences?.style || 'Not specified'}

Purchase History: ${purchaseHistory}

Available Products (Sample):
${productList}

When recommending products, mention their names exactly as listed. When a user asks to navigate to a product, respond with [NAVIGATE:<product_name>]. When recommending products, include [PRODUCT:<product_id>] markers. Be concise and helpful.`;
}

/**
 * POST /api/chatbot/message
 * Send a message to ShopBot and get a GPT-4 response.
 */
async function sendMessage(req, res, next) {
    try {
        const { message, sessionId, history = [] } = req.body;
        if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

        // Fallback mock mode if no OpenAI key
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
            const mockReply = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
            // Log to session
            if (sessionId) {
                await Session.findByIdAndUpdate(sessionId, {
                    $push: { chatbotInteractions: { query: message, response: mockReply, intent: 'general' } },
                });
            }
            return res.json({ success: true, response: mockReply, mode: 'mock' });
        }

        const systemPrompt = await buildSystemPrompt(req.user.id);

        // Build message history for GPT-4
        const messages = [{ role: 'system', content: systemPrompt }];
        history.slice(-10).forEach((h) => {
            messages.push({ role: 'user', content: h.query });
            messages.push({ role: 'assistant', content: h.response });
        });
        messages.push({ role: 'user', content: message });

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            { model: process.env.OPENAI_MODEL || 'gpt-4', messages, temperature: 0.7, max_tokens: 500 },
            { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 30000 }
        );

        const reply = response.data.choices[0].message.content;

        // Detect intent
        let intent = 'general';
        if (/navigate|show me|go to|take me/i.test(message)) intent = 'navigate';
        else if (/compare/i.test(message)) intent = 'compare';
        else if (/add to cart|buy|purchase/i.test(message)) intent = 'buy';
        else if (/search|find|looking for/i.test(message)) intent = 'search';

        // Save interaction to session
        if (sessionId) {
            await Session.findByIdAndUpdate(sessionId, {
                $push: { chatbotInteractions: { query: message, response: reply, intent } },
            });
        }

        // Extract product name for navigation command
        const navigateMatch = reply.match(/\[NAVIGATE:([^\]]+)\]/);
        const productIds = [...reply.matchAll(/\[PRODUCT:([^\]]+)\]/g)].map((m) => m[1]);

        return res.json({
            success: true,
            response: reply.replace(/\[NAVIGATE:[^\]]+\]/g, '').replace(/\[PRODUCT:[^\]]+\]/g, '').trim(),
            intent,
            navigateTo: navigateMatch ? navigateMatch[1] : null,
            productIds,
        });
    } catch (err) {
        logger.error('Chatbot error:', err.message);
        next(err);
    }
}

/**
 * GET /api/chatbot/history/:sessionId
 * Return the chatbot conversation history for a session.
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
 * Clear chatbot history for a session.
 */
async function clearHistory(req, res, next) {
    try {
        await Session.findByIdAndUpdate(req.params.sessionId, { $set: { chatbotInteractions: [] } });
        return res.json({ success: true, message: 'History cleared' });
    } catch (err) { next(err); }
}

module.exports = { sendMessage, getHistory, clearHistory };
