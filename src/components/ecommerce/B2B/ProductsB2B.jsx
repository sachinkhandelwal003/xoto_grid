import React from 'react';
import { motion } from 'framer-motion';
import { FaBoxes, FaRegStar, FaStar, FaWarehouse, FaTruck } from 'react-icons/fa';

const products = [
  {
    id: 1,
    name: "Ergonomic Office Chair",
    image: "https://images.unsplash.com/photo-1586158291800-9773a7c3c0c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
    supplier: "Elite Office Solutions",
    moq: 10,
    price: "₹2,499",
    bulkPrice: "₹1,999 (50+ units)",
    rating: 4.7,
    leadTime: "2 weeks",
    arAvailable: true
  },
  {
    id: 2,
    name: "Modular Sofa Set (3+2+1)",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
    moq: 5,
    price: "₹24,999",
    bulkPrice: "₹21,499 (10+ units)",
    rating: 4.5,
    leadTime: "4 weeks",
    arAvailable: true
  },
  {
    id: 3,
    name: "Executive Desk (180cm)",
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
    supplier: "TimberCraft Furnishings",
    moq: 15,
    price: "₹12,999",
    bulkPrice: "₹10,999 (25+ units)",
    rating: 4.8,
    leadTime: "3 weeks",
    arAvailable: false
  },
  {
    id: 4,
    name: "Dining Table (6 Seater)",
    image: "https://images.unsplash.com/photo-1612372606404-0ab33e85e06b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
    supplier: "Modern Spaces Inc.",
    moq: 8,
    price: "₹18,499",
    bulkPrice: "₹15,999 (15+ units)",
    rating: 4.6,
    leadTime: "5 weeks",
    arAvailable: true
  }
];

const ProductsB2B = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Featured Products</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Popular items with bulk discounts available for business buyers
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                {product.arAvailable && (
                  <div className="absolute top-2 right-2 bg-[#6C4DF6] text-white text-xs px-2 py-1 rounded-full flex items-center">
                    <span>AR View</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-white text-gray-800 text-xs px-2 py-1 rounded-full">
                  MOQ: {product.moq}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">by {product.supplier}</p>
                
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    i < Math.floor(product.rating) ? 
                      <FaStar key={i} className="text-yellow-400 text-sm" /> : 
                      <FaRegStar key={i} className="text-gray-300 text-sm" />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Unit Price:</span>
                    <span className="font-bold">{product.price}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Bulk Price:</span>
                    <span className="text-[#6C4DF6] font-medium">{product.bulkPrice}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <FaWarehouse />
                    <span>{product.leadTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaTruck />
                    <span>Free shipping (50+ units)</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button className="bg-[#6C4DF6] text-white py-2 px-3 rounded-lg hover:bg-[#5b3de5] transition text-sm">
                    Add to RFQ
                  </button>
                  <button className="border border-[#6C4DF6] text-[#6C4DF6] py-2 px-3 rounded-lg hover:bg-[#6C4DF6] hover:text-white transition text-sm">
                    Details
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
          className="text-center"
        >
          <button className="bg-[#6C4DF6] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#5b3de5] transition inline-flex items-center gap-2">
            <FaBoxes />
            View All Products
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductsB2B;