import { FaBrain, FaRobot, FaExclamationTriangle, FaSort } from 'react-icons/fa';

const AISection = () => {
  const aiFeatures = [
    {
      icon: <FaBrain className="text-5xl text-purple-600" />,
      title: "Demand Forecasting",
      description: "Machine learning models analyze historical sales data, seasonal trends, and consumption patterns to predict future medicine demand. Uses time-series analysis and regression algorithms to provide accurate forecasts, helping pharmacies order the right quantity at the right time."
    },
    {
      icon: <FaSort className="text-5xl text-blue-600" />,
      title: "FEFO Algorithm",
      description: "First-Expiry-First-Out intelligent sorting automatically prioritizes medicines based on expiration dates. The system suggests which batches to sell first, ensuring older stock moves before newer arrivals, drastically reducing wastage from expired medicines."
    },
    {
      icon: <FaExclamationTriangle className="text-5xl text-orange-600" />,
      title: "Anomaly Detection",
      description: "AI-powered monitoring continuously analyzes inventory patterns to identify unusual activities such as sudden stock depletion, suspicious transactions, inventory mismatches, or irregular ordering patterns. Alerts administrators to potential theft, errors, or fraud."
    },
    {
      icon: <FaRobot className="text-5xl text-green-600" />,
      title: "Chatbot Assistant",
      description: "Conversational AI powered by Large Language Models (LLM) provides instant responses to user queries. Ask about medicine availability, get dosage information, receive restocking recommendations, or query sales reports through natural language conversations."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            AI & Intelligence Layer
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced artificial intelligence capabilities that power smart decision-making, 
            automate complex tasks, and provide intelligent insights for pharmacy operations.
          </p>
        </div>

        {/* AI Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {aiFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all"
            >
              <div className="mb-6">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AISection;
