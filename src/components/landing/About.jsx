import { FaUsers, FaHospital, FaClinicMedical, FaStore } from 'react-icons/fa';

const About = () => {
  const targetUsers = [
    {
      icon: <FaUsers className="text-4xl text-primary-600" />,
      title: "Pharmacists",
      description: "Manage prescriptions and inventory efficiently"
    },
    {
      icon: <FaStore className="text-4xl text-primary-600" />,
      title: "Pharmacy Store Managers",
      description: "Oversee operations and stock management"
    },
    {
      icon: <FaHospital className="text-4xl text-primary-600" />,
      title: "Hospital Inventory Staff",
      description: "Control medical supply chains"
    },
    {
      icon: <FaClinicMedical className="text-4xl text-primary-600" />,
      title: "Healthcare Centers",
      description: "Maintain essential medicine availability"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* About Section */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About the Product
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            <strong>MediStock AI</strong> is an intelligent pharmacy inventory management system built to solve 
            the challenges of manual stock tracking, medicine expiry, and unexpected stockouts. Designed specifically 
            for <strong>pharmacies, hospitals, and healthcare clinics</strong>, this MERN stack application combines 
            artificial intelligence with modern web technologies to automate inventory operations. It addresses critical 
            problems such as expired medicine wastage, inaccurate demand planning, inefficient stock management, and 
            lack of real-time visibility—helping healthcare providers deliver better patient care while reducing 
            operational costs and improving profitability.
          </p>
        </div>

        {/* Target Users */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Who Can Use MediStock AI?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {targetUsers.map((user, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-primary-50 to-blue-50 p-6 rounded-xl text-center hover:shadow-lg transition-all"
              >
                <div className="mb-4 flex justify-center">
                  {user.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {user.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {user.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
