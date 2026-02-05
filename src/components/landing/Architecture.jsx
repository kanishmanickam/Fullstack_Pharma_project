import { Fragment } from 'react';
import { FaArrowRight, FaDatabase, FaServer, FaBrain, FaLaptopCode } from 'react-icons/fa';

const Architecture = () => {
  const architectureFlow = [
    {
      icon: <FaLaptopCode className="text-4xl" />,
      title: "React Frontend",
      description: "Interactive UI with real-time updates",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <FaServer className="text-4xl" />,
      title: "Node.js + Express",
      description: "RESTful API & Business Logic",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <FaBrain className="text-4xl" />,
      title: "AI Module",
      description: "ML predictions & analytics",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <FaDatabase className="text-4xl" />,
      title: "MongoDB",
      description: "Flexible data storage",
      color: "from-emerald-500 to-emerald-600"
    }
  ];

  return (
    <section id="architecture" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            System Architecture
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A modern three-tier architecture with React frontend, Node.js/Express backend, 
            AI processing module, and MongoDB database—designed for scalability and real-time performance.
          </p>
        </div>

        {/* Architecture Flow */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 mb-16">
          {architectureFlow.map((component, index) => (
            <Fragment key={index}>
              <div className="w-full lg:w-64">
                <div className={`bg-gradient-to-br ${component.color} p-8 rounded-2xl shadow-xl text-white text-center transform hover:scale-105 transition-all duration-300`}>
                  <div className="mb-4 flex justify-center">
                    {component.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    {component.title}
                  </h3>
                  <p className="text-sm text-white/90">
                    {component.description}
                  </p>
                </div>
              </div>
              {index < architectureFlow.length - 1 && (
                <div className="hidden lg:block">
                  <FaArrowRight className="text-3xl text-gray-400" />
                </div>
              )}
              {index < architectureFlow.length - 1 && (
                <div className="lg:hidden">
                  <div className="h-8 w-1 bg-gray-300 mx-auto"></div>
                </div>
              )}
            </Fragment>
          ))}
        </div>

        {/* Architecture Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Frontend Layer - React
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">•</span>
                <span>Interactive dashboard with real-time updates</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">•</span>
                <span>Responsive UI built with React hooks and components</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">•</span>
                <span>Tailwind CSS for modern, mobile-first design</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">•</span>
                <span>Charts and visualizations for analytics</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Backend Layer - Node.js & Express
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">•</span>
                <span>RESTful API endpoints for all operations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">•</span>
                <span>JWT-based authentication and role management</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">•</span>
                <span>Business logic and validation middleware</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">•</span>
                <span>Integration with AI module and database</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              AI Module - Python
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">•</span>
                <span>Machine learning models for demand prediction</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">•</span>
                <span>FEFO algorithm for expiry management</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">•</span>
                <span>Anomaly detection for unusual patterns</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">•</span>
                <span>LLM-based chatbot for user assistance</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Database Layer - MongoDB
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">•</span>
                <span>NoSQL document storage for flexible schemas</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">•</span>
                <span>Collections for medicines, users, orders, alerts</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">•</span>
                <span>Mongoose ODM for data modeling and validation</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">•</span>
                <span>Indexing for fast query performance</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Architecture;
