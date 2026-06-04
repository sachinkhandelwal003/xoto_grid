import React from 'react';
import { motion } from 'framer-motion';
import image from "../../assets/img/ecommerce/home.png";

const Singleproduct = () => {
  // Sample product data
  const product = {
    name: "Nordic Modern Lounge Chair",
    price: 349.99,
    description: "Handcrafted with premium oak wood and organic linen upholstery. Ergonomic design for optimal comfort.",
    features: [
      "Solid oak wood frame",
      "Organic linen fabric",
      "Weight capacity: 300 lbs",
      "Assembly required (tools included)"
    ],
    rating: 4.8,
    reviews: 142,
    colors: ["#373572", "#E4F4FC", "#5A8F7B", "#FFD166"],
    sizes: ["S", "M", "L", "XL"]
  };

  return (
    <div className="relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-[#E4F4FC] opacity-20 blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-[#373572] opacity-10 blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-[#FFD166] opacity-15 blur-2xl"></div>
      </div>

      {/* Top clipped section with gradient */}
      <div className="relative h-24 bg-gradient-to-b from-[#373572] to-transparent">
        <div className="absolute bottom-0 left-0 w-full h-16 bg-white clip-path-wave"></div>
      </div>

      {/* Product Section */}
      <section className="relative z-10 py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center"
          >
            {/* Product Image with floating elements */}
            <div className="relative group">
              {/* Background shadow element */}
              <div className="absolute -inset-6 bg-gradient-to-br from-[#E4F4FC] to-[#373572] opacity-20 rounded-3xl blur-xl -z-10"></div>
              
              {/* Decorative border effect */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#373572] rounded-2xl transition-all duration-500 -z-5"></div>
              
              {/* Main product image */}
              <motion.div
                className="relative overflow-hidden rounded-2xl shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <img
                  src={image}
                  alt={product.name}
                  className="w-full h-auto object-cover"
                />
                {/* Floating elements */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute top-4 right-4 bg-[#373572] text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm bg-opacity-90"
                >
                  Best Seller
                </motion.div>
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute bottom-4 left-4 bg-white bg-opacity-80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md"
                >
                  <span className="text-xs text-gray-500">Handcrafted</span>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-1 text-xs text-gray-700">{product.rating}</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Color selection */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Color options</h3>
                <div className="flex space-x-2">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      className="w-8 h-8 rounded-full border-2 border-gray-200 hover:border-[#373572] transition-all"
                      style={{ backgroundColor: color }}
                      aria-label={`Color option ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="bg-white bg-opacity-80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-100">
              {/* Rating and reviews */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600">{product.rating} ({product.reviews} reviews)</span>
                </div>
                <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">In Stock</span>
              </div>

              {/* Product Title */}
              <h1 className="text-3xl md:text-4xl font-bold mb-3 text-[#373572]">{product.name}</h1>

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-bold text-[#373572]">${product.price}</span>
                <span className="ml-2 text-sm text-gray-500">+ Free Shipping</span>
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

              {/* Size selection */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Select size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size, index) => (
                    <button
                      key={index}
                      className="px-4 py-2 border border-gray-200 rounded-lg hover:border-[#373572] hover:bg-[#E4F4FC] transition-all"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Key Features</h3>
                <ul className="space-y-3">
                  {product.features.map((feature, index) => (
                    <motion.li 
                      key={index}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-start"
                    >
                      <svg className="flex-shrink-0 w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(55, 53, 114, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-[#373572] text-white px-8 py-4 rounded-lg font-medium text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 border-2 border-[#373572] text-[#373572] px-8 py-4 rounded-lg font-medium text-lg hover:bg-[#E4F4FC] transition-all"
                >
                  Buy Now
                </motion.button>
              </div>

              {/* Additional info */}
              <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Fast delivery
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  2-year warranty
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CSS for the clip-path */}
      <style jsx>{`
        .clip-path-wave {
          clip-path: path('M0,0 C150,50 350,0 500,50 C650,100 750,0 800,50 L800,100 L0,100 Z');
        }
      `}</style>
    </div>
  );
};

export default Singleproduct;