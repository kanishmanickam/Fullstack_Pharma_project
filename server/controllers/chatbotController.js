import axios from 'axios';
import log from '../utils/logger.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  process.env.GEMINI_API_URL ||
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Build the system prompt based on language.
 */
const buildSystemPrompt = (language) => {
  if (language === 'ta') {
    return `நீ MediStock AI எனும் மருந்தகத் தொழிலாளி. உன்னுடைய பணி மருந்துக்கடை சரக்கு முறைமைப் பற்றிய கேள்விகளுக்கு உதவ வேண்டும்.
    முக்கிய நிய்ம: - சரக்கு, விலை, சாய் நாள்கள், ரேக் இடங்கள் பற்றி மட்டும் பதில் சொல்.
    - மருத்துவ ஆலோசனை கொடுக்க வேண்டாம், மருந்தகம் சரக்கு தகவல் மட்டுமே.`;
  }
  return `You are MediStock AI, a pharmacy inventory assistant. Your role is to help with questions about pharmacy stock management.
  Key Rules:
  - Only provide information about stock, prices, expiry dates, and rack locations
  - Do NOT provide medical advice, only pharmacy inventory information
  - Be concise and helpful
  - If asked about something outside your scope, politely redirect to inventory topics`;
};

/**
 * Call Gemini API proxy on the backend.
 */
const callGeminiAPI = async (message, language) => {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the server');
  }

  const systemPrompt = buildSystemPrompt(language);
  const promptText = `${systemPrompt}\n\nUser query: ${message}\n\nRespond in ${language === 'ta' ? 'Tamil' : 'English'}:`;

  const { data } = await axios.post(
    `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
    {
      contents: [
        {
          parts: [{ text: promptText }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 200,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }

  return null;
};

/**
 * Simple keyword-based fallback response.
 */
const keywordFallback = (message, language) => {
  const lower = message.toLowerCase();

  if (lower.includes('stock') || lower.includes('inventory')) {
    return language === 'ta'
      ? 'பங்குவளம் பற்றிய தகவல் பெற /inventory பக்கத்திற்கு செல்லவும்'
      : 'For stock information, please visit the inventory page.';
  }
  if (lower.includes('medicine') || lower.includes('drug')) {
    return language === 'ta'
      ? 'மருந்து தகவல்: தயவுசெய்து பெயர் அல்லது வகை மூலம் தேடுக'
      : 'Medicine Info: Please search by name or category.';
  }
  if (lower.includes('price')) {
    return language === 'ta'
      ? 'விலை தகவல் மருந்தின் விவரங்களில் உள்ளது. மருந்தை தேடி பார்க்கவும்'
      : 'Pricing details are available in the medicine details. Please search for the medicine.';
  }
  if (lower.includes('order')) {
    return language === 'ta'
      ? 'புதிய விற்பனை செய்ய, பிற்பகல் பக்கத்திற்கு செல்லவும்'
      : 'To create a new order, please visit the billing page.';
  }

  return language === 'ta'
    ? 'மன்னிக்கவும், நான் இந்த கேள்விக்கு பதிலளிக்க முடியவில்லை. சரக்கு அல்லது மருந்து பற்றி கேளுங்கள்'
    : 'Sorry, I can only help with inventory and medicine queries. Please ask about stock or medicines.';
};

// Chatbot query handler
export const chatbotQuery = async (req, res) => {
  try {
    const { message, language = 'en' } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    let response;
    let source = 'gemini';

    try {
      response = await callGeminiAPI(message, language);
    } catch (geminiError) {
      log('WARN', 'Gemini API failed, using keyword fallback', {
        error: geminiError.message,
      });
    }

    if (!response) {
      response = keywordFallback(message, language);
      source = 'fallback';
    }

    const disclaimer = '⚠️ This is an AI assistant. Not for medical advice.';

    log('INFO', `Chatbot query processed via ${source}`, {
      message: message.substring(0, 50),
    });

    res.status(200).json({
      success: true,
      response,
      disclaimer,
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
