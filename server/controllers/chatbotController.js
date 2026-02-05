import log from '../utils/logger.js';

// Chatbot query handler
export const chatbotQuery = async (req, res) => {
  try {
    const { message, language } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    // Simple keyword matching (mock AI)
    let response = '';

    if (
      message.toLowerCase().includes('stock') ||
      message.toLowerCase().includes('inventory')
    ) {
      response =
        language === 'ta'
          ? 'பங்குவளம் பற்றிய தகவல் பெற /inventory பக்கத்திற்கு செல்லவும்'
          : 'For stock information, please visit the inventory page.';
    } else if (
      message.toLowerCase().includes('medicine') ||
      message.toLowerCase().includes('drug')
    ) {
      response =
        language === 'ta'
          ? 'மருந்து தகவல்: தயவுசெய்து பெயர் அல்லது வகை மூலம் தேடுக'
          : 'Medicine Info: Please search by name or category.';
    } else if (message.toLowerCase().includes('price')) {
      response =
        language === 'ta'
          ? 'விலை நிர்ধারணம் மருந்தின் மீது முறை செய்தி இல்லை. மருந்தை தேடி பார்க்கவும்'
          : 'Pricing details are available in the medicine details. Please search for the medicine.';
    } else if (message.toLowerCase().includes('order')) {
      response =
        language === 'ta'
          ? 'புதிய விற்பனை சிலாக்கி செய்ய, பிற்பகல் பக்கத்திற்கு செல்லவும்'
          : 'To create a new order, please visit the billing page.';
    } else {
      response =
        language === 'ta'
          ? 'மன்னிக்கவும், நான் இந்த கேள்விக்கு பதிலளிக்க முடியவில்லை. சரக்கு அல்லது மருந்து பற்றி கேளுங்கள்'
          : 'Sorry, I can only help with inventory and medicine queries. Please ask about stock or medicines.';
    }

    // Disclaimer
    const disclaimer = '⚠️ This is an AI assistant. Not for medical advice.';

    log('INFO', 'Chatbot query processed', { message: message.substring(0, 50) });

    res.status(200).json({
      success: true,
      response,
      disclaimer,
      language: language || 'en',
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
