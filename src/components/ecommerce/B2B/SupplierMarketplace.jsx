import React from 'react';
import { motion } from 'framer-motion';
import { FaBuilding, FaStar, FaCheckCircle, FaIndustry, FaRegHandshake } from 'react-icons/fa';

const suppliers = [
  {
    id: 1,
    name: "Elite Office Solutions",
    logo: "https://thumbs.dreamstime.com/b/green-verified-rubber-stamp-vector-illustration-isolated-white-background-90991065.jpg",
    rating: 4.8,
    products: "Office Furniture",
    since: 2012,
    certifications: ["ISO 9001", "GST Registered"],
    location: "Mumbai, India"
  },
  {
    id: 2,
    name: "Luxury Living Manufacturers",
    logo: "https://thumbs.dreamstime.com/b/green-verified-rubber-stamp-vector-illustration-isolated-white-background-90991065.jpg",
    rating: 4.6,
    products: "Premium Sofas & Sectionals",
    since: 2008,
    certifications: ["ISO 14001", "OEKO-TEX"],
    location: "Delhi, India"
  },
  {
    id: 3,
    name: "TimberCraft Furnishings",
    logo: "https://thumbs.dreamstime.com/b/green-verified-rubber-stamp-vector-illustration-isolated-white-background-90991065.jpg",
    rating: 4.9,
    products: "Solid Wood Furniture",
    since: 2005,
    certifications: ["FSC Certified", "Green Label"],
    location: "Bangalore, India"
  },
  {
    id: 4,
    name: "Modern Spaces Inc.",
    logo: "https://thumbs.dreamstime.com/b/green-verified-rubber-stamp-vector-illustration-isolated-white-background-90991065.jpg",
    rating: 4.7,
    products: "Contemporary Furniture",
    since: 2015,
    certifications: ["BIFMA Certified"],
    location: "Hyderabad, India"
  }
];

const SupplierMarketplace = () => {
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
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Verified Supplier Marketplace</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect directly with manufacturers and wholesalers of interior products
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {suppliers.map((supplier, index) => (
            <motion.div
              key={supplier.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="flex flex-col items-center mb-4">
                <div className="w-20 h-20 mb-3 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <img src={supplier.logo} alt={supplier.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-bold text-center text-gray-800">{supplier.name}</h3>
                <div className="flex items-center mt-1 text-yellow-500">
                  <FaStar />
                  <span className="ml-1 text-gray-700">{supplier.rating}</span>
                </div>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <FaIndustry className="mt-1 mr-2 text-[#6C4DF6]" />
                  <span>{supplier.products}</span>
                </div>
                <div className="flex items-start">
                  <FaBuilding className="mt-1 mr-2 text-[#6C4DF6]" />
                  <span>Est. {supplier.since} • {supplier.location}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {supplier.certifications.map((cert, i) => (
                    <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center">
                      <FaCheckCircle className="mr-1 text-xs" />
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
              
              <button className="w-full mt-6 bg-white border border-[#6C4DF6] text-[#6C4DF6] py-2 px-4 rounded-lg hover:bg-[#6C4DF6] hover:text-white transition flex items-center justify-center gap-2">
                <FaRegHandshake />
                Contact Supplier
              </button>
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
            Explore All Suppliers
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default SupplierMarketplace;