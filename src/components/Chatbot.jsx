import { useState, useEffect, useRef } from 'react';
import { FaTimes, FaMicrophone, FaStop, FaLanguage, FaPaperPlane } from 'react-icons/fa';

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! I\'m MediStock AI Assistant. How can I help you with inventory today?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('en');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
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

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        // Auto-send after voice input
        setTimeout(() => handleSend(transcript), 500);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [language]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Text-to-Speech
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'ta' ? 'ta-IN' : 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Start voice input
  const startVoiceInput = () => {
    if (recognition) {
      setIsListening(true);
      recognition.lang = language === 'ta' ? 'ta-IN' : 'en-US';
      recognition.start();
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
      'stock': 'You have 8 medicines in your inventory. 3 are low stock and need reordering.',
      'expiry': 'There are 2 medicines expiring within 30 days. Check the dashboard for FEFO priority.',
      'paracetamol': 'Paracetamol 500mg: 45 units in stock, Rack A1, expires on 2024-03-15. Status: Low Stock.',
      'help': 'I can help you with:\n- Check stock levels\n- Find medicines\n- Expiry information\n- Rack locations\n- Stock recommendations',
      'default': 'I can help you with inventory queries. Try asking about stock, expiry, or specific medicines.'
    },
    ta: {
      'stock': 'உங்கள் சரக்குகளில் 8 மருந்துகள் உள்ளன. 3 குறைந்த சரக்கு மற்றும் மறு ஆர்டர் தேவை.',
      'expiry': '30 நாட்களுக்குள் காலாவதியாகும் 2 மருந்துகள் உள்ளன. FEFO முன்னுரிமைக்கு டாஷ்போர்டைச் சரிபார்க்கவும்.',
      'paracetamol': 'பாராசிட்டமால் 500mg: 45 யூனிட்கள் சரக்கில், ரேக் A1, 2024-03-15 அன்று காலாவதி. நிலை: குறைந்த சரக்கு.',
      'help': 'நான் உங்களுக்கு உதவ முடியும்:\n- சரக்கு நிலைகளை சரிபார்க்கவும்\n- மருந்துகளைக் கண்டறியவும்\n- காலாவதி தகவல்\n- ரேக் இடங்கள்\n- சரக்கு பரிந்துரைகள்',
      'default': 'நான் சரக்கு வினவல்களுக்கு உதவ முடியும். சரக்கு, காலாவதி அல்லது குறிப்பிட்ட மருந்துகளைப் பற்றி கேட்க முயற்சிக்கவும்.'
    }
  };

  const handleSend = (text = input) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage = { id: messages.length + 1, text: messageText, sender: 'user' };
    setMessages([...messages, userMessage]);

    // Simple keyword matching
    const lowerInput = messageText.toLowerCase();
    const responses = predefinedResponses[language];
    let response = responses.default;

    if (lowerInput.includes('stock') || lowerInput.includes('சரக்கு')) response = responses.stock;
    else if (lowerInput.includes('expiry') || lowerInput.includes('expire') || lowerInput.includes('காலாவதி')) response = responses.expiry;
    else if (lowerInput.includes('paracetamol') || lowerInput.includes('பாராசிட்டமால்')) response = responses.paracetamol;
    else if (lowerInput.includes('help') || lowerInput.includes('உதவி')) response = responses.help;

    setTimeout(() => {
      const botMessage = { id: messages.length + 2, text: response, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
      
      // Auto-speak response if not already speaking
      if (!isSpeaking) {
        speak(response);
      }
    }, 500);

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

      {/* Voice Status */}
      {(isListening || isSpeaking) && (
        <div className="px-4 py-2 bg-primary-50 border-t border-primary-200">
          <p className="text-sm text-primary-600">
            {isListening && '🎤 Listening...'}
            {isSpeaking && '🔊 Speaking...'}
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
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? 'Listening...' : 'Ask about inventory...'}
            disabled={isListening}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
          />
          <button
            onClick={() => handleSend()}
            className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            disabled={isListening}
          >
            <FaPaperPlane />
          </button>
          <button
            onClick={isListening ? stopVoiceInput : startVoiceInput}
            className={`p-2 rounded-lg transition-colors ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
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
