import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiCheck, 
  FiX, 
  FiShoppingBag,
  FiLayers,
  FiUsers,
  FiMessageSquare,
  FiSmartphone,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiMail,
  FiPhone,
  FiMapPin,
  FiSearch
} from "react-icons/fi";
import {
  FaRobot,
  FaCubes,
  FaRulerCombined,
  FaPalette,
  FaBoxOpen,
  FaDollarSign,
  FaChalkboardTeacher,
  FaUserCheck,
  FaCouch,
  FaInfoCircle,
  FaPen,
  FaHeart,
  FaBars,
  FaUndo,
  FaShareAlt,
  FaTrash,
  FaEllipsisH
} from "react-icons/fa";
import { BsTruck, BsGraphUp } from 'react-icons/bs';
import { Link } from "react-router-dom";

// Color palette for the entire application
const colors = {
  primary: '#D26C44', // Rust orange (main brand color)
  secondary: '#6C4DF6', // Purple (secondary brand color)
  darkBg: '#1A103D', // Dark purple (for dark sections)
  lightBg: '#F8F5FF', // Very light purple (for light sections)
  textDark: '#241935', // Dark text
  textLight: '#FFFFFF', // White text
  accent: '#FFD166', // Yellow (for highlights)
  gray: '#E2E8F0', // Light gray (for borders)
  success: '#06D6A0', // Green (for success states)
  error: '#EF476F' // Red (for errors)
};

const Newpage1 = () => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [formErrors, setFormErrors] = useState({});
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeComparison, setActiveComparison] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Why Different Features
  const whyDifferentFeatures = [
    {
      icon: <FaRobot size={24} />,
      title: "AI-Powered Design",
      description: "Unlike generic e-commerce platforms, our AI creates personalized room designs based on your preferences and space.",
    },
    {
      icon: <FaRulerCombined size={24} />,
      title: "Augmented Reality Previews",
      description: "Visualize furniture in your actual room with AR, ensuring perfect fit and style before you buy.",
    },
    {
      icon: <FaPalette size={24} />,
      title: "Hyper-Personalized Shopping",
      description: "Our style quiz and AI recommendations tailor your shopping experience to your unique taste.",
    },
    {
      icon: <FiUsers size={24} />,
      title: "Hyperlocal Artisans",
      description: "Connect with local carpenters and designers for custom, made-to-order furniture and decor.",
    },
  ];

  // How It Works Steps
  const howItWorksSteps = [
    {
      step: 1,
      title: "Discover Your Style",
      description: "Take our fun style quiz or upload room photos to get AI-curated furniture and decor suggestions.",
      icon: <FaPalette size={24} />,
    },
    {
      step: 2,
      title: "Visualize in AR",
      description: "Use our AR tool to see how furniture fits in your space with real-time previews on your smartphone.",
      icon: <FaRulerCombined size={24} />,
    },
    {
      step: 3,
      title: "Shop Smart",
      description: "Compare prices, check availability, and get AI-driven budget recommendations for the best deals.",
      icon: <FaDollarSign size={24} />,
    },
    {
      step: 4,
      title: "Track & Customize",
      description: "Monitor your order in real-time, connect with local artisans, or book design consultations.",
      icon: <FaChalkboardTeacher size={24} />,
    },
  ];

  // Price Comparison Data
  const priceComparisons = [
    {
      product: "Modern Leather Sofa",
      sawtarPrice: "₹24,999",
      otherPrices: [
        { platform: "Amazon", price: "₹28,499", delivery: "3 days" },
        { platform: "Flipkart", price: "₹27,999", delivery: "5 days" },
        { platform: "Pepperfry", price: "₹26,500", delivery: "7 days" },
      ],
      savings: "Save up to ₹3,500",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      product: "Wooden Dining Table Set",
      sawtarPrice: "₹32,999",
      otherPrices: [
        { platform: "Amazon", price: "₹36,799", delivery: "5 days" },
        { platform: "Flipkart", price: "₹35,200", delivery: "7 days" },
        { platform: "Urban Ladder", price: "₹38,499", delivery: "10 days" },
      ],
      savings: "Save up to ₹5,500",
      image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      product: "Minimalist Bookshelf",
      sawtarPrice: "₹8,499",
      otherPrices: [
        { platform: "Amazon", price: "₹9,999", delivery: "2 days" },
        { platform: "Flipkart", price: "₹9,299", delivery: "4 days" },
        { platform: "Pepperfry", price: "₹10,499", delivery: "6 days" },
      ],
      savings: "Save up to ₹2,000",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
  ];

  // All Features grouped by category
  const featureCategories = [
    {
      title: "Visualization Tools",
      features: [
        {
          icon: <FaRulerCombined size={24} />,
          title: "Live AR Visualization",
          description: "View furniture in your home live using augmented reality before purchasing.",
          highlights: [
            "Real-time AR previews on your smartphone",
            "Accurate scaling for precise fit",
            "Try multiple products in your space",
          ],
        },
        {
          icon: <FaCubes size={24} />,
          title: "Virtual Try-On",
          description: "See how different materials and colors will look in your actual space.",
          highlights: [
            "Test multiple finishes",
            "Visualize textures in 3D",
            "Interactive material previews",
          ],
        },
      ]
    },
    {
      title: "Shopping Experience",
      features: [
        {
          icon: <FaPalette size={24} />,
          title: "AI Style Matching",
          description: "Our AI suggests products that perfectly match your existing decor style.",
          highlights: [
            "Personalized style recommendations",
            "Matches colors and textures",
            "Curated product lists",
          ],
        },
        {
          icon: <FaBoxOpen size={24} />,
          title: "Smart Price Comparison",
          description: "Automatically compares prices with Amazon, Flipkart, Myntra, and other retailers.",
          highlights: [
            "Real-time price tracking",
            "Best deal alerts",
            "Cross-platform price comparison",
          ],
        },
      ]
    },
    {
      title: "Design Services",
      features: [
        {
          icon: <FaChalkboardTeacher size={24} />,
          title: "Instant Style Switching",
          description: "Change your entire room style with one click - modern, classic, or minimalist.",
          highlights: [
            "One-click style transformations",
            "Explore modern, boho, minimalist themes",
            "Instant room redesigns",
          ],
        },
        {
          icon: <FiMessageSquare size={24} />,
          title: "Design Services & Learning",
          description: "Access professional design services and learn DIY skills through our platform.",
          highlights: [
            "Book interior designers directly",
            "AI-powered DIY tutorials",
            "Personalized style quiz",
            "WhatsApp/SMS design consultations",
          ],
        },
      ]
    }
  ];

  // Rotate through features for the hero section
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % whyDifferentFeatures.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Valid email is required";
    if (!formData.message.trim()) errors.message = "Message is required";
    return errors;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length === 0) {
      
      setShowContactModal(false);
      setFormData({ name: "", email: "", message: "" });
    } else {
      setFormErrors(errors);
    }
  };

  const nextComparison = () => {
    setActiveComparison((prev) => (prev + 1) % priceComparisons.length);
  };

  const prevComparison = () => {
    setActiveComparison((prev) => (prev - 1 + priceComparisons.length) % priceComparisons.length);
  };

  return (
    <div className="min-h-screen bg-white antialiased">
  

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1a103d] to-[#241935] py-24">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(#D26C44 1px, transparent 1px)",
          backgroundSize: "20px 20px"
        }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Transform Your <span className="text-[#D26C44]">Home</span> with <span className="text-[#6C4DF6]">AI</span>
              </h1>
              <p className="text-xl text-gray-200 mb-8">
                Experience furniture shopping like never before. Our cutting-edge technology lets you visualize, customize, and purchase with confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/designer">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-[#D26C44] text-white font-medium rounded-lg shadow-lg hover:bg-[#c05a32] transition-colors"
                  >
                    Start AR Experience
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowContactModal(true)}
                  className="px-8 py-4 bg-transparent border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
                >
                  Discover Your Style
                </motion.button>
              </div>
            </motion.div>

            <motion.div 
              className="lg:w-1/2 relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative h-96 w-full rounded-3xl overflow-hidden shadow-2xl border-2 border-[#6C4DF6]/30">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature}
                    className="absolute inset-0 bg-gradient-to-br from-[#2d1b4e] to-[#1a103d] flex items-center justify-center p-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="text-center">
                      <div className="mx-auto mb-6 flex items-center justify-center w-16 h-16 rounded-full bg-[#6C4DF6] text-white">
                        {whyDifferentFeatures[activeFeature].icon}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{whyDifferentFeatures[activeFeature].title}</h3>
                      <p className="text-gray-300">{whyDifferentFeatures[activeFeature].description}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
              
              <div className="flex justify-center mt-6 gap-2">
                {whyDifferentFeatures.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveFeature(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${activeFeature === index ? 'bg-[#6C4DF6]' : 'bg-gray-400'}`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Different Section */}
      <section className="py-20 bg-[#F8F5FF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-[#241935] mb-4"
            >
              Why <span className="text-[#6C4DF6]">Sawtar</span> Stands Out
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Unlike Amazon or Flipkart, Sawtar is your AI-powered interior design partner, blending cutting-edge technology with personalized shopping.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyDifferentFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white p-8 rounded-xl border border-gray-200 hover:border-[#6C4DF6]/50 transition-all shadow-md hover:shadow-lg"
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#6C4DF6] text-white mb-6 mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[#241935] mb-4 text-center">{feature.title}</h3>
                <p className="text-gray-600 text-center">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-[#241935] mb-4"
            >
              How <span className="text-[#D26C44]">Sawtar</span> Works
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Transform your space in four simple steps with our intuitive platform.
            </motion.p>
          </div>
          
          <div className="relative">
            <div className="hidden lg:block absolute left-0 right-0 top-1/2 h-1 bg-[#E2E8F0] -translate-y-1/2"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorksSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  className="relative z-10"
                >
                  <div className="bg-white p-8 rounded-xl border border-gray-200 hover:border-[#D26C44]/50 transition-all shadow-md h-full">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#D26C44] text-white mb-6 mx-auto relative">
                      {step.icon}
                      <div className="absolute -top-2 -right-2 bg-[#6C4DF6] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        {step.step}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-[#241935] mb-4 text-center">{step.title}</h3>
                    <p className="text-gray-600 text-center">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Price Comparison Section */}
      <section className="py-20 bg-[#F8F5FF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-[#241935] mb-4"
            >
              Smart <span className="text-[#6C4DF6]">Price</span> Comparison
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              See how much you can save compared to other platforms
            </motion.p>
          </div>
          
          <motion.div 
            className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-1/2 p-8">
                <div className="relative h-64 lg:h-full rounded-lg overflow-hidden mb-6">
                  <img 
                    src={priceComparisons[activeComparison].image} 
                    alt={priceComparisons[activeComparison].product}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="text-2xl font-bold text-white">{priceComparisons[activeComparison].product}</h3>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <button 
                    onClick={prevComparison}
                    className="p-2 rounded-full bg-[#6C4DF6]/20 text-[#6C4DF6] hover:bg-[#6C4DF6]/30 transition-colors"
                  >
                    <FiChevronLeft size={24} />
                  </button>
                  <div className="flex gap-2">
                    {priceComparisons.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveComparison(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${activeComparison === index ? 'bg-[#6C4DF6]' : 'bg-gray-300'}`}
                      />
                    ))}
                  </div>
                  <button 
                    onClick={nextComparison}
                    className="p-2 rounded-full bg-[#6C4DF6]/20 text-[#6C4DF6] hover:bg-[#6C4DF6]/30 transition-colors"
                  >
                    <FiChevronRight size={24} />
                  </button>
                </div>
              </div>
              
              <div className="lg:w-1/2 p-8 bg-[#241935]">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Platform</h3>
                    <h3 className="text-xl font-bold text-white">Price</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#6C4DF6]/10 rounded-lg border border-[#6C4DF6]/30">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-[#6C4DF6] flex items-center justify-center text-white mr-4">
                          <FiCheck />
                        </div>
                        <span className="font-medium text-white">Sawtar</span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#6C4DF6]">{priceComparisons[activeComparison].sawtarPrice}</p>
                        <p className="text-sm text-gray-300">Free delivery in 2-4 days</p>
                      </div>
                    </div>
                    
                    {priceComparisons[activeComparison].otherPrices.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white/10 rounded-lg border border-white/10">
                        <span className="font-medium text-gray-300">{item.platform}</span>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-300">{item.price}</p>
                          <p className="text-sm text-gray-400">{item.delivery} delivery</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 bg-[#FFD166]/10 rounded-lg border border-[#FFD166]/30">
                  <div className="flex items-center">
                    <BsGraphUp className="text-[#FFD166] mr-2" size={20} />
                    <span className="font-bold text-[#FFD166]">{priceComparisons[activeComparison].savings}</span>
                  </div>
                </div>
                
                <button className="mt-6 w-full py-3 bg-[#6C4DF6] text-white font-medium rounded-lg hover:bg-[#5b3de5] transition-colors">
                  View Product Details
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-[#241935] mb-4"
            >
              Complete <span className="text-[#D26C44]">Feature</span> Suite
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Everything you need to design, plan, and shop for your perfect interior space
            </motion.p>
          </div>
          
          {featureCategories.map((category, catIndex) => (
            <motion.div 
              key={catIndex}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <h3 className="text-2xl font-bold text-[#6C4DF6] mb-8 border-b border-[#6C4DF6]/30 pb-2">{category.title}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {category.features.map((feature, featIndex) => (
                  <motion.div
                    key={featIndex}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:border-[#6C4DF6]/50 transition-all"
                  >
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="bg-[#6C4DF6] text-white p-3 rounded-full mr-4">
                          {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold text-[#241935]">{feature.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.highlights.map((highlight, i) => (
                          <li key={i} className="flex items-start">
                            <FiCheck className="text-[#6C4DF6] mt-1 mr-2 flex-shrink-0" />
                            <span className="text-gray-600">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Designer Preview Section */}
      <section className="py-20 bg-[#241935]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Try Our <span className="text-[#D26C44]">AI Designer</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Experience our revolutionary room designer that combines AI recommendations with augmented reality previews.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-[#6C4DF6] rounded-lg p-3 text-white mr-4">
                    <FaRobot size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Recommendations</h3>
                    <p className="text-gray-300">Get personalized furniture suggestions based on your room dimensions and style preferences.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-[#6C4DF6] rounded-lg p-3 text-white mr-4">
                    <FaRulerCombined size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">AR Room Visualization</h3>
                    <p className="text-gray-300">See how furniture will look in your actual space before making a purchase.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-[#6C4DF6] rounded-lg p-3 text-white mr-4">
                    <FaPalette size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Style Matching</h3>
                    <p className="text-gray-300">Discover products that perfectly complement your existing decor and personal aesthetic.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <Link to="/designer">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-[#D26C44] text-white font-medium rounded-lg hover:bg-[#c05a32] transition-colors"
                  >
                    Launch Designer Tool
                  </motion.button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-[#6C4DF6]/30">
                <div className="aspect-w-16 aspect-h-9 bg-[#1A103D]">
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="mx-auto mb-6 flex items-center justify-center w-16 h-16 rounded-full bg-[#6C4DF6] text-white">
                        <FiSmartphone size={24} />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">AI Room Designer</h3>
                      <p className="text-gray-300">Drag and drop furniture into your room with AR previews</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#6C4DF6] to-[#D26C44]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Redesign Your Space?</h2>
            <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users transforming their homes with Sawtar's smart interior solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/designer">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-white text-[#6C4DF6] font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Start Shopping
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowContactModal(true)}
                className="px-8 py-3 bg-[#241935] text-white font-medium rounded-lg hover:bg-[#1a103d] transition-colors"
              >
                Contact Us
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Form Modal */}
      <AnimatePresence>
        {showContactModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#241935]">Get in Touch</h3>
                <button onClick={() => setShowContactModal(false)} className="text-gray-500 hover:text-[#D26C44]">
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="mb-4">
                  <label className="block text-[#241935] mb-2">Name</label>
                  <input
                    type="text"
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C4DF6] ${
                      formErrors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-[#241935] mb-2">Email</label>
                  <input
                    type="email"
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C4DF6] ${
                      formErrors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-[#241935] mb-2">Message</label>
                  <textarea
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C4DF6] ${
                      formErrors.message ? "border-red-500" : "border-gray-300"
                    }`}
                    rows="4"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                  {formErrors.message && <p className="text-red-500 text-sm mt-1">{formErrors.message}</p>}
                </div>
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="px-6 py-2 bg-[#6C4DF6] text-white rounded-md hover:bg-[#5b3de5] transition-colors"
                  >
                    Submit
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Newpage1;