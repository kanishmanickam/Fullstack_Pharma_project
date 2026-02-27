import { useState, useEffect, useRef } from 'react';
import { FaTimes, FaMicrophone, FaStop, FaLanguage, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { speakTamil, speakEnglish, stopSpeech, isTamilVoiceAvailable } from '../utils/tamilTTS';
import { getSmartResponse } from '../utils/geminiAPI';

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! I\'m MediStock AI Assistant. How can I help you with inventory today?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('en');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const messagesEndRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = language === 'ta' ? 'ta-IN' : 'en-US';

      recognitionInstance.onstart = () => {
        console.log(`Speech recognition started in ${language === 'ta' ? 'Tamil' : 'English'}`);
      };

      recognitionInstance.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        console.log(`Recognized text (${language}):`, transcript);
        setInput(transcript);
        setIsListening(false);
        // Auto-send after voice input
        setTimeout(() => handleSend(transcript), 500);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        alert(`Speech recognition error: ${event.error}. Make sure you're speaking clearly in ${language === 'ta' ? 'Tamil' : 'English'}.`);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    // Load voices for speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
      };
    }
  }, [language]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load voices on component mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Load voices
      window.speechSynthesis.onvoiceschanged = () => {
        const hasTamilVoice = isTamilVoiceAvailable();
        console.log('Tamil voice available:', hasTamilVoice);
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`).join(', '));
      };
      // Trigger voice loading
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Text-to-Speech with Tamil support
  const speak = async (text) => {
    try {
      if (language === 'ta') {
        await speakTamil(text, {
          rate: 0.8,
          pitch: 1.0,
          volume: 1.0,
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
          onError: (error) => {
            console.error('Tamil speech error:', error);
            setIsSpeaking(false);
          }
        });
      } else {
        await speakEnglish(text, {
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
          onError: (error) => {
            console.error('English speech error:', error);
            setIsSpeaking(false);
          }
        });
      }
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    stopSpeech();
    setIsSpeaking(false);
  };

  // Start voice input
  const startVoiceInput = () => {
    if (recognition) {
      setIsListening(true);
      // Ensure language is set before starting
      const lang = language === 'ta' ? 'ta-IN' : 'en-US';
      recognition.lang = lang;
      console.log(`Starting speech recognition in: ${lang}`);
      try {
        recognition.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        setIsListening(false);
      }
    } else {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
    }
  };

  // Stop voice input
  const stopVoiceInput = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const predefinedResponses = {
    en: {
      'stock|inventory|how many': 'You have 8 medicines in your inventory. Top items: Paracetamol (45 units), Aspirin (32 units), Ibuprofen (28 units). 3 medicines are at low stock and need reordering soon.',
      'expiry|expire|expired|shelf life': 'There are 2 medicines expiring within 30 days:\n• Cough Syrup - expires 2024-03-15\n• Vitamin B Complex - expires 2024-03-20\nUse FEFO (First Expiry, First Out) method for these.',
      'paracetamol|acetaminophen': 'Paracetamol 500mg:\n• Quantity: 45 units\n• Rack Location: A1\n• Expiry Date: 2024-03-15\n• Status: Low Stock ⚠️\n• Price: ₹12/unit',
      'aspirin': 'Aspirin 500mg:\n• Quantity: 32 units\n• Rack Location: B2\n• Expiry Date: 2024-06-20\n• Status: Adequate Stock ✓\n• Price: ₹8/unit',
      'ibuprofen': 'Ibuprofen 200mg:\n• Quantity: 28 units\n• Rack Location: C3\n• Expiry Date: 2024-05-10\n• Status: Adequate Stock ✓\n• Price: ₹15/unit',
      'low stock|reorder|need to order': 'Low Stock Items Requiring Reorder:\n1. Paracetamol 500mg - 45 units (Critical)\n2. Vitamin B Complex - 12 units (Warning)\n3. Cough Syrup - 8 units (Critical)\n\nRecommended action: Place reorder immediately.',
      'rack|location|where': 'Medicine Rack Locations:\n• A1: Paracetamol, Aspirin\n• B2: Ibuprofen, Vitamin C\n• C3: Cough Syrup, Antacid\n• D1: Injectable Medications\n• D2: Topical Creams\n\nUse this for quick medicine location.',
      'price|cost|how much': 'Current Medicine Prices:\n• Paracetamol: ₹12/unit\n• Aspirin: ₹8/unit\n• Ibuprofen: ₹15/unit\n• Vitamin C: ₹10/unit\n• Cough Syrup: ₹45/bottle\n\nPrices may vary by supplier.',
      'sales|sold|revenue|order': 'Total Sales Today: ₹2,450\nTop Selling: Paracetamol (12 units), Aspirin (8 units)\nAverage Transaction: ₹98\n\nView Financial Reports for detailed analytics.',
      'help|what can you|what do you': 'I can help you with:\n✓ Check stock levels & inventory\n✓ Find specific medicines\n✓ Expiry date information\n✓ Rack & storage locations\n✓ Medicine prices\n✓ Reordering recommendations\n✓ Sales & revenue data\n✓ Low stock alerts\n\nAsk me anything about your pharmacy!',
      'hello|hi|hey|good morning|good afternoon': 'Hello! 👋 Welcome to MediStock AI. I\'m here to help with your pharmacy inventory. You can ask me about stock levels, medicines, prices, or anything else inventory-related!',
      'thank|thanks': 'You\'re welcome! 😊 Feel free to ask if you need any more information about your inventory.',
      'default': 'That\'s an interesting question! I can help you with:\n• Stock levels & inventory status\n• Specific medicine information\n• Expiry dates & FEFO recommendations\n• Rack locations\n• Pricing information\n• Low stock alerts\n• Sales data\n\nPlease ask me about any of these topics or rephrase your question.'
    },
    ta: {
      'stock|inventory|how many|சரக்கு|எத்தனை': 'உங்கள் சரக்குகளில் 8 மருந்துகள் உள்ளன. முக்கிய உருப்பொருட்கள்: பாராசிட்டமால் (45 அலகுகள்), ஆஸ்பிரின் (32 அலகுகள்), இபுப்রோஃபன் (28 அலகுகள்). 3 மருந்துகள் குறைந்த சரக்கு நிலையில் உள்ளன.',
      'expiry|expire|expired|काலाവदhi|சாய': '30 நாட்களுக்குள் காலாவதியாகும் 2 மருந்துகள்:\n• இருமல் சிரப் - 2024-03-15\n• வைட்டமின் பி காம்ப்ளெக்ஸ் - 2024-03-20\nFEFO முறையைப் பயன்படுத்தவும்.',
      'paracetamol|பாராசிட்டமால்': 'பாராசிட்டமால் 500mg:\n• அளவு: 45 அலகுகள்\n• ரேக் இடம்: A1\n• சாய்க்கட்டி நாள்: 2024-03-15\n• நிலை: குறைந்த சரக்கு ⚠️\n• விலை: ₹12/அலகு',
      'aspirin|ஆஸ்பிரின்': 'ஆஸ்பிரின் 500mg:\n• அளவு: 32 அலகுகள்\n• ரேக் இடம்: B2\n• சாய்க்கட்டி நாள்: 2024-06-20\n• நிலை: போதுமான சரக்கு ✓\n• விலை: ₹8/அலகு',
      'low stock|reorder|குறைந்த சரக்கு|மறு ஆர்டர்': 'மறு ஆர்டர் தேவைப்படும் குறைந்த சரக்கு உருப்பொருட்கள்:\n1. பாராசிட்டமால் 500mg - 45 அலகுகள் (விமர்சன)\n2. வைட்டமின் பி - 12 அலகுகள்\n3. இருமல் சிரப் - 8 அலகுகள்\n\nசிபாரிசு: உடனே மறு ஆர்டர் செய்யவும்.',
      'price|விலை|எவ்வளவு': 'தற்போதைய மருந்து விலைகள்:\n• பாராசிட்டமால்: ₹12/அலகு\n• ஆஸ்பிரின்: ₹8/அலகு\n• இபுப்ரோஃபன்: ₹15/அலகு\n• வைட்டமின் சி: ₹10/அலகு\n• இருமல் சிரப்: ₹45/பாட்டில்',
      'help|உதவி|நீ என்ன': 'நான் உங்களுக்கு உதவ முடியும்:\n✓ சரக்கு நிலைகளை சரிபார்க்கவும்\n✓ குறிப்பிட்ட மருந்துகளைக் கண்டறியவும்\n✓ சாய்ப்பு தேதி தகவல்\n✓ ரேக் இடங்கள்\n✓ மருந்து விலைகள்\n✓ மறு ஆர்டர் சிபாரிசுகள்\n✓ விற்பனை தரவு\n\nআপনার மருந்தகம் பற்றி எதைப்பற்றியும் கேளுங்கள்!',
      'hello|hi|नमस्ते|வணக்கம்': 'வணக்கம்! 👋 MediStock AI க்கு வரவேற்கிறேன். உங்கள் ஔஷதக் கடைக்கு நான் உங்களுக்கு உதவ இங்கே இருக்கிறேன்!',
      'thank|நன்றி': 'நல்லது! 😊 உங்கள் சரக்கு பற்றி மேலும் தகவல் தேவைப்பட்டால் கேளுங்கள்.',
      'default': 'அது ஒரு சுவாரஸ்யமான கேள்வி! நான் உங்களுக்கு உதவ முடியும்:\n• சரக்கு நிலை\n• மருந்து தகவல்\n• சாய் நாள்\n• ரேக் இடங்கள்\n• விலைகள்\n• குறைந்த சரக்கு எச்சரிக்கைகள்\n\nதயவு செய்து மீண்டும் கேளுங்கள் அல்லது உங்கள் கேள்வியை மாற்றி கேளுங்கள்.'
    }
  };

  const handleSend = async (text = input) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage = { id: messages.length + 1, text: messageText, sender: 'user' };
    setMessages([...messages, userMessage]);
    setIsLoading(true);

    try {
      // Get smart response from Gemini API with predefined fallback
      const response = await getSmartResponse(messageText, language, predefinedResponses);

      setIsLoading(false);

      if (response) {
        setTimeout(() => {
          const botMessage = { id: messages.length + 2, text: response, sender: 'bot' };
          setMessages(prev => [...prev, botMessage]);
          
          // Auto-speak response if not already speaking
          if (!isSpeaking) {
            speak(response);
          }
        }, 300);
      }
    } catch (error) {
      console.error('Error getting response:', error);
      setIsLoading(false);
      
      // Fallback to predefined response on error
      const responses = predefinedResponses[language];
      let fallbackResponse = responses.default;
      
      const lowerInput = messageText.toLowerCase();
      for (const [key, value] of Object.entries(responses)) {
        if (key === 'default') continue;
        const keywords = key.split('|');
        if (keywords.some(keyword => lowerInput.includes(keyword.toLowerCase()))) {
          fallbackResponse = value;
          break;
        }
      }

      setTimeout(() => {
        const botMessage = { id: messages.length + 2, text: fallbackResponse, sender: 'bot' };
        setMessages(prev => [...prev, botMessage]);
        if (!isSpeaking) {
          speak(fallbackResponse);
        }
      }, 300);
    }

    setInput('');
  };

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="bg-primary-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">MediStock AI Chatbot</h3>
          <p className="text-xs text-primary-100">Inventory Assistant</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            className="bg-white/20 p-2 rounded-lg hover:bg-white/30"
          >
            <FaLanguage />
          </button>
          <button
            onClick={onClose}
            className="bg-white/20 p-2 rounded-lg hover:bg-white/30"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-2 text-xs text-yellow-700">
        ⚠️ This AI does not provide medical advice. For inventory queries only.
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-primary-600 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-900 rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-line">{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Status & Loading */}
      {(isListening || isSpeaking || isLoading) && (
        <div className="px-4 py-2 bg-primary-50 border-t border-primary-200">
          <p className="text-sm text-primary-600 flex items-center gap-2">
            {isListening && '🎤 Listening...'}
            {isSpeaking && '🔊 Speaking...'}
            {isLoading && (
              <>
                <FaSpinner className="animate-spin" />
                <span>Thinking...</span>
              </>
            )}
          </p>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder={isListening ? 'Listening...' : isLoading ? 'Processing...' : 'Ask about inventory...'}
            disabled={isListening || isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
          />
          <button
            onClick={() => handleSend()}
            className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            disabled={isListening || isLoading}
          >
            {isLoading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
          </button>
          <button
            onClick={isListening ? stopVoiceInput : startVoiceInput}
            className={`p-2 rounded-lg transition-colors ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
            disabled={isLoading}
          >
            {isListening ? <FaStop /> : <FaMicrophone />}
          </button>
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
              title="Stop speaking"
            >
              <FaStop />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Language: {language === 'en' ? 'English 🇬🇧' : 'Tamil 🇮🇳'} | Voice enabled 🎤🔊
        </p>
      </div>
    </div>
  );
};

export default Chatbot;
