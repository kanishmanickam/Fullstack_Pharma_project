import { FaGithub, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer id="contact" className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">
              MediStock <span className="text-primary-500">AI</span>
            </h3>
            <p className="text-gray-400 mb-2 font-semibold">
              Smart Pharmacy Inventory Management
            </p>
            <p className="text-gray-400 mb-4 text-sm">
              AI-powered solution for pharmacies, hospitals, and healthcare centers.
              Automate inventory, reduce wastage, and ensure medicine availability.
            </p>
            <p className="text-gray-500 text-sm italic">
              🎓 Academic Project | College Capstone
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <FaGithub size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <FaLinkedin size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="hover:text-primary-500 transition-colors">Home</a>
              </li>
              <li>
                <a href="#features" className="hover:text-primary-500 transition-colors">Features</a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-primary-500 transition-colors">Architecture</a>
              </li>
              <li>
                <a href="#techstack" className="hover:text-primary-500 transition-colors">Tech Stack</a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-primary-500 transition-colors">Documentation</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500 transition-colors">API Reference</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500 transition-colors">Support</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500 transition-colors">Privacy Policy</a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <FaEnvelope className="mt-1 text-primary-500 flex-shrink-0" />
                <span>info@medistock-ai.com</span>
              </li>
              <li className="flex items-start gap-3">
                <FaPhone className="mt-1 text-primary-500 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="mt-1 text-primary-500 flex-shrink-0" />
                <span>123 Healthcare St, Medical District, NY 10001</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-gray-400">
                © {new Date().getFullYear()} MediStock AI. All rights reserved.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                College Project - Educational Purpose
              </p>
            </div>

            {/* Team Info */}
            <div className="text-center md:text-right">
              <p className="text-gray-400">
                Built with ❤️ by Team MediStock
              </p>
              <p className="text-sm text-gray-500 mt-1">
                MERN Stack + AI | Academic Portfolio 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
