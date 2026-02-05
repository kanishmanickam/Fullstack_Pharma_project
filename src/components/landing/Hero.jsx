import { FaRocket, FaChartLine } from 'react-icons/fa';

const Hero = () => {
  return (
    <section id="home" className="pt-24 pb-20 bg-gradient-to-br from-primary-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full mb-6">
            <span className="text-primary-700 font-semibold text-sm">
              AI-Powered Inventory Intelligence
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            MediStock AI
            <span className="block text-primary-600">Smart Pharmacy Inventory Management</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
            Revolutionize your pharmacy operations with AI-powered inventory intelligence. 
            Eliminate stockouts, reduce medicine wastage, and ensure patient safety through intelligent automation.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl flex items-center gap-2">
              <FaRocket />
              Explore Features
            </button>
            <button className="bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all font-semibold text-lg border-2 border-primary-600 flex items-center gap-2">
              <FaChartLine />
              View Architecture
            </button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl font-bold text-primary-600 mb-2">95%+</div>
              <div className="text-gray-600 font-medium">Forecast Accuracy</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl font-bold text-primary-600 mb-2">40%</div>
              <div className="text-gray-600 font-medium">Wastage Reduction</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl font-bold text-primary-600 mb-2">Real-Time</div>
              <div className="text-gray-600 font-medium">Stock Monitoring</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
