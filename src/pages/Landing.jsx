import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import AISection from '../components/landing/AISection';
import UseCases from '../components/landing/UseCases';
import Architecture from '../components/landing/Architecture';
import TechStack from '../components/landing/TechStack';
import About from '../components/landing/About';
import Footer from '../components/landing/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <AISection />
        <UseCases />
        <Architecture />
        <TechStack />
        <About />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
