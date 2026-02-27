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
  const [isVoiceInput, setIsVoiceInput] = useState(false);
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
        setIsVoiceInput(true);
        // Auto-send after voice input
        setTimeout(() => handleSend(transcript), 500);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
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
      console.warn('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
    }
  };

  // Stop voice input
  const stopVoiceInput = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleSend = async (text = input) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage = { id: messages.length + 1, text: messageText, sender: 'user' };
    setMessages([...messages, userMessage]);
    setIsLoading(true);

    try {
      // Get smart response from Gemini API only
      const response = await getSmartResponse(messageText, language, null);

      setIsLoading(false);

      if (response) {
        setTimeout(() => {
          const botMessage = { id: messages.length + 2, text: response, sender: 'bot' };
          setMessages(prev => [...prev, botMessage]);
          
          // Only speak if input was from voice
          if (isVoiceInput && !isSpeaking) {
            speak(response);
          }
        }, 300);
      }
    } catch (error) {
      console.error('Error getting response:', error);
      setIsLoading(false);
      
      // Fallback message on error
      const errorMessage = language === 'ta' 
        ? 'மன்னிக்கவும், நான் இப்போது உங்களுக்கு உதவ முடியவில்லை. தயவு செய்து மீண்டும் முயற்சிக்கவும்.'
        : 'Sorry, I couldn\'t process that. Please try again.';

      setTimeout(() => {
        const botMessage = { id: messages.length + 2, text: errorMessage, sender: 'bot' };
        setMessages(prev => [...prev, botMessage]);
        if (isVoiceInput && !isSpeaking) {
          speak(errorMessage);
        }
      }, 300);
    }

    setInput('');
    setIsVoiceInput(false);
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
