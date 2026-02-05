import { useState } from 'react';
import { FaTimes, FaMicrophone, FaLanguage, FaPaperPlane } from 'react-icons/fa';

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! I\'m MediStock AI Assistant. How can I help you with inventory today?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('en');

  const predefinedResponses = {
    'stock': 'You have 8 medicines in your inventory. 3 are low stock and need reordering.',
    'expiry': 'There are 2 medicines expiring within 30 days. Check the dashboard for FEFO priority.',
    'paracetamol': 'Paracetamol 500mg: 45 units in stock, Rack A1, expires on 2024-03-15. Status: Low Stock.',
    'help': 'I can help you with:\n- Check stock levels\n- Find medicines\n- Expiry information\n- Rack locations\n- Stock recommendations',
    'default': 'I can help you with inventory queries. Try asking about stock, expiry, or specific medicines.'
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { id: messages.length + 1, text: input, sender: 'user' };
    setMessages([...messages, userMessage]);

    // Simple keyword matching
    const lowerInput = input.toLowerCase();
    let response = predefinedResponses.default;

    if (lowerInput.includes('stock')) response = predefinedResponses.stock;
    else if (lowerInput.includes('expiry') || lowerInput.includes('expire')) response = predefinedResponses.expiry;
    else if (lowerInput.includes('paracetamol')) response = predefinedResponses.paracetamol;
    else if (lowerInput.includes('help')) response = predefinedResponses.help;

    setTimeout(() => {
      const botMessage = { id: messages.length + 2, text: response, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
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
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about inventory..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleSend}
            className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700"
          >
            <FaPaperPlane />
          </button>
          <button className="bg-gray-200 text-gray-700 p-2 rounded-lg hover:bg-gray-300">
            <FaMicrophone />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Language: {language === 'en' ? 'English' : 'Tamil'} (Demo)
        </p>
      </div>
    </div>
  );
};

export default Chatbot;
