import React from "react";
import {
  FaRobot,
  FaCubes,
  FaRulerCombined,
  FaPalette,
  FaBoxOpen,
  FaDollarSign,
  FaChalkboardTeacher,
  FaUserCheck,
  FaArrowRight,
} from "react-icons/fa";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

const features = [
  {
    icon: <FaRulerCombined size={24} />,
    title: "Live AR Visualization",
    description: "View furniture in your home live using augmented reality before purchasing.",
    bg: "bg-[#D26C44]/10",
  },
  {
    icon: <FaPalette size={24} />,
    title: "AI Style Matching",
    description: "Our AI suggests products that perfectly match your existing decor style.",
    bg: "bg-[#D26C44]/10",
  },
  {
    icon: <FaBoxOpen size={24} />,
    title: "Smart Price Comparison",
    description: "Automatically compares prices with Amazon, Flipkart, Myntra and other retailers.",
    bg: "bg-[#D26C44]/10",
  },
  {
    icon: <FaCubes size={24} />,
    title: "Virtual Try-On",
    description: "See how different materials and colors will look in your actual space.",
    bg: "bg-[#D26C44]/10",
  },
  {
    icon: <FaChalkboardTeacher size={24} />,
    title: "Instant Style Switching",
    description: "Change your entire room style with one click - modern, classic, or minimalist.",
    bg: "bg-[#D26C44]/10",
  },
  {
    icon: <FaUserCheck size={24} />,
    title: "Real-Time Availability",
    description: "Check stock availability across multiple stores instantly.",
    bg: "bg-[#D26C44]/10",
  },
];

const EcommerceFeatures = () => {
  const sectionRef = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacityBg = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

  const [activeFeature, setActiveFeature] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden bg-gray-950"
    >
      {/* Animated floating shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#D26C44]/20"
            initial={{
              x: Math.random() * 100,
              y: Math.random() * 100,
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              opacity: 0.1
            }}
            animate={{
              x: Math.random() * 100 - 50,
              y: Math.random() * 100 - 50,
              transition: {
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
          />
        ))}
      </div>

      {/* Main content container */}
      <div className="relative z-10 pt-24 pb-20 container mx-auto px-4">
        {/* Hero section */}
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-24">
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Transform Your <span className="text-[#D26C44]">Home</span> with <span className="text-[#D26C44]">AR</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Experience furniture shopping like never before. Our cutting-edge technology lets you visualize, customize, and purchase with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-[#D26C44] text-white font-medium rounded-lg shadow-lg hover:bg-[#c05a32] transition-colors"
              >
                Start AR Experience
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-transparent border-2 border-[#D26C44] text-[#D26C44] font-medium rounded-lg hover:bg-[#D26C44]/10 transition-colors"
              >
                Watch Demo
              </motion.button>
            </div>
          </motion.div>

          <motion.div 
            className="lg:w-1/2 relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative h-96 w-full rounded-3xl overflow-hidden shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="p-8 text-center">
                    <div className="mx-auto mb-6 flex items-center justify-center w-16 h-16 rounded-full bg-[#D26C44] text-white">
                      {features[activeFeature].icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{features[activeFeature].title}</h3>
                    <p className="text-gray-300">{features[activeFeature].description}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            <div className="flex justify-center mt-6 gap-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${activeFeature === index ? 'bg-[#D26C44]' : 'bg-gray-600'}`}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Features section */}
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1 bg-[#D26C44]/20 text-[#D26C44] rounded-full text-sm font-medium mb-4">
              INNOVATIVE FEATURES
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Redefining <span className="text-[#D26C44]">Furniture</span> Shopping
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our platform combines augmented reality, artificial intelligence, and real-time data to create the ultimate shopping experience.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`${feature.bg} p-8 rounded-2xl border border-gray-800 hover:border-[#D26C44]/50 transition-colors relative overflow-hidden group`}
                whileHover={{ y: -10 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-[#D26C44] text-white flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-300 mb-6">{feature.description}</p>
                  <motion.button
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 text-sm font-medium text-[#D26C44] hover:text-[#f58a5e] transition-colors"
                  >
                    Learn more <FaArrowRight size={12} />
                  </motion.button>
                </div>
                <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-[#D26C44] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats section */}
        <motion.div 
          className="mt-24 bg-gradient-to-r from-[#D26C44]/20 to-[#D26C44]/10 rounded-3xl p-8 md:p-12 border border-[#D26C44]/20 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "95%", label: "Customer Satisfaction" },
              { number: "10M+", label: "Products Visualized" },
              { number: "3D", label: "Augmented Reality" },
              { number: "24/7", label: "Support Available" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="p-4"
              >
                <div className="text-4xl font-bold text-[#D26C44] mb-2">{stat.number}</div>
                <div className="text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EcommerceFeatures;