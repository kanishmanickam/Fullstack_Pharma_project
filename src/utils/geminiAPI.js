/**
 * Gemini AI Integration for Smart Chatbot Responses
 * Uses Google's Generative AI API for intelligent conversation
 */

const GEMINI_API_KEY = 'AIzaSyB4WxEIVJIAaHRxDEJlja1GXdLGXaMs-bI';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * Get AI-powered response from Gemini API
 * Designed specifically for pharmacy inventory assistant
 */
export const getGeminiResponse = async (userMessage, language = 'en') => {
  try {
    const systemPrompt = language === 'ta' 
      ? `நீ MediStock AI எனும் மருந்தகத் தொழிலாளி. உன்னுடைய பணி மருந்துக்கடை சரக்கு முறைமைப் பற்றிய கேள்விகளுக்கு உதவ வேண்டும். 
      மருந்துக்கடை சரக்குகள் (8 மருந்துகள்): பாராசிட்டமால் (45 அலகுகள்), ஆஸ்பிரின் (32 அலகுகள்), இபுப்ரோஃபன் (28 அலகுகள்), வைட்டமின் சி (18 அலகுகள்), இருமல் சிரப் (8 அலகுகள்), வைட்டமின் பி (12 அலகுகள்), ​​অ্যান্টাসিড (15 அলকুগূல्), ইনজেক্টেবল (5 মন্টপ).
      முக்கிய நিয়ম: - சரক்கு, விலை, சாய் நாள்கள், ரேக் இடங்கள் பற்றি மட்டும் உত्वर दान.
      - மেडिकल adviceม் கொடுக்க வேண்டாம், केवल மருந்தகம் சরক्कு தথাव्हาही।
      - வட்டக்கூறு தமिल्_Cไमدि தिल् బుుుద。`
      : `You are MediStock AI, a pharmacy inventory assistant. Your role is to help with questions about pharmacy stock management.
      Pharmacy Inventory (8 medicines): Paracetamol (45 units), Aspirin (32 units), Ibuprofen (28 units), Vitamin C (18 units), Cough Syrup (8 units), Vitamin B Complex (12 units), Antacid (15 units), Injectables (5 units).
      Key Rules:
      - Only provide information about stock, prices, expiry dates, and rack locations
      - Do NOT provide medical advice, only pharmacy inventory information
      - Be concise and helpful
      - If asked about something outside your scope, politely redirect to inventory topics`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\nUser query: ${userMessage}\n\nRespond in ${language === 'ta' ? 'Tamil' : 'English'}:`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 200,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE'
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Gemini API Error:', error);
      return null;
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const botMessage = data.candidates[0].content.parts[0].text;
      console.log('Gemini Response:', botMessage);
      return botMessage;
    }

    return null;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return null;
  }
};

/**
 * Get response with fallback to predefined responses
 * Tries Gemini first, falls back to predefined responses if API fails
 */
export const getSmartResponse = async (userMessage, language = 'en', predefinedResponses = null) => {
  try {
    // Try Gemini API first
    const geminiResponse = await getGeminiResponse(userMessage, language);
    
    if (geminiResponse) {
      return geminiResponse;
    }
  } catch (error) {
    console.error('Gemini API failed, using predefined responses:', error);
  }

  // Fallback to predefined responses if API fails
  if (predefinedResponses) {
    const lowerInput = userMessage.toLowerCase();
    const responses = predefinedResponses[language];
    
    for (const [key, value] of Object.entries(responses)) {
      if (key === 'default') continue;
      const keywords = key.split('|');
      if (keywords.some(keyword => lowerInput.includes(keyword.toLowerCase()))) {
        return value;
      }
    }
    
    return responses.default;
  }

  return 'I can help you with pharmacy inventory queries. Please ask about stock, medicines, prices, or expiry dates.';
};
