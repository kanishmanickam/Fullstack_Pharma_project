/**
 * Gemini AI Integration - Proxied via Backend
 *
 * All Gemini API calls are now routed through the backend at /api/chatbot/query.
 * The GEMINI_API_KEY is stored securely in the server's .env file and is never
 * exposed to the browser.
 */
import { chatbotAPI } from './api.js';

/**
 * Get AI-powered response via the backend proxy.
 * @param {string} userMessage
 * @param {string} language - 'en' or 'ta'
 * @returns {Promise<string|null>}
 */
export const getGeminiResponse = async (userMessage, language = 'en') => {
  try {
    const { data } = await chatbotAPI.query(userMessage, language);
    if (data?.success && data?.response) {
      return data.response;
    }
    return null;
  } catch (error) {
    console.error('Error calling chatbot API:', error);
    return null;
  }
};

/**
 * Get response with fallback to predefined responses.
 * Tries the backend (Gemini) first, falls back to predefined responses if the request fails.
 * @param {string} userMessage
 * @param {string} language
 * @param {Object|null} predefinedResponses
 */
export const getSmartResponse = async (
  userMessage,
  language = 'en',
  predefinedResponses = null
) => {
  try {
    const geminiResponse = await getGeminiResponse(userMessage, language);
    if (geminiResponse) {
      return geminiResponse;
    }
  } catch (error) {
    console.error('Backend chatbot failed, using predefined responses:', error);
  }

  // Fallback to predefined responses
  if (predefinedResponses) {
    const lowerInput = userMessage.toLowerCase();
    const responses = predefinedResponses[language];

    for (const [key, value] of Object.entries(responses)) {
      if (key === 'default') continue;
      const keywords = key.split('|');
      if (keywords.some((keyword) => lowerInput.includes(keyword.toLowerCase()))) {
        return value;
      }
    }

    return responses.default;
  }

  return 'I can help you with pharmacy inventory queries. Please ask about stock, medicines, prices, or expiry dates.';
};
