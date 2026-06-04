import React from 'react';
import { motion } from 'framer-motion';
import { FaBoxes, FaCreditCard, FaUsers, FaFileInvoiceDollar, FaShieldAlt, FaChartLine } from 'react-icons/fa';

const features = [
  {
    icon: <FaBoxes className="text-3xl text-[#6C4DF6]" />,
    title: "Bulk Order Discounts",
    description: "Volume pricing with tiered discounts for large quantity orders"
  },
  {
    icon: <FaCreditCard className="text-3xl text-[#6C4DF6]" />,
    title: "Flexible Payment Terms",
    description: "Net 30, 60, or 90 day payment options for qualified buyers"
  },
  {
    icon: <FaUsers className="text-3xl text-[#6C4DF6]" />,
    title: "Multi-User Accounts",
    description: "Create roles for purchasing, accounting, and approval workflows"
  },
  {
    icon: <FaFileInvoiceDollar className="text-3xl text-[#6C4DF6]" />,
    title: "GST Compliant Invoicing",
    description: "Automated tax invoices with your business details"
  },
  {
    icon: <FaShieldAlt className="text-3xl text-[#6C4DF6]" />,
    title: "Verified Suppliers",
    description: "All manufacturers and wholesalers are vetted for quality"
  },
  {
    icon: <FaChartLine className="text-3xl text-[#6C4DF6]" />,
    title: "Purchase Analytics",
    description: "Track spending by category, supplier, and project"
  }
];

const B2BFeatures = () => {
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
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Business Buying Made Simple</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tools and features designed specifically for procurement teams, contractors, and resellers
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              initial="hidden"
              whileInView="visible"
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default B2BFeatures;