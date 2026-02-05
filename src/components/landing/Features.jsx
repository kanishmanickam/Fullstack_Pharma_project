import { 
  FaBrain, 
  FaBell, 
  FaBoxes, 
  FaChartBar, 
  FaShieldAlt, 
  FaClock,
  FaMobileAlt,
  FaSync
} from 'react-icons/fa';

const Features = () => {
  const features = [
    {
      icon: <FaBrain className="text-4xl text-primary-600" />,
      title: "AI Demand Forecasting",
      description: "Advanced machine learning models analyze historical data and seasonal patterns to predict future medicine demand with high accuracy."
    },
    {
      icon: <FaBell className="text-4xl text-primary-600" />,
      title: "Expiry & FEFO Management",
      description: "Smart First-Expiry-First-Out algorithm ensures medicines nearing expiration are sold first, minimizing wastage and maintaining quality."
    },
    {
      icon: <FaBoxes className="text-4xl text-primary-600" />,
      title: "Low Stock Alerts",
      description: "Real-time automated alerts notify you when inventory reaches critical levels, preventing stockouts and ensuring continuous availability."
    },
    {
      icon: <FaChartBar className="text-4xl text-primary-600" />,
      title: "Reports & Analytics",
      description: "Comprehensive visual dashboards display sales trends, stock movements, expiry forecasts, and profitability insights for informed decisions."
    },
    {
      icon: <FaShieldAlt className="text-4xl text-primary-600" />,
      title: "Excel Upload & Validation",
      description: "Bulk import inventory data from Excel files with automatic validation, duplicate detection, and error handling for seamless data migration."
    },
    {
      icon: <FaClock className="text-4xl text-primary-600" />,
      title: "Real-Time Dashboard",
      description: "Live updates on stock levels, pending orders, expiring medicines, and sales metrics accessible from a centralized control panel."
    },
    {
      icon: <FaMobileAlt className="text-4xl text-primary-600" />,
      title: "Chatbot Assistant",
      description: "AI-powered conversational assistant helps users query inventory, get medicine information, and receive personalized recommendations instantly."
    },
    {
      icon: <FaSync className="text-4xl text-primary-600" />,
      title: "Anomaly Detection",
      description: "Intelligent monitoring identifies unusual stock patterns, suspicious transactions, and inventory discrepancies to prevent losses."
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Key Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive suite of intelligent tools designed to automate pharmacy operations, 
            reduce medicine wastage, and ensure optimal stock availability.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary-500 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
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

export default Features;
