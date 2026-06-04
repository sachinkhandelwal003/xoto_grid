import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiArrowRight, FiMail, FiPhone, FiMapPin, FiPlay, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";

const Newpage = () => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [activeTutorial, setActiveTutorial] = useState(0);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [formErrors, setFormErrors] = useState({});
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeTab, setActiveTab] = useState("b2c"); // 'b2c' or 'b2b'

  const features = [
    {
      title: "AI-Powered Design",
      description: "Get personalized furniture recommendations based on your space and style preferences with our advanced AI algorithms.",
      icon: "🤖",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
      image: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
      title: "Augmented Reality",
      description: "Visualize furniture in your actual space before purchasing with our cutting-edge AR technology.",
      icon: "👁️",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
      title: "Price Comparison",
      description: "We scan thousands of retailers to find you the best deals on quality furniture.",
      icon: "💰",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
      title: "Style Matching",
      description: "Discover products that perfectly complement your existing decor and personal aesthetic.",
      icon: "🎨",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    }
  ];

  const b2cServices = [
    {
      title: "Personalized Recommendations",
      description: "AI-powered suggestions tailored to your unique style and space requirements.",
      icon: "🔍"
    },
    {
      title: "AR Room Visualization",
      description: "See how furniture will look in your home before you buy with our augmented reality tool.",
      icon: "📱"
    },
    {
      title: "Exclusive Member Discounts",
      description: "Access special pricing and early sales for registered users.",
      icon: "💎"
    }
  ];

  const b2bServices = [
    {
      title: "Bulk Order Solutions",
      description: "Special pricing and logistics support for large quantity orders.",
      icon: "📦"
    },
    {
      title: "White Label Options",
      description: "Custom branding solutions for resellers and property developers.",
      icon: "🏷️"
    },
    {
      title: "Corporate Design Packages",
      description: "Complete furnishing solutions for offices, hotels, and commercial spaces.",
      icon: "🏢"
    },
    {
      title: "API Integration",
      description: "Seamlessly integrate our product catalog with your business systems.",
      icon: "🔌"
    }
  ];

  const testimonials = [
    {
      quote: "This service completely transformed my living room. The AI suggestions were spot on!",
      author: "Sarah Johnson",
      role: "Interior Designer"
    },
    {
      quote: "Being able to visualize furniture in my home before buying saved me so much time and money.",
      author: "Michael Chen",
      role: "Homeowner"
    },
    {
      quote: "The price comparison feature helped me find the perfect dining set at 30% below retail.",
      author: "Emma Rodriguez",
      role: "First-time Buyer"
    }
  ];

  const tutorials = [
    {
      title: "Furniture Assembly Guide",
      description: "Learn how to assemble your new furniture like a pro with our step-by-step guide.",
      videoUrl: "https://example.com/video1.mp4",
      steps: [
        "Unpack all components carefully",
        "Identify and organize all parts",
        "Follow the numbered assembly sequence",
        "Use proper tools for tightening",
        "Check stability before use"
      ],
      thumbnail: "https://images.unsplash.com/photo-1583845112203-29329902330b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
      title: "Space Planning Basics",
      description: "Maximize your room's potential with professional space planning techniques.",
      videoUrl: "https://example.com/video2.mp4",
      steps: [
        "Measure your room dimensions",
        "Create a floor plan sketch",
        "Identify focal points",
        "Plan traffic flow",
        "Experiment with furniture arrangements"
      ],
      thumbnail: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
      title: "Lighting Installation",
      description: "DIY guide to installing modern lighting fixtures safely and effectively.",
      videoUrl: "https://example.com/video3.mp4",
      steps: [
        "Turn off power at the circuit breaker",
        "Remove old fixture carefully",
        "Connect wires properly (black to black, white to white)",
        "Secure fixture to junction box",
        "Install bulbs and test"
      ],
      thumbnail: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    }
  ];

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

  return (
    <div className="min-h-screen bg-white antialiased">
      {/* Hero Section */}
      <section className="relative w-full h-screen max-h-[90vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10" />
        <img
          className="absolute inset-0 w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
          alt="Furniture Showroom"
        />
        
        <div className="container mx-auto px-6 h-full flex items-end pb-20 md:items-center md:pb-0 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Transform Your Space <br className="hidden md:block" /> with Intelligent Design
            </h1>
            <p className="text-xl text-gray-200 mb-8 md:mb-12 max-w-lg">
              The future of furniture shopping is here. AI-powered recommendations, augmented reality previews, and exclusive deals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex gap-4">
                <Link to="/ecommerce/b2c/">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-[#C05A34] text-white font-medium rounded-lg hover:bg-[#a84c2c] transition-all flex items-center gap-2 shadow-lg"
                  >
                    For Consumers
                  </motion.button>
                </Link>
                <Link to="/ecommerce/b2b/">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/20 transition-all border border-white/20 shadow-lg"
                  >
                    For Businesses
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        >
          <div className="animate-bounce w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.div>
      </section>

      {/* B2B/B2C Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <span className="text-[#C05A34] font-semibold mb-2 block">OUR SOLUTIONS</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tailored Services For Every Need
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Whether you're furnishing a home or a commercial space, we have the perfect solution for you
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setActiveTab("b2c")}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${activeTab === "b2c" ? "bg-white shadow-sm text-[#C05A34]" : "text-gray-600 hover:text-gray-900"}`}
              >
                For Consumers
              </button>
              <button
                onClick={() => setActiveTab("b2b")}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${activeTab === "b2b" ? "bg-white shadow-sm text-[#C05A34]" : "text-gray-600 hover:text-gray-900"}`}
              >
                For Businesses
              </button>
            </div>
          </div>

          {/* B2C Services */}
          {activeTab === "b2c" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {b2cServices.map((service, index) => (
                <motion.div
                  key={`b2c-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                >
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* B2B Services */}
          {activeTab === "b2b" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {b2bServices.map((service, index) => (
                <motion.div
                  key={`b2b-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                >
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

 {/* Interior Design Consultation & DIY Tutorials Section */}
<section className="py-20 bg-gray-50">
  <div className="container mx-auto px-6">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: "-100px" }}
      className="text-center mb-16"
    >
      <span className="text-[#C05A34] font-semibold mb-2 block">DESIGN SERVICES</span>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Interior Design Consultation & Shopping Tutorials
      </h2>
      <p className="text-lg text-gray-600 max-w-3xl mx-auto">
        Get professional advice or learn how to use our advanced shopping tools
      </p>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Design Consultation */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
      >
        <div className="flex items-start gap-6">
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-lg text-3xl">
            ✨
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Professional Design Consultation</h3>
            <p className="text-gray-600 mb-6">
              Book a session with our certified interior designers to get personalized advice for your space. 
              We'll help you create a cohesive look that matches your style and budget.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowContactModal(true)}
              className="px-6 py-3 bg-[#C05A34] text-white font-medium rounded-lg hover:bg-[#a84c2c] transition-colors shadow-md"
            >
              Book a Consultation
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Shopping Tutorials */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
      >
        <div className="flex items-start gap-6">
          <div className="bg-blue-50 text-blue-600 p-4 rounded-lg text-3xl">
            🛒
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">E-Commerce Tutorials</h3>
            <p className="text-gray-600 mb-6">
              Master our innovative shopping tools with these interactive guides. Learn how to use AR viewing,
              style matching, and our AI shopping assistant.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  title: "AR Product Viewing",
                  description: "Learn how to visualize products in your space using AR",
                  videoUrl: "https://example.com/ar-tutorial.mp4",
                  steps: [
                    "Open the product page in our app",
                    "Tap the 'View in Room' button",
                    "Scan your space with your camera",
                    "Position and resize the product",
                    "View from different angles"
                  ],
                  thumbnail: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                },
                {
                  title: "Style Matching",
                  description: "Find products that match your existing decor",
                  videoUrl: "https://example.com/style-tutorial.mp4",
                  steps: [
                    "Upload a photo of your space",
                    "Our AI will analyze your style",
                    "Browse matching recommendations",
                    "Save items to your collection",
                    "Create cohesive room designs"
                  ],
                  thumbnail: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                },
                {
                  title: "AI Shopping Assistant",
                  description: "Get personalized product recommendations",
                  videoUrl: "https://example.com/ai-tutorial.mp4",
                  steps: [
                    "Answer a few style questions",
                    "Set your budget range",
                    "Receive curated suggestions",
                    "Refine with filters",
                    "Save your preferences"
                  ],
                  thumbnail: "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                }
              ].map((tutorial, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveTutorial(index);
                    setShowTutorialModal(true);
                  }}
                  className="cursor-pointer group"
                >
                  <div className="relative rounded-lg overflow-hidden h-32">
                    <img 
                      src={tutorial.thumbnail} 
                      alt={tutorial.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                        <FiPlay className="text-[#C05A34] text-xl" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <h4 className="font-medium text-white">{tutorial.title}</h4>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
</section>
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <span className="text-[#C05A34] font-semibold mb-2 block">OUR TECHNOLOGY</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Revolutionizing Home Design
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge technology with interior design expertise to create your perfect space
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  onMouseEnter={() => setActiveFeature(index)}
                  className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${activeFeature === index ? 'bg-gray-50 shadow-xl border border-gray-100' : 'bg-white hover:bg-gray-50'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`${feature.bgColor} ${feature.textColor} p-3 rounded-lg text-2xl`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className={`${feature.textColor} text-xl font-bold mb-2`}>{feature.title}</h3>
                      <p className="text-gray-700">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative h-96 rounded-2xl overflow-hidden shadow-xl"
            >
              <img 
                src={features[activeFeature].image} 
                alt={features[activeFeature].title}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent flex items-end p-6">
                <div>
                  <span className={`${features[activeFeature].textColor} font-semibold`}>Featured</span>
                  <h3 className="text-2xl font-bold text-white mt-1">{features[activeFeature].title}</h3>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

   

      {/* Contact Form Modal */}
      {showContactModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl max-w-md w-full p-8 shadow-2xl relative"
          >
            <button 
              onClick={() => setShowContactModal(false)} 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FiX className="h-6 w-6" />
            </button>
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Design Consultation</h3>
              <p className="text-gray-600 mt-2">Let us help you create your dream space</p>
            </div>
            
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C05A34] focus:border-transparent ${
                    formErrors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C05A34] focus:border-transparent ${
                    formErrors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Your Design Needs</label>
                <textarea
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C05A34] focus:border-transparent ${
                    formErrors.message ? "border-red-500" : "border-gray-300"
                  }`}
                  rows="4"
                  placeholder="Tell us about your space and style preferences..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                ></textarea>
                {formErrors.message && <p className="text-red-500 text-sm mt-1">{formErrors.message}</p>}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 bg-[#C05A34] text-white font-medium rounded-lg hover:bg-[#a84c2c] transition-colors shadow-md"
              >
                Request Consultation
              </motion.button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 text-gray-600 mb-3">
                <FiMail className="text-[#C05A34]" />
                <span>design@furnitureai.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 mb-3">
                <FiPhone className="text-[#C05A34]" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <FiMapPin className="text-[#C05A34]" />
                <span>123 Design Street, San Francisco</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Tutorial Video Modal */}
      {showTutorialModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl max-w-4xl w-full p-8 shadow-2xl relative"
          >
            <button 
              onClick={() => setShowTutorialModal(false)} 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FiX className="h-6 w-6" />
            </button>
            
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{tutorials[activeTutorial].title}</h3>
              <p className="text-gray-600">{tutorials[activeTutorial].description}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-black rounded-lg overflow-hidden aspect-video">
                {/* Video Player Placeholder */}
                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                  <div className="text-center">
                    <FiPlay className="mx-auto text-4xl mb-2" />
                    <p>Video Player</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-4">Step-by-Step Guide</h4>
                <ol className="space-y-3">
                  {tutorials[activeTutorial].steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="bg-[#C05A34] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
                
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h4 className="font-bold text-lg text-gray-900 mb-4">Need more help?</h4>
                  <p className="text-gray-600 mb-4">
                    If you're stuck or need professional assistance, our experts are ready to help.
                  </p>
                  <button
                    onClick={() => {
                      setShowTutorialModal(false);
                      setShowContactModal(true);
                    }}
                    className="px-4 py-2 bg-[#C05A34] text-white font-medium rounded-lg hover:bg-[#a84c2c] transition-colors shadow-sm"
                  >
                    Contact an Expert
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Newpage;