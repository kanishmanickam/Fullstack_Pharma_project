import { 
  SiMongodb, 
  SiExpress, 
  SiReact, 
  SiNodedotjs, 
  SiTailwindcss,
  SiDocker,
  SiAmazonaws,
  SiPython
} from 'react-icons/si';

const TechStack = () => {
  const technologies = [
    {
      name: "MongoDB",
      icon: <SiMongodb className="text-6xl" />,
      color: "text-green-600",
      description: "NoSQL database for flexible document storage and fast queries"
    },
    {
      name: "Express.js",
      icon: <SiExpress className="text-6xl" />,
      color: "text-gray-700",
      description: "Lightweight Node.js framework for building RESTful APIs"
    },
    {
      name: "React",
      icon: <SiReact className="text-6xl" />,
      color: "text-blue-500",
      description: "Component-based UI library for building interactive interfaces"
    },
    {
      name: "Node.js",
      icon: <SiNodedotjs className="text-6xl" />,
      color: "text-green-700",
      description: "JavaScript runtime for scalable backend server development"
    },
    {
      name: "Tailwind CSS",
      icon: <SiTailwindcss className="text-6xl" />,
      color: "text-cyan-500",
      description: "Utility-first CSS framework for modern responsive design"
    },
    {
      name: "Python AI",
      icon: <SiPython className="text-6xl" />,
      color: "text-blue-600",
      description: "Machine learning engine for demand forecasting and analytics"
    },
    {
      name: "Docker",
      icon: <SiDocker className="text-6xl" />,
      color: "text-blue-600",
      description: "Container platform for consistent deployment across environments"
    },
    {
      name: "AWS Cloud",
      icon: <SiAmazonaws className="text-6xl" />,
      color: "text-orange-500",
      description: "Cloud infrastructure for reliable hosting and scalability"
    }
  ];

  return (
    <section id="techstack" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Technology Stack
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built with cutting-edge MERN stack technologies and modern development tools 
            for high performance, scalability, and reliability.
          </p>
        </div>

        {/* Tech Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {technologies.map((tech, index) => (
            <div
              key={index}
              className="bg-gray-50 p-8 rounded-xl hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center group hover:bg-white border border-gray-100"
            >
              <div className={`mb-4 ${tech.color} group-hover:scale-110 transition-transform duration-300`}>
                {tech.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {tech.name}
              </h3>
              <p className="text-sm text-gray-600">
                {tech.description}
              </p>
            </div>
          ))}
        </div>

        {/* MERN Stack Highlight */}
        <div className="mt-16 bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl p-10 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Why MERN Stack?
          </h3>
          <p className="text-lg text-white/90 max-w-3xl mx-auto mb-6">
            Full-stack JavaScript development enables seamless integration between frontend and backend, 
            faster development cycles, and excellent performance for modern web applications.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-white font-semibold">
            <span className="bg-white/20 px-6 py-2 rounded-full">Rapid Development</span>
            <span className="bg-white/20 px-6 py-2 rounded-full">Single Language Stack</span>
            <span className="bg-white/20 px-6 py-2 rounded-full">Highly Scalable</span>
            <span className="bg-white/20 px-6 py-2 rounded-full">Cloud-Ready</span>
            <span className="bg-white/20 px-6 py-2 rounded-full">Active Community</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechStack;
