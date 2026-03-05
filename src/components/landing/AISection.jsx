import { FaRobot, FaMicrophone, FaLanguage, FaDatabase, FaCheckCircle } from 'react-icons/fa';

const highlights = [
  'Asks real inventory questions — "How many Paracetamol do we have?"',
  'Identifies low-stock and near-expiry medicines instantly',
  'Fetches live data from MongoDB on every query',
  'Supports English & Tamil with voice input and TTS',
  'Secured behind JWT — only authenticated users can access it',
];

const AISection = () => (
  <section id="ai" className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left: text */}
        <div>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-5">
            <FaRobot /> Gemini AI
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
            A Chatbot That Actually
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> Knows Your Stock</span>
          </h2>
          <p className="text-lg text-gray-500 mb-8 leading-relaxed">
            Unlike generic AI chatbots, MediStock AI injects your live pharmacy database into every Gemini query.
            It answers specific, real questions about your inventory — not templated responses.
          </p>
          <ul className="space-y-3 mb-8">
            {highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-3">
                <FaCheckCircle className="text-purple-500 text-lg flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">{h}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
              <FaMicrophone className="text-orange-500" />
              <span className="text-sm font-medium text-orange-700">Voice Input</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <FaLanguage className="text-blue-500" />
              <span className="text-sm font-medium text-blue-700">English & Tamil</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
              <FaDatabase className="text-green-500" />
              <span className="text-sm font-medium text-green-700">Live DB Data</span>
            </div>
          </div>
        </div>

        {/* Right: mock chat UI */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <FaRobot className="text-white text-lg" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">MediStock AI Chatbot</p>
              <p className="text-green-400 text-xs flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full inline-block" /> Online — Live DB connected
              </p>
            </div>
          </div>

          {/* Conversation */}
          <div className="space-y-4">
            {[
              { user: true, text: 'Which medicines are low on stock?' },
              { user: false, text: 'Currently 3 medicines are at or below reorder level:\n• Amoxicillin 250mg — 12 units (reorder: 40)\n• Metformin 500mg — 8 units (reorder: 45)\n• Losartan 50mg — 5 units (reorder: 30)\n\nI recommend placing orders immediately.' },
              { user: true, text: 'What is the selling price of Paracetamol?' },
              { user: false, text: 'Paracetamol 500mg:\n• Selling: ₹9.00\n• Purchase: ₹4.50\n• Stock: 120 units | Rack: A-01' },
            ].map((m, i) => (
              <div key={i} className={`flex ${m.user ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line ${m.user
                    ? 'bg-primary-600 text-white rounded-br-sm'
                    : 'bg-white/10 text-white/90 rounded-bl-sm'
                  }`}>
                  {m.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            <div className="flex justify-start">
              <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-2 h-2 bg-white/40 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
);

export default AISection;
