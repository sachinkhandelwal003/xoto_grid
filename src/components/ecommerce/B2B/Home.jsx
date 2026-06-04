import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { FaBoxes, FaBuilding, FaChartLine, FaFileInvoiceDollar, FaUsers, FaSearchDollar } from 'react-icons/fa';
import { GiCommercialAirplane } from 'react-icons/gi';
import homeBanner from '../../../assets/img/ecommerce/ecoAr.png';
import ProductsB2B from './ProductsB2B';
import B2BFeatures from './B2BFeatures';
import BulkOrderSection from './BulkOrderSection';
import SupplierMarketplace from './SupplierMarketplace';
import ARViewSection from './ARViewSection';
import CategoryB2B from './CategoryB2B';

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { scale: 1.05, transition: { duration: 0.3 } },
};

const B2BEcommerce = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Main Banner */}
      <div className="relative h-[40rem] bg-gradient-to-r from-blue-100 to-purple-100 overflow-hidden">
        <div className="absolute inset-0 bg-white opacity-20"></div>
        <div className="relative z-10 h-full py-12 flex items-center">
          <div className="container mx-auto px-6 py-12 flex items-center">
            <div className="w-full md:w-1/2 lg:w-2/5">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-4 sm:mb-6 leading-tight">
                  Wholesale Interior Solutions
                </h1>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#6C4DF6] mb-4 sm:mb-6">
                  For Businesses & Contractors
                </h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-[#6C4DF6] text-white px-3 py-1 rounded-full text-sm">Bulk Discounts</span>
                  <span className="bg-[#D26C44] text-white px-3 py-1 rounded-full text-sm">Net 30 Terms</span>
                  <span className="bg-[#241935] text-white px-3 py-1 rounded-full text-sm">GST Billing</span>
                </div>
                <p className="text-gray-600 mb-6 sm:mb-8 text-lg">
                  Source directly from manufacturers with exclusive trade pricing, flexible credit, and AR previews for your projects.
                </p>
              </motion.div>
              <motion.div
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <button
                  // onClick={() => navigate('/sawtar/ecommerce/seller/b2b')}
                  className="bg-[#6C4DF6] hover:bg-[#5b3de5] text-white font-bold py-2 px-6 sm:py-3 sm:px-8 rounded-full transition duration-300 text-base sm:text-lg"
                >
                  Register You as business
                </button>
                <button
                  onClick={() => navigate('/b2b/rfq')}
                  className="border-2 border-[#6C4DF6] text-[#6C4DF6] hover:bg-[#6C4DF6] hover:text-white font-bold py-2 px-6 sm:py-3 sm:px-8 rounded-full transition duration-300 text-base sm:text-lg"
                >
                  Submit RFQ
                </button>
              </motion.div>
            </div>
            <motion.div
              className="hidden md:block absolute right-0 bottom-0 w-1/2 lg:w-1/2 h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <img
                src={homeBanner}
                alt="Modern interior design with elegant furniture"
                className="absolute right-0 bottom-0 h-[90%] object-contain object-right-bottom"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Business Verification Badge */}
      <div className="container mx-auto px-4 -mt-10 z-20 relative">
        <motion.div 
          className="bg-white rounded-xl shadow-xl p-6 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <FaBuilding className="text-green-600 text-2xl" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Business Account Required</h3>
                <p className="text-gray-600 text-sm">Verify your business to access wholesale pricing</p>
              </div>
            </div>
            <button className="bg-[#6C4DF6] text-white px-6 py-2 rounded-lg hover:bg-[#5b3de5] transition">
              Verify Now
            </button>
          </div>
        </motion.div>
      </div>

      {/* Category Section */}
      <CategoryB2B />

      {/* B2B Features */}
      <B2BFeatures />

      {/* Bulk Order Section */}
      <BulkOrderSection />

      {/* Supplier Marketplace */}
      <SupplierMarketplace />

      {/* AR View Section */}
      <ARViewSection />

      {/* Products Section */}
      <ProductsB2B />

      {/* RFQ Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="md:flex">
              <div className="md:w-1/2 bg-[#6C4DF6] p-8 text-white">
                <h2 className="text-3xl font-bold mb-4">Can't Find What You Need?</h2>
                <p className="mb-6">Submit a Request for Quotation and let suppliers compete for your business.</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-white bg-opacity-20 p-2 rounded-full">
                      <FaSearchDollar className="text-xl" />
                    </div>
                    <span>Get competitive quotes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-white bg-opacity-20 p-2 rounded-full">
                      <GiCommercialAirplane className="text-xl" />
                    </div>
                    <span>Direct from manufacturers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-white bg-opacity-20 p-2 rounded-full">
                      <FaFileInvoiceDollar className="text-xl" />
                    </div>
                    <span>Negotiate payment terms</span>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2 p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Submit RFQ</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Product/Service Needed</label>
                    <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#6C4DF6]" placeholder="e.g., Office chairs, 500 units" />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Quantity</label>
                    <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#6C4DF6]" placeholder="Estimated quantity needed" />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Delivery Timeline</label>
                    <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#6C4DF6]">
                      <option>Urgent (within 1 week)</option>
                      <option>Standard (2-4 weeks)</option>
                      <option>Flexible</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-[#6C4DF6] text-white py-3 rounded-lg hover:bg-[#5b3de5] transition">
                    Submit Request
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#6C4DF6] to-[#D26C44]">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to Transform Your Business Purchasing?
            </h2>
            <p className="text-lg md:text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of businesses saving 20-40% on their interior product purchases.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/b2b/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-white text-[#6C4DF6] font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Create Business Account
                </motion.button>
              </Link>
              <Link to="/b2b/demo">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-[#241935] text-white font-medium rounded-lg hover:bg-[#1a103d] transition-colors"
                >
                  Request Demo
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default B2BEcommerce;