import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import logo from '../../assets/logo.png';

const links = [
  { label: 'Features', id: 'features' },
  { label: 'AI', id: 'ai' },
  { label: 'Use Cases', id: 'usecases' },
  { label: 'Architecture', id: 'architecture' },
  { label: 'Tech Stack', id: 'techstack' },
  { label: 'About', id: 'about' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl overflow-hidden bg-white shadow-md flex-shrink-0">
              <img src={logo} alt="MediStock" className="h-full w-full object-cover" />
            </div>
            <span className={`text-xl font-bold transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}>
              MediStock <span className="text-primary-500">AI</span>
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map(l => (
              <button key={l.id} onClick={() => scrollTo(l.id)}
                className={`font-medium text-sm transition-colors hover:text-primary-500 ${scrolled ? 'text-gray-700' : 'text-white/90'}`}>
                {l.label}
              </button>
            ))}
            <Link to="/login"
              className="bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700 font-semibold text-sm transition-all shadow-md hover:shadow-lg">
              Get Started →
            </Link>
          </div>

          {/* Mobile toggle */}
          <button className={`md:hidden ${scrolled ? 'text-gray-800' : 'text-white'}`} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="px-4 py-3 space-y-2">
            {links.map(l => (
              <button key={l.id} onClick={() => scrollTo(l.id)}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg font-medium">
                {l.label}
              </button>
            ))}
            <Link to="/login" className="block text-center bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700">
              Get Started →
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
