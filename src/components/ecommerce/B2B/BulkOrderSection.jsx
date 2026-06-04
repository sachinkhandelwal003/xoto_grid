import React from 'react';
import { motion } from 'framer-motion';
import { FaBoxes, FaPercentage, FaWarehouse, FaTruck } from 'react-icons/fa';

const bulkProducts = [
  {
    id: 1,
    name: "Modern Office Chairs",
    image: "https://m.media-amazon.com/images/I/71EAjan5FPL.jpg",
    moq: 50,
    priceTiers: [
      { min: 50, max: 99, price: "₹2,499" },
      { min: 100, max: 499, price: "₹2,199" },
      { min: 500, max: null, price: "₹1,899" }
    ],
    leadTime: "2-3 weeks",
    supplier: "Elite Office Solutions"
  },
  {
    id: 2,
    name: "Modular Sofa Sets",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShIPWIqU6vwTbvAIKSx0pAD_auk2fxbsbpvw&s",
    moq: 10,
    priceTiers: [
      { min: 10, max: 24, price: "₹18,999" },
      { min: 25, max: 49, price: "₹16,499" },
      { min: 50, max: null, price: "₹14,999" }
    ],
    leadTime: "4-5 weeks",
    supplier: "Luxury Living Manufacturers"
  },
  {
    id: 3,
    name: "Wooden Dining Tables",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjYcwa-SwblxyVKh8u9mrbGBm4OPZmp1aMcg&s",
    moq: 20,
    priceTiers: [
      { min: 20, max: 49, price: "₹9,999" },
      { min: 50, max: 99, price: "₹8,499" },
      { min: 100, max: null, price: "₹7,299" }
    ],
    leadTime: "3-4 weeks",
    supplier: "TimberCraft Furnishings"
  }
];

const BulkOrderSection = () => {
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
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Bulk Order Pricing</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Exclusive wholesale pricing based on order volume. The more you buy, the more you save.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {bulkProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="h-48 overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">MOQ: {product.moq}</span>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Volume Pricing:</h4>
                  <ul className="space-y-2">
                    {product.priceTiers.map((tier, i) => (
                      <li key={i} className="flex justify-between">
                        <span className="text-gray-600">
                          {tier.min}+ {tier.max ? `- ${tier.max}` : 'units'}
                        </span>
                        <span className="font-medium">{tier.price}/unit</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                  <div className="flex items-center gap-1">
                    <FaWarehouse className="text-gray-400" />
                    <span>{product.leadTime}</span>
                  </div>
                  <div className="text-gray-600">
                    Supplier: <span className="font-medium">{product.supplier}</span>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button className="bg-[#6C4DF6] text-white py-2 px-4 rounded-lg hover:bg-[#5b3de5] transition text-sm">
                    Request Quote
                  </button>
                  <button className="border border-[#6C4DF6] text-[#6C4DF6] py-2 px-4 rounded-lg hover:bg-[#6C4DF6] hover:text-white transition text-sm">
                    View Details
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
          <button className="bg-[#D26C44] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#c05a34] transition inline-flex items-center gap-2">
            <FaBoxes />
            View All Bulk Deals
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default BulkOrderSection;