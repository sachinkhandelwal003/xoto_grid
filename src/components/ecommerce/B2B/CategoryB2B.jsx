import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaChair, FaCouch, FaBed, FaLightbulb, FaWarehouse, FaBuilding } from 'react-icons/fa';

const categories = [
  {
    id: 1,
    name: "Office Furniture",
    icon: <FaBuilding className="text-4xl" />,
    count: "1,200+ Products",
    color: "bg-blue-100 text-blue-800"
  },
  {
    id: 2,
    name: "Living Room",
    icon: <FaCouch className="text-4xl" />,
    count: "850+ Products",
    color: "bg-purple-100 text-purple-800"
  },
  {
    id: 3,
    name: "Bedroom Sets",
    icon: <FaBed className="text-4xl" />,
    count: "670+ Products",
    color: "bg-pink-100 text-pink-800"
  },
  {
    id: 4,
    name: "Dining & Kitchen",
    icon: <FaChair className="text-4xl" />,
    count: "520+ Products",
    color: "bg-green-100 text-green-800"
  },
  {
    id: 5,
    name: "Lighting",
    icon: <FaLightbulb className="text-4xl" />,
    count: "430+ Products",
    color: "bg-yellow-100 text-yellow-800"
  },
  {
    id: 6,
    name: "Commercial Grade",
    icon: <FaWarehouse className="text-4xl" />,
    count: "2,100+ Products",
    color: "bg-red-100 text-red-800"
  }
];

const CategoryB2B = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Browse by Category</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our wholesale product categories for businesses and contractors
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <Link 
                to={`/b2b/category/${category.id}`} 
                className={`block p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow ${category.color} bg-opacity-30 hover:bg-opacity-40 h-full`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${category.color} bg-opacity-30`}>
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{category.name}</h3>
                    <p className="text-gray-600">{category.count}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Starting from ₹1,299</span>
                  <span className="text-xs bg-white bg-opacity-70 px-2 py-1 rounded-full">MOQ: 10+</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryB2B;