import axios from 'axios';
import { Medicine, Bill, Alert } from '../models/index.js';
import { isNearExpiry, isExpired } from '../utils/helpers.js';
import log from '../utils/logger.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  process.env.GEMINI_API_URL ||
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Fetch a live snapshot of the inventory and format it as a readable context block.
 */
const buildInventoryContext = async () => {
  const medicines = await Medicine.find().lean();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayBills = await Bill.find({ createdAt: { $gte: today } }).lean();
  const todaySales = todayBills.reduce((s, b) => s + b.grandTotal, 0);

  const lowStock = medicines.filter(m => m.quantity <= m.reorderLevel);
  const nearExpiry = medicines.filter(m => isNearExpiry(m.expiryDate, 30));
  const expired = medicines.filter(m => isExpired(m.expiryDate));

  const medicineList = medicines.map(m =>
    `• ${m.name} | Category: ${m.category} | Batch: ${m.batchNumber} | ` +
    `Expiry: ${m.expiryDate} | Qty: ${m.quantity} | ` +
    `Purchase: ₹${m.purchasePrice} | Selling: ₹${m.sellingPrice} | ` +
    `Rack: ${m.rackNumber} | Reorder Level: ${m.reorderLevel} | Supplier: ${m.supplier}`
  ).join('\n');

  return `
=== LIVE PHARMACY INVENTORY DATA (as of ${new Date().toLocaleString('en-IN')}) ===

SUMMARY:
- Total medicines: ${medicines.length}
- Low stock (at or below reorder level): ${lowStock.length} → ${lowStock.map(m => m.name).join(', ') || 'None'}
- Near expiry (within 30 days): ${nearExpiry.length} → ${nearExpiry.map(m => `${m.name} (${m.expiryDate})`).join(', ') || 'None'}
- Expired medicines: ${expired.length} → ${expired.map(m => m.name).join(', ') || 'None'}
- Today's sales: ₹${todaySales.toFixed(2)} across ${todayBills.length} bill(s)

FULL MEDICINE LIST:
${medicineList || 'No medicines in inventory.'}
===
`;
};

/**
 * Build the system prompt with live inventory injected.
 */
const buildPrompt = (inventoryContext, userMessage, language) => {
  const langInstruction = language === 'ta'
    ? 'Respond in Tamil language.'
    : 'Respond in English.';

  return `You are MediStock AI, an intelligent pharmacy inventory assistant with access to LIVE inventory data.

Your capabilities:
- Answer specific questions about stock levels, prices, expiry dates, rack locations, suppliers
- Identify low stock and near-expiry medicines
- Calculate totals, compare prices, check availability
- Provide reorder recommendations
- Report today's sales summary

Rules:
- Only discuss pharmacy inventory topics
- Do NOT provide medical advice (dosage, treatment, diagnosis)
- Be concise and accurate — use the real data provided below
- If a medicine is not found in the list, say so clearly
- ${langInstruction}

${inventoryContext}

User question: ${userMessage}`;
};

/**
 * Call Gemini API with the full context prompt.
 */
const callGeminiAPI = async (prompt) => {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the server');
  }

  const { data } = await axios.post(
    `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 512,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
};

/**
 * Simple keyword fallback if Gemini is unavailable.
 */
const keywordFallback = (message, medicines, language) => {
  const lower = message.toLowerCase();
  const ta = language === 'ta';

  if (lower.includes('low stock') || lower.includes('reorder')) {
    const low = medicines.filter(m => m.quantity <= m.reorderLevel);
    if (!low.length) return ta ? 'அனைத்து மருந்துகளும் போதுமான அளவில் உள்ளன.' : 'All medicines are adequately stocked.';
    return (ta ? 'குறைந்த இருப்பு மருந்துகள்:\n' : 'Low stock medicines:\n') +
      low.map(m => `• ${m.name}: ${m.quantity} units (reorder: ${m.reorderLevel})`).join('\n');
  }

  if (lower.includes('expir')) {
    const near = medicines.filter(m => isNearExpiry(m.expiryDate, 30));
    if (!near.length) return ta ? 'அடுத்த 30 நாட்களில் காலாவதியாகும் மருந்துகள் இல்லை.' : 'No medicines expiring in the next 30 days.';
    return (ta ? 'விரைவில் காலாவதியாகும் மருந்துகள்:\n' : 'Medicines expiring soon:\n') +
      near.map(m => `• ${m.name}: ${m.expiryDate}`).join('\n');
  }

  // Search by name
  const found = medicines.filter(m => lower.includes(m.name.toLowerCase().split(' ')[0]));
  if (found.length) {
    return found.map(m =>
      `${m.name}\n  Stock: ${m.quantity} | Price: ₹${m.sellingPrice} | Rack: ${m.rackNumber} | Expiry: ${m.expiryDate}`
    ).join('\n\n');
  }

  return ta
    ? 'மன்னிக்கவும், சரக்கு அல்லது மருந்து பற்றிய கேள்விகளுக்கு மட்டுமே பதிலளிக்க முடியும்.'
    : 'I can help with inventory queries — try asking about stock levels, prices, expiry dates, or a specific medicine name.';
};

// Chatbot query handler
export const chatbotQuery = async (req, res) => {
  try {
    const { message, language = 'en' } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Always fetch live inventory
    const medicines = await Medicine.find().lean();
    let response = null;
    let source = 'gemini';

    try {
      const inventoryContext = await buildInventoryContext();
      const prompt = buildPrompt(inventoryContext, message, language);
      response = await callGeminiAPI(prompt);
    } catch (geminiError) {
      log('WARN', 'Gemini API failed, using keyword fallback', { error: geminiError.message });
    }

    if (!response) {
      response = keywordFallback(message, medicines, language);
      source = 'fallback';
    }

    log('INFO', `Chatbot query processed via ${source}`, { message: message.substring(0, 50) });

    res.status(200).json({
      success: true,
      response,
      disclaimer: '⚠️ This is an AI assistant. Not for medical advice.',
      language,
      source,
    });
  } catch (error) {
    log('ERROR', 'Chatbot query error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error processing chatbot query',
      error: error.message,
    });
  }
};
