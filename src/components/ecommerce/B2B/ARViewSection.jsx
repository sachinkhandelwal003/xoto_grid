import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowsAlt, FaCube, FaMobileAlt, FaExpand } from 'react-icons/fa';

const arProducts = [
  {
    id: 1,
    name: "Contemporary Sofa Set",
    image: "https://via.placeholder.com/300x300?text=Sofa+AR",
    category: "Living Room"
  },
  {
    id: 2,
    name: "Executive Office Desk",
    image: "https://via.placeholder.com/300x300?text=Desk+AR",
    category: "Office"
  },
  {
    id: 3,
    name: "Dining Table Collection",
    image: "https://via.placeholder.com/300x300?text=Dining+AR",
    category: "Dining"
  }
];

const ARViewSection = () => {
  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">AR Product Previews</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Visualize our products in your space before you buy with augmented reality
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {arProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="relative h-64 bg-gray-200">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <button className="bg-white text-[#6C4DF6] p-3 rounded-full shadow-lg">
                    <FaExpand className="text-xl" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                  <span className="bg-purple-100 text-[#6C4DF6] text-xs px-2 py-1 rounded">{product.category}</span>
                </div>
                
                <div className="flex items-center gap-4 mt-4">
                  <button className="flex-1 bg-[#6C4DF6] text-white py-2 px-4 rounded-lg hover:bg-[#5b3de5] transition flex items-center justify-center gap-2">
                    <FaMobileAlt />
                    View in AR
                  </button>
                  <button className="flex-1 border border-[#6C4DF6] text-[#6C4DF6] py-2 px-4 rounded-lg hover:bg-[#6C4DF6] hover:text-white transition flex items-center justify-center gap-2">
                    <FaCube />
                    3D View
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-[#241935] rounded-xl p-8 text-white"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:w-2/3">
              <h3 className="text-2xl font-bold mb-3">Try Our AR Experience</h3>
              <p className="mb-4">See how our furniture looks in your space before making bulk purchase decisions.</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <FaArrowsAlt className="text-xs" /> Move & Rotate
                </span>
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <FaMobileAlt /> Mobile Compatible
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="bg-white text-[#241935] font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition">
                Demo AR Viewer
              </button>
              
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ARViewSection;