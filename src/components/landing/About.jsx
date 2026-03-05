import { Link } from 'react-router-dom';
import { FaGraduationCap, FaRocket } from 'react-icons/fa';

const About = () => (
  <section id="about" className="py-24 bg-white">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-5">
        About This Project
      </span>
      <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
        Built to Solve a Real Problem
      </h2>
      <p className="text-lg text-gray-500 leading-relaxed mb-6 max-w-3xl mx-auto">
        <strong>MediStock AI</strong> was built as an academic capstone project to address real-world inefficiencies in
        pharmacy inventory management — expired medicines, manual stocktaking, and reactive ordering.
      </p>
      <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-3xl mx-auto">
        It combines a full-stack MERN architecture with Google Gemini AI to deliver a system that doesn't just store data,
        but actively helps pharmacists make smarter decisions through live AI insights, automated alerts, and intuitive tools.
      </p>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/login"
          className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all">
          <FaRocket /> Try the App
        </Link>
        <div className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg">
          <FaGraduationCap /> Academic Project — Demo Version
        </div>
      </div>
    </div>
  </section>
);

export default About;
