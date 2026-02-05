import { FaHospital, FaPills, FaStore, FaCheckCircle } from 'react-icons/fa';

const UseCases = () => {
  const useCases = [
    {
      icon: <FaHospital className="text-5xl text-primary-600" />,
      title: "Reduces Medicine Wastage",
      description: "FEFO algorithm and expiry alerts ensure medicines are used before expiration, significantly reducing losses from expired stock.",
      benefits: [
        "Prioritize medicines nearing expiry",
        "Automated expiry notifications",
        "Track and minimize waste metrics"
      ]
    },
    {
      icon: <FaPills className="text-5xl text-primary-600" />,
      title: "Prevents Stockouts",
      description: "AI forecasting and low stock alerts ensure critical medicines are always available, preventing emergency shortages.",
      benefits: [
        "Predictive restocking recommendations",
        "Real-time inventory visibility",
        "Never miss critical medications"
      ]
    },
    {
      icon: <FaStore className="text-5xl text-primary-600" />,
      title: "Improves Patient Safety",
      description: "Ensure medicine quality and availability through intelligent monitoring, expiry management, and anomaly detection.",
      benefits: [
        "Prevent expired medicine dispensing",
        "Maintain optimal stock levels",
        "Track medicine authenticity"
      ]
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose MediStock AI?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Designed for pharmacies, hospitals, and healthcare centers to eliminate manual errors, 
            improve patient safety, and make data-driven inventory decisions.
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="mb-6">
                {useCase.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {useCase.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {useCase.description}
              </p>
              <div className="space-y-3">
                {useCase.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <FaCheckCircle className="text-primary-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-primary-600 rounded-2xl p-10 shadow-xl">
            <h3 className="text-3xl font-bold text-white mb-4">
              Expected Outcomes & Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto mb-8">
              <div className="flex items-start gap-3">
                <FaCheckCircle className="text-primary-100 mt-1 flex-shrink-0 text-xl" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Real-Time Stock Visibility</h4>
                  <p className="text-primary-100 text-sm">Access live inventory data anytime, anywhere with centralized dashboard</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaCheckCircle className="text-primary-100 mt-1 flex-shrink-0 text-xl" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Automated Alerts</h4>
                  <p className="text-primary-100 text-sm">Receive instant notifications for expiry, low stock, and anomalies</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaCheckCircle className="text-primary-100 mt-1 flex-shrink-0 text-xl" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Accurate Predictions</h4>
                  <p className="text-primary-100 text-sm">AI forecasting provides precise demand estimates for better planning</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaCheckCircle className="text-primary-100 mt-1 flex-shrink-0 text-xl" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Reduced Losses</h4>
                  <p className="text-primary-100 text-sm">Minimize wastage from expiry and overstocking through intelligent management</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaCheckCircle className="text-primary-100 mt-1 flex-shrink-0 text-xl" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Faster Decision-Making</h4>
                  <p className="text-primary-100 text-sm">Data-driven insights enable quick, informed business decisions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaCheckCircle className="text-primary-100 mt-1 flex-shrink-0 text-xl" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Automated Operations</h4>
                  <p className="text-primary-100 text-sm">Eliminate manual tracking and paperwork with digital automation</p>
                </div>
              </div>
            </div>
            <button className="bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all font-semibold text-lg shadow-lg">
              Explore the System
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UseCases;
