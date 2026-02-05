import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-bold text-primary-600">
              MediStock <span className="text-primary-500">AI</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('home')}
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('architecture')}
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Architecture
            </button>
            <button
              onClick={() => scrollToSection('techstack')}
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Tech Stack
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Contact
            </button>
            <Link
              to="/login"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Login
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-primary-600 focus:outline-none"
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button
              onClick={() => scrollToSection('home')}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-md font-medium"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-md font-medium"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('architecture')}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-md font-medium"
            >
              Architecture
            </button>
            <button
              onClick={() => scrollToSection('techstack')}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-md font-medium"
            >
              Tech Stack
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-md font-medium"
            >
              Contact
            </button>
            <Link
              to="/login"
              className="block w-full text-left px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
